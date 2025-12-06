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
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined";

import LeftMenuBar, { drawerWidth } from "../../components/LeftMenuBar";
import type { Employee } from "./types/Employee";
import RoleChip from "./RoleChip";


// ================== MOCK DATA ==================
const employees: Employee[] = [
  {
    id: "NV001",
    fullName: "Nguyen Van An",
    email: "an.nguyen@cinemax.com",
    phone: "0901234567",
    salary: "15,000,000 VND",
    role: "Manager",
  },
  {
    id: "NV002",
    fullName: "Tran Thi Binh",
    email: "binh.tran@cinemax.com",
    phone: "0912345678",
    salary: "12,000,000 VND",
    role: "Ticket Seller",
  },
  {
    id: "NV003",
    fullName: "Le Van Cuong",
    email: "cuong.le@cinemax.com",
    phone: "0923456789",
    salary: "10,000,000 VND",
    role: "Technician",
  },
  {
    id: "NV004",
    fullName: "Pham Thi Dung",
    email: "dung.pham@cinemax.com",
    phone: "0934567890",
    salary: "11,000,000 VND",
    role: "Ticket Seller",
  },
  {
    id: "NV005",
    fullName: "Hoang Van Em",
    email: "em.hoang@cinemax.com",
    phone: "0945678901",
    salary: "9,000,000 VND",
    role: "Security",
  },
  {
    id: "NV006",
    fullName: "Vu Thi Phuong",
    email: "phuong.vu@cinemax.com",
    phone: "0956789012",
    salary: "13,000,000 VND",
    role: "Accountant",
  },
];


// ================== MAIN PAGE ==================

export default function EmployeesPage() {
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
              Employee Management
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

        {/* SEARCH BAR */}
        <Box sx={{ mb: 3, maxWidth: 600 }}>
          <TextField
            fullWidth
            placeholder="Search by name, employee ID, email..."
            variant="outlined"
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
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            border: "1px solid #f0f0f0",
            bgcolor: "#ffffff",
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: "#fafafa",
                  "& th": {
                    fontWeight: 600,
                    color: "text.secondary",
                    borderBottom: "1px solid #eee",
                  },
                }}
              >
                <TableCell>Employee ID</TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell>Salary</TableCell>
                <TableCell>Role</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {employees.map((emp) => (
                <TableRow
                  key={emp.id}
                  hover
                  sx={{
                    "& td": {
                      borderBottom: "1px solid #f3f4f6",
                    },
                  }}
                >
                  {/* ID */}
                  <TableCell>
                    <Typography variant="body2">{emp.id}</Typography>
                  </TableCell>

                  {/* Name */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {emp.fullName}
                    </Typography>
                  </TableCell>

                  {/* Email with icon */}
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <EmailOutlinedIcon
                        sx={{ fontSize: 18, color: "text.disabled" }}
                      />
                      <Typography variant="body2">
                        {emp.email}
                      </Typography>
                    </Stack>
                  </TableCell>

                  {/* Phone with icon */}
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PhoneInTalkOutlinedIcon
                        sx={{ fontSize: 18, color: "text.disabled" }}
                      />
                      <Typography variant="body2">{emp.phone}</Typography>
                    </Stack>
                  </TableCell>

                  {/* Salary */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ color: "#16A34A", fontWeight: 500 }}
                    >
                      $ {emp.salary}
                    </Typography>
                  </TableCell>

                  {/* Role chip */}
                  <TableCell>
                    <RoleChip role={emp.role} />
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
