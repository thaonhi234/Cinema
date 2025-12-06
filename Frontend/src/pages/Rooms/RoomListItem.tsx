import {
  Box,
  Typography,
  Stack,
  IconButton,
} from "@mui/material";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import { getTotalSeats } from "../utils/roomUtils";


type RoomPropType = {
    id: number;
    name: string;
    BranchName: string;
    BranchID: number;
    rows: number;
    seatsPerRow: number;
}
type RoomListItemProps = {
  room: RoomPropType;
  isActive: boolean;
  onClick: () => void;
};
export default function RoomListItem({ room, isActive, onClick }: RoomListItemProps) {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`Sửa phòng: ${room.name} (${room.BranchID}-${room.id})`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Bạn có chắc muốn xóa phòng ${room.name} không?`)) {
        alert(`Xóa phòng: ${room.name} (${room.BranchID}-${room.id})`);
    }
  };
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
          {room.BranchName} - {room.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {room.rows} rows · {room.seatsPerRow} seats/row ·{" "}
          {getTotalSeats(room)} total
        </Typography>
      </Box>

      <Stack direction="row" spacing={1}>
        <IconButton size="small" onClick={handleEdit}>
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" sx={{ color: "#DC2626" }} onClick={handleDelete}>
          <DeleteOutlineOutlinedIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );
}

