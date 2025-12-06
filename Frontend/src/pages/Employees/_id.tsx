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
import RoleChip from "./RoleChip"; // Đã sửa lỗi import

import { useState, useEffect } from "react";
import employeeApi from "../../api/employeeApi";
import { useDebounce } from 'use-debounce'; 

// ====================================================================
// KHAI BÁO TYPE (Đã chuyển từ user.ts)
// ====================================================================

// Kiểu dữ liệu Role (Phải bao gồm string để tránh lỗi casing từ backend)
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

// HÀM FORMAT TIỀN TỆ (Đã chuyển ra ngoài component)
const formatSalary = (salary: number) => {
    // Đây là dòng thêm "VND"
    return `${salary.toLocaleString('en-US', { maximumFractionDigits: 0 })}`; 
};
// ================== MAIN PAGE ==================

export default function EmployeesPage() {
    // Khởi tạo employees là mảng rỗng để tránh lỗi truy cập index
    const [employees, setEmployees] = useState<Employee[]>([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [debouncedSearchTerm] = useDebounce(searchTerm, 300); 

    // ... (Hàm fetchEmployees, handleDelete, handleEdit giữ nguyên)
    const fetchEmployees = async (searchQuery: string) => {
        try {
            setLoading(true);
            const res = await employeeApi.getAllEmployees(searchQuery); 
            // Đảm bảo dữ liệu nhận được đúng kiểu Employee[]
            setEmployees(res.data as Employee[]);
            setError(null);
        } catch (err: any) {
            console.error("Lỗi khi tải nhân viên:", err);
            setError(err.response?.data?.message || "Không thể tải danh sách nhân viên.");
        } finally {
            setLoading(false);
        }
    };

    // ... (Hàm useEffect giữ nguyên)
    useEffect(() => {
        fetchEmployees(debouncedSearchTerm);
    }, [debouncedSearchTerm]);
    
    
    const handleDelete = async (employeeId: string) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa nhân viên ID: ${employeeId} không?`)) return;

        try {
            await employeeApi.deleteEmployee(employeeId); 
            alert(`Xóa nhân viên ${employeeId} thành công!`);
            fetchEmployees(searchTerm); 
        } catch (err: any) {
            alert(`Xóa thất bại: ${err.response?.data?.message || 'Lỗi server.'}`);
        }
    };

    const handleEdit = (employee: Employee) => {
        alert(`Chức năng Sửa nhân viên ${employee.EmployeeID} chưa được triển khai. Dữ liệu: ${employee.FullName}`);
    };
    

    // 4. HIỂN THỊ TRẠNG THÁI (Giữ nguyên)
    if (loading) return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f6f7fb' }}>
            <LeftMenuBar />
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
            </Box>
        </Box>
    );

    if (error) return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f6f7fb' }}>
            <LeftMenuBar />
            <Box sx={{ flexGrow: 1, p: 4 }}>
                <Typography variant="h5" color="error">Lỗi Tải Dữ Liệu</Typography>
                <Typography color="error">{error}</Typography>
            </Box>
        </Box>
    );
    
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#f6f7fb",
      }}
    >
      {/* Sidebar */}
      <LeftMenuBar />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: 4,
          py: 4,
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            mb: 3,
            mt: 1,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Employee Management ({employees[0]?.BranchName || 'N/A'})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View employee information and roles
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
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

        {/* SEARCH BAR (Gắn state) */}
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
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 999,
                bgcolor: "#ffffff",
              },
            }}
          />
        </Box>

        {/* TABLE CARD */}
        <Paper
          elevation={0}
          // ... (Styles giữ nguyên)
        >
          <Table>
            {/* TABLE HEAD */}
            <TableHead>
                <TableRow>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>Full Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone Number</TableCell>
                    <TableCell>Salary</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell align="center">Actions</TableCell>
                </TableRow>
            </TableHead>

            <TableBody>
              {employees.map((emp) => (
                <TableRow
                  key={emp.EmployeeID}
                  hover
                  // ... (Styles giữ nguyên)
                >
                  {/* ID */}
                  <TableCell>
                    <Typography variant="body2">{emp.EmployeeID}</Typography>
                  </TableCell>

                  {/* Name */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {emp.FullName}
                    </Typography>
                  </TableCell>

                  {/* Email with icon */}
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <EmailOutlinedIcon
                        sx={{ fontSize: 18, color: "text.disabled" }}
                      />
                      <Typography variant="body2">
                        {emp.Email}
                      </Typography>
                    </Stack>
                  </TableCell>

                  {/* Phone with icon */}
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PhoneInTalkOutlinedIcon
                        sx={{ fontSize: 18, color: "text.disabled" }}
                      />
                      <Typography variant="body2">{emp.PhoneNumber}</Typography>
                    </Stack>
                  </TableCell>

                  {/* Salary */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ color: "#16A34A", fontWeight: 500 }}
                    >
                      $ {formatSalary(emp.Salary)}
                    </Typography>
                  </TableCell>

                  {/* Role chip */}
                  <TableCell>
                    <RoleChip role={emp.Role as EmployeeRole} />
                  </TableCell>
                  
                  {/* ACTIONS CELL */}
                  <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                            <IconButton size="small" onClick={() => handleEdit(emp)}>
                                <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" sx={{ color: "#DC2626" }} onClick={() => handleDelete(emp.EmployeeID)}>
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
    </Box>
  );
}