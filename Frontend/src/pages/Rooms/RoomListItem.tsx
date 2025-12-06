import {
  Box,
  Typography,
  Stack,
  IconButton,
} from "@mui/material";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import type { Room } from "./types/room";
import { getTotalSeats } from "../utils/roomUtils";


type RoomListItemProps = {
  room: Room;
  isActive: boolean;
  onClick: () => void;
};

export default function RoomListItem({ room, isActive, onClick }: RoomListItemProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        borderRadius: 4,
        border: isActive ? "2px solid #111827" : "1px solid #e5e7eb",
        bgcolor: isActive ? "#f3f4f6" : "#ffffff",
        px: 2.5,
        py: 1.5,
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        transition: "all 0.15s ease",
        "&:hover": {
          boxShadow: "0 8px 20px rgba(15,23,42,0.06)",
        },
      }}
    >
      <Box>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
          {room.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {room.rows} rows · {room.seatsPerRow} seats/row ·{" "}
          {getTotalSeats(room)} total
        </Typography>
      </Box>

      <Stack direction="row" spacing={1}>
        <IconButton size="small">
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" sx={{ color: "#DC2626" }}>
          <DeleteOutlineOutlinedIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );
}

