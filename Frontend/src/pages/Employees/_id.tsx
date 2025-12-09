import * as React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import LeftMenuBar from "../../components/LeftMenuBar";
import RoleChip from "./RoleChip";

import { useState, useEffect, useMemo } from "react";
import employeeApi from "../../api/employeeApi";
import { useDebounce } from "use-debounce";
import EmployeeModal from "./EmployeeModal";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";

// ====================================================================
// TYPES
// ====================================================================

type EmployeeRole =
  | "manager"
  | "staff"
  | "technician"
  | "security"
  | "accountant"
  | string;

interface Employee {
  EmployeeID: string;
  FullName: string;
  Email: string;
  PhoneNumber: string;
  Salary: number;
  Role: EmployeeRole;
  BranchName: string;
  BranchID: number;
}

// Format tiền
const formatSalary = (salary: number) => {
  return `${salary.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
};

type SortKey = 'EmployeeID' | 'FullName' | 'Email' | 'Salary' | 'Role' | 'BranchName';
type SortOrder = 'asc' | 'desc';

// ====================================================================
// COMPONENT CHÍNH
// ====================================================================
export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  // === SORT STATE ===
  const [sort, setSort] = useState<{ key: SortKey; order: SortOrder }>({
    key: 'EmployeeID',
    order: 'asc'
  });

  // Load danh sách
  const fetchEmployees = async (searchQuery: string) => {
    try {
      setLoading(true);
      const res = await employeeApi.getAllEmployees(searchQuery);
      setEmployees(res.data as Employee[]);
      setError(null);
    } catch (err: any) {
      console.error("Lỗi khi tải nhân viên:", err);
      setError(
        err.response?.data?.message || "Không thể tải danh sách nhân viên."
      );
    } finally {
      setLoading(false);
    }
  };

  // === SORTING FUNCTION ===
  const sortEmployees = (data: Employee[], key: SortKey, order: SortOrder): Employee[] => {
    return [...data].sort((a, b) => {
      let valA: any = a[key as keyof Employee];
      let valB: any = b[key as keyof Employee];

      if (key === 'Salary') {
        return order === 'asc' ? (a.Salary - b.Salary) : (b.Salary - a.Salary);
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      if (strA < strB) return order === 'asc' ? -1 : 1;
      if (strA > strB) return order === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortedEmployees = useMemo(() => {
    return sortEmployees(employees, sort.key, sort.order);
  }, [employees, sort]);

  const handleSort = (key: SortKey) => {
    setSort(prev => ({
      key,
      order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  useEffect(() => {
    fetchEmployees(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const handleDelete = async (employeeId: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa nhân viên ID: ${employeeId} không?`))
      return;

    try {
      await employeeApi.deleteEmployee(employeeId);
      alert(`Xóa nhân viên ${employeeId} thành công!`);
      fetchEmployees(searchTerm);
    } catch (err: any) {
      alert(`Xóa thất bại: ${err.response?.data?.message || "Lỗi server."}`);
    }
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setOpenModal(true);
  };

  const handleAdd = () => {
    setSelectedEmployee(null);
    setOpenModal(true);
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f6f7fb" }}>
        <LeftMenuBar />
        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <CircularProgress />
        </Box>
      </Box>
    );

  if (error)
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f6f7fb" }}>
        <LeftMenuBar />
        <Box sx={{ flexGrow: 1, p: 4 }}>
          <Typography variant="h5" color="error">Lỗi Tải Dữ Liệu</Typography>
          <Typography color="error">{error}</Typography>
        </Box>
      </Box>
    );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f6f7fb" }}>
      <LeftMenuBar />

      <Box component="main" sx={{ flexGrow: 1, px: 4, py: 4 }}>
        {/* HEADER */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" }, mb: 3, mt: 1 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Employee Management ({employees[0]?.BranchName || "N/A"})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View employee information and roles
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              px: 3,
              py: 1,
              fontWeight: 600,
              fontSize: 14,
              background: "linear-gradient(135deg,#A855F7,#F97316)",
              boxShadow: "0 10px 25px rgba(168,85,247,0.35)",
            }}
          >
            Add Employee
          </Button>
        </Box>

        {/* SEARCH BAR */}
        <Box sx={{ mb: 3, maxWidth: 600 }}>
          <TextField
            fullWidth
            placeholder="Search by name, employee ID, email..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.disabled" }} />
                </InputAdornment>
              ),
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 999, bgcolor: "#ffffff" } }}
          />
        </Box>

        {/* TABLE */}
        <Paper elevation={0}>
          <Table>
            {/* TABLE HEAD */}
            <TableHead>
              <TableRow>
                {([
                  { id: 'EmployeeID', label: 'Employee ID' },
                  { id: 'FullName', label: 'Full Name' },
                  { id: 'Email', label: 'Email' },
                  { id: 'PhoneNumber', label: 'Phone' },
                  { id: 'Salary', label: 'Salary' },
                  { id: 'Role', label: 'Role' },
                ] as { id: SortKey; label: string }[]).map(headCell => (
                  <TableCell
                    key={headCell.id}
                    onClick={() => handleSort(headCell.id)}
                    sx={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {headCell.label}
                      </Typography>
                      {sort.key === headCell.id && (
                        sort.order === 'asc'
                          ? <ArrowDropUpIcon fontSize="small" />
                          : <ArrowDropDownIcon fontSize="small" />
                      )}
                    </Stack>
                  </TableCell>
                ))}
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sortedEmployees.map(emp => (
                <TableRow key={emp.EmployeeID} hover>
                  <TableCell>{emp.EmployeeID}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600 }}>{emp.FullName}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <EmailOutlinedIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                      {emp.Email}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PhoneInTalkOutlinedIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                      {emp.PhoneNumber}
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ color: "#16A34A", fontWeight: 500 }}>
                    $ {formatSalary(emp.Salary)}
                  </TableCell>
                  <TableCell>
                    <RoleChip role={emp.Role} />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton size="small" onClick={() => handleEdit(emp)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{ color: "#DC2626" }}
                        onClick={() => handleDelete(emp.EmployeeID)}
                      >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      {/* MODAL */}
      <EmployeeModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        employee={selectedEmployee}
        onSuccess={() => fetchEmployees(searchTerm)}
      />
    </Box>
  );
}
