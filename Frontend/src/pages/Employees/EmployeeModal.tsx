import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Stack,
} from "@mui/material";
import { useState, useEffect } from "react";
import employeeApi from "../../api/employeeApi";

export default function EmployeeModal({
  open,
  onClose,
  employee,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  employee: any | null;
  onSuccess: () => void;
}) {
  const isEdit = !!employee;

  const [form, setForm] = useState<{
    FullName: string;
    Email: string;
    PhoneNumber: string;
    Salary: string;
    Role: "staff" | "manager";
    Sex: "F" | "M";
    BranchID: number;
    EPassword: "",
  }>({
    FullName: "",
    Email: "",
    PhoneNumber: "",
    Salary: "",
    Role: "staff",
    Sex: "F",
    BranchID: 1,
    EPassword: "",
  });

  useEffect(() => {
    if (employee) {
      setForm({
        FullName: employee.FullName,
        Email: employee.Email,
        PhoneNumber: employee.PhoneNumber,
        Salary: employee.Salary.toString(),
        Role: employee.Role,
        Sex: "F",
        BranchID: employee.BranchID,
        EPassword: "",
      });
    } else {
      setForm({
        FullName: "",
        Email: "",
        PhoneNumber: "",
        Salary: "",
        Role: "staff",
        Sex: "F",
        BranchID: 1,
        EPassword: "",
      });
    }
  }, [employee]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (isEdit) {
        await employeeApi.updateEmployee(employee.EmployeeID, {
          FullName: form.FullName,
          PhoneNumber: form.PhoneNumber,
          Salary: Number(form.Salary),
          Role: form.Role,
          BranchID: form.BranchID,
           Sex: form.Sex,
        });
      } else {
        await employeeApi.createEmployee({
          FullName: form.FullName,
          Email: form.Email,
          PhoneNumber: form.PhoneNumber,
          Salary: Number(form.Salary),
          Role: form.Role,
          Sex: form.Sex,
          BranchID: form.BranchID,
          EPassword: form.EPassword,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error occurred.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEdit ? "Update Employee" : "Add New Employee"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Full Name"
            name="FullName"
            value={form.FullName}
            onChange={handleChange}
            fullWidth
          />

          {!isEdit && (
            <>
              <TextField
                label="Email"
                name="Email"
                value={form.Email}
                onChange={handleChange}
                fullWidth
              />

              <TextField
                label="Password"
                name="EPassword"
                type="password"
                value={form.EPassword}
                onChange={handleChange}
                //placeholder="Auto or backend default"
                //disabled
                fullWidth
              />
            </>
          )}

          <TextField
            label="Phone Number"
            name="PhoneNumber"
            value={form.PhoneNumber}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Salary"
            name="Salary"
            type="number"
            value={form.Salary}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            select
            label="Role"
            name="Role"
            value={form.Role}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="staff">Staff</MenuItem>
            <MenuItem value="technician">Technician</MenuItem>
            <MenuItem value="security">Security</MenuItem>
            <MenuItem value="accountant">Accountant</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {isEdit ? "Save Changes" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
