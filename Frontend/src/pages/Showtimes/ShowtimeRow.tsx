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
import type { Showtime } from "./types/Showtime"

/* ============ ShowtimeRow COMPONENT ============ */

type ShowtimeRowProps = {
  showtime: Showtime;
};

export default function ShowtimeRow({ showtime }: ShowtimeRowProps) {
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
          <IconButton size="small">
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" sx={{ color: "#DC2626" }}>
            <DeleteOutlineOutlinedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
