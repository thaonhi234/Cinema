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


export const drawerWidth = 260;

const activeMenuItemSx = {
  borderRadius: 4,
  background: "linear-gradient(135deg,#A855F7,#F97316)",
  color: "#fff",
  boxShadow: "0 10px 25px rgba(168,85,247,0.35)",
  "& .MuiListItemIcon-root": { color: "#fff" },
};

function LeftMenuBar() {
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
            <ListItemButton sx={activeMenuItemSx}>
              <ListItemIcon>
                <DashboardOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>

            <ListItemButton sx={{ borderRadius: 4 }}>
              <ListItemIcon>
                <MovieOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Movies" />
            </ListItemButton>

            <ListItemButton sx={{ borderRadius: 4 }}>
              <ListItemIcon>
                <MeetingRoomOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Rooms" />
            </ListItemButton>

            <ListItemButton sx={{ borderRadius: 4 }}>
              <ListItemIcon>
                <EventOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Showtimes" />
            </ListItemButton>

            <ListItemButton sx={{ borderRadius: 4 }}>
              <ListItemIcon>
                <PeopleAltOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Employees" />
            </ListItemButton>
          </List>
        </Box>

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