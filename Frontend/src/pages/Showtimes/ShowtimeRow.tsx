import {
  Typography,
  Stack,
  TableRow,
  TableCell,
  IconButton,
} from "@mui/material";
import AvailabilityBar from "./AvailabilityBar";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import type { ShowtimeDisplay } from "./_id"; // <-- Sửa import
/* ============ ShowtimeRow COMPONENT ============ */

type ShowtimeRowProps = {
  showtime: ShowtimeDisplay;
  onDelete: (id: number) => void; // <-- Thêm hàm delete
};

export default function ShowtimeRow({ showtime, onDelete }: ShowtimeRowProps) {
  const handleEdit = () => {
    alert(`Chức năng Sửa suất chiếu ID: ${showtime.id} chưa được triển khai.`);
  };
  return (
    <TableRow
      hover
      sx={{
        "& td": {
          borderBottom: "1px solid #f3f4f6",
        },
      }}
    >
      {/* MOVIE */}
      <TableCell>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.3 }}>
          {showtime.movieTitle}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {showtime.runtimeMin} min
        </Typography>
      </TableCell>

      {/* ROOM */}
      <TableCell>
        <Typography variant="body2">{showtime.room}</Typography>
      </TableCell>

      {/* DATE */}
      <TableCell>
        <Typography variant="body2">{showtime.date}</Typography>
      </TableCell>

      {/* TIME */}
      <TableCell>
        <Typography variant="body2">{showtime.time}</Typography>
      </TableCell>

      {/* PRICE */}
      <TableCell>
        <Typography variant="body2">{`$${showtime.priceUSD}`}</Typography>
      </TableCell>

      {/* AVAILABILITY */}
      <TableCell>
        <AvailabilityBar
          soldSeats={showtime.soldSeats}
          totalSeats={showtime.totalSeats}
        />
      </TableCell>

      {/* ACTIONS */}
      <TableCell align="center">
        <Stack direction="row" spacing={1} justifyContent="center">
          <IconButton size="small" onClick={handleEdit}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" sx={{ color: "#DC2626" }} onClick={() => onDelete(showtime.id)}>
            <DeleteOutlineOutlinedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
