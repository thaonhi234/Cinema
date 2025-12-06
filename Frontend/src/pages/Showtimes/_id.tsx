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
  CircularProgress,
} from "@mui/material";

import MovieFilterOutlinedIcon from "@mui/icons-material/MovieFilterOutlined";
import TodayOutlinedIcon from "@mui/icons-material/Today";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

import LeftMenuBar from "../../components/LeftMenuBar";

import ShowtimeRow from "./ShowtimeRow";
import { useState, useEffect } from "react";
import showtimeApi from "../../api/showtimeApi"; // API Service
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export type Showtime = {
  TimeID: number;
  MovieName: string;
  RunTimeMin: number;
  RoomType: string;
  RoomID: number;
  BranchID: number;
  Day: string; // YYYY-MM-DD
  StartTime: string; // HH:mm:ss
  EndTime: string;
  Price: number;
  TicketsSold: number;
  TotalSeats: number;
};
export type ShowtimeDisplay = {
    id: number;
    movieTitle: string;
    runtimeMin: number;
    room: string;
    date: string;
    time: string; 
    priceUSD: number;
    soldSeats: number;
    totalSeats: number;
}

export default function ShowtimesPage() {
  const navigate = useNavigate();
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Lọc theo ngày hiện tại mặc định
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // 1. FETCH DATA TỪ BACKEND
  const fetchShowtimes = async () => {
    try {
        setLoading(true);
        // API gọi GET /api/showtimes?date=YYYY-MM-DD (BranchID được lấy từ Token)
        const res = await showtimeApi.getAllShowtimes(selectedDate); 
        
        setShowtimes(res.data);
        setError(null);
    } catch (err: any) {
        console.error("Lỗi khi tải suất chiếu:", err);
        setError(err.response?.data?.message || "Không thể tải danh sách suất chiếu.");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowtimes();
  }, [selectedDate]); // Chạy lại khi ngày được chọn thay đổi

  // 2. Format dữ liệu từ BE sang FE Display
  const formattedShowtimes: ShowtimeDisplay[] = showtimes.map(st => ({
    
    id: st.TimeID,
    movieTitle: st.MovieName,
    runtimeMin: st.RunTimeMin,
    room: `${st.RoomType} ${st.RoomID}`, // Ví dụ: "IMAX 1"
    date: st.Day,
    time: st.StartTime, // Chỉ lấy HH:MM
    priceUSD: st.Price, 
    soldSeats: st.TicketsSold,
    totalSeats: st.TotalSeats,
  }));
  
  // 3. Handle Loading/Error States
  if (loading) return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f6f7fb' }}>
          <LeftMenuBar />
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress />
              <Typography variant="h6" sx={{ ml: 2 }}>Đang tải lịch chiếu...</Typography>
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
  
  // 4. Handle Actions (Placeholder - Cần tích hợp API Delete)
  const handleDelete = async (timeId: number) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa suất chiếu ID: ${timeId} không?`)) return;
    try {
        await showtimeApi.deleteShowtime(timeId);
        alert("Xóa thành công!");
        fetchShowtimes(); // Tải lại dữ liệu
    } catch (err: any) {
        alert(`Xóa thất bại: ${err.response?.data?.message || 'Lỗi server.'}`);
    }
  }
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
              value={selectedDate} // Gắn giá trị vào state
              onChange={(e) => setSelectedDate(e.target.value)}
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
              {formattedShowtimes.map((st) => (
                <ShowtimeRow key={st.id} showtime={st} onDelete={handleDelete} />
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Box>
  );
}

