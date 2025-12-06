import {
  Avatar,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";

import MovieFilterOutlinedIcon from "@mui/icons-material/MovieFilterOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import MovieOutlinedIcon from "@mui/icons-material/MovieOutlined";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from "react-router-dom"; // <-- Import navigate
import authApi from "../../api/authApi"; // <-- Import authApi

export const drawerWidth = 260;

const activeMenuItemSx = {
  borderRadius: 4,
  background: "linear-gradient(135deg,#A855F7,#F97316)",
  color: "#fff",
  boxShadow: "0 10px 25px rgba(168,85,247,0.35)",
  "& .MuiListItemIcon-root": { color: "#fff" },
};
const menuItems = [
    { label: "Dashboard", icon: <DashboardOutlinedIcon />, path: "/dashboard" },
    { label: "Movies", icon: <MovieOutlinedIcon />, path: "/movies" },
    { label: "Rooms", icon: <MeetingRoomOutlinedIcon />, path: "/rooms" },
    { label: "Showtimes", icon: <EventOutlinedIcon />, path: "/showtimes" },
    { label: "Employees", icon: <PeopleAltOutlinedIcon />, path: "/employees" },
];
function LeftMenuBar() {
  const navigate = useNavigate();
  const location = useLocation();
    // HÀM XỬ LÝ LOGOUT
    const handleLogout = async () => {
        try {
            // 1. Gọi API Backend (đã được tạo ở bước trước)
            await authApi.logout(); 

            // 2. Vô hiệu hóa quyền truy cập bằng cách XÓA TOKEN
            localStorage.removeItem("token");
            
            // 3. Điều hướng về trang Login
            navigate("/"); 
        } catch (error) {
            // Log lỗi, nhưng vẫn xóa token và redirect
            console.error("Lỗi khi đăng xuất:", error);
            localStorage.removeItem("token");
            navigate("/");
        }
    };
    const handleNavigation = (path: string) => {
        navigate(path);
    };

    // Xác định xem mục nào đang active
    const isDashboardActive = location.pathname === '/' || location.pathname === '/dashboard';
    return (
        <Box
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          bgcolor: "#ffffff",
          borderRight: "1px solid #ececec",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Logo + title */}
        <Box
          sx={{
            p: 3,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 3,
              background: "linear-gradient(135deg,#A855F7,#F97316)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 25px rgba(168,85,247,0.45)",
            }}
          >
            <MovieFilterOutlinedIcon sx={{ color: "white" }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              CineMax
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Admin Panel
            </Typography>
          </Box>
        </Box>

        {/* Menu label */}
        <Box sx={{ px: 3, pb: 1 }}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ letterSpacing: 1 }}
          >
            MENU
          </Typography>
        </Box>

        {/* Menu items */}
        <Box sx={{ px: 2 }}>
          <List sx={{ gap: 1, display: "flex", flexDirection: "column" }}>
            {menuItems.map((item) => (
                <ListItemButton 
                    key={item.label}
                    // Kiểm tra và áp dụng style active
                    sx={location.pathname === item.path || (item.path === '/dashboard' && isDashboardActive) ? activeMenuItemSx : { borderRadius: 4 }} 
                    onClick={() => handleNavigation(item.path)} // <-- Gắn chức năng điều hướng
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
            ))}
          </List>
        </Box>
        <Box sx={{ px: 2, mt: 1 }}>
            <ListItemButton 
                onClick={handleLogout} // <-- Gắn hàm Logout
                sx={{ 
                    borderRadius: 4, 
                    color: 'error.main', // Màu đỏ cho nút Logout
                    '&:hover': { bgcolor: 'error.light', color: '#fff' },
                    '& .MuiListItemIcon-root': { color: 'error.main' },
                    '&:hover .MuiListItemIcon-root': { color: '#fff' },
                }}
            >
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
        </Box>
        {/* === KẾT THÚC NÚT LOGOUT === */}
        {/* Bottom user card */}
        <Box sx={{ mt: "auto", p: 2 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              p: 2,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              bgcolor: "#f7f3ff",
            }}
          >
            <Avatar
              sx={{
                background: "linear-gradient(135deg,#A855F7,#F97316)",
              }}
            >
              A
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Admin User
              </Typography>
              <Typography variant="caption" color="text.secondary">
                admin@cinemax.com
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    );
} 

export default LeftMenuBar;