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

import MovieFilterOutlinedIcon from "@mui/icons-material/MovieFilterOutlined";
import TodayOutlinedIcon from "@mui/icons-material/Today";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

import LeftMenuBar from "../../components/LeftMenuBar";
import type { Showtime } from "./types/Showtime";
import ShowtimeRow from "./ShowtimeRow";


/* ============ TYPES & MOCK DATA ============ */
const showtimes: Showtime[] = [
  {
    id: 1,
    movieTitle: "Stellar Odyssey",
    runtimeMin: 148,
    room: "Royal Hall A",
    date: "2025-12-02",
    time: "10:00",
    priceUSD: 12,
    soldSeats: 61,
    totalSeats: 120,
  },
  {
    id: 2,
    movieTitle: "Stellar Odyssey",
    runtimeMin: 148,
    room: "Royal Hall A",
    date: "2025-12-02",
    time: "13:30",
    priceUSD: 12,
    soldSeats: 22,
    totalSeats: 120,
  },
  {
    id: 3,
    movieTitle: "Stellar Odyssey",
    runtimeMin: 148,
    room: "Gold Screen B",
    date: "2025-12-02",
    time: "16:00",
    priceUSD: 15,
    soldSeats: 53,
    totalSeats: 80,
  },
  {
    id: 4,
    movieTitle: "Stellar Odyssey",
    runtimeMin: 148,
    room: "Premium C",
    date: "2025-12-02",
    time: "19:30",
    priceUSD: 18,
    soldSeats: 130,
    totalSeats: 168,
  },
  {
    id: 5,
    movieTitle: "Stellar Odyssey",
    runtimeMin: 148,
    room: "IMAX Theater",
    date: "2025-12-02",
    time: "21:00",
    priceUSD: 22,
    soldSeats: 40,
    totalSeats: 240,
  },
  {
    id: 6,
    movieTitle: "The Last Symphony",
    runtimeMin: 132,
    room: "Royal Hall A",
    date: "2025-12-02",
    time: "11:00",
    priceUSD: 12,
    soldSeats: 95,
    totalSeats: 120,
  },
  {
    id: 7,
    movieTitle: "The Last Symphony",
    runtimeMin: 132,
    room: "Gold Screen B",
    date: "2025-12-02",
    time: "14:30",
    priceUSD: 15,
    soldSeats: 46,
    totalSeats: 80,
  },
  {
    id: 8,
    movieTitle: "The Last Symphony",
    runtimeMin: 132,
    room: "Premium C",
    date: "2025-12-02",
    time: "18:00",
    priceUSD: 18,
    soldSeats: 43,
    totalSeats: 168,
  },
];

/* ============ MAIN PAGE ============ */

export default function ShowtimesPage() {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#f6f7fb",
      }}
    >
      <LeftMenuBar />

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
              Showtime Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Schedule and manage movie showtimes
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<MovieFilterOutlinedIcon />}
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
            Add Showtime
          </Button>
        </Box>

        {/* FILTER BAR */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 999,
            border: "1px solid #f0f0f0",
            bgcolor: "#ffffff",
            px: 2,
            py: 1.5,
            mb: 3,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Button
              startIcon={<MovieFilterOutlinedIcon />}
              variant="contained"
              size="small"
              sx={{
                borderRadius: 999,
                textTransform: "none",
                bgcolor: "#111827",
                "&:hover": { bgcolor: "#0f172a" },
              }}
            >
              All Movies
            </Button>

            <Button
              startIcon={<TodayOutlinedIcon />}
              variant="outlined"
              size="small"
              sx={{
                borderRadius: 999,
                textTransform: "none",
                borderColor: "#e5e7eb",
                bgcolor: "#ffffff",
              }}
            >
              Today
            </Button>

            <TextField
              size="small"
              placeholder="mm/dd/yyyy"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthOutlinedIcon
                      sx={{ fontSize: 18, color: "text.disabled" }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                minWidth: 160,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 999,
                  bgcolor: "#ffffff",
                  height: 36,
                },
              }}
            />
          </Stack>
        </Paper>

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
                <TableCell>Movie</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Availability</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {showtimes.map((st) => (
                <ShowtimeRow key={st.id} showtime={st} />
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Box>
  );
}

