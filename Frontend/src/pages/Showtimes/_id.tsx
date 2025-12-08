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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem
} from "@mui/material";

import MovieFilterOutlinedIcon from "@mui/icons-material/MovieFilterOutlined";
import TodayOutlinedIcon from "@mui/icons-material/Today";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

import LeftMenuBar from "../../components/LeftMenuBar";
import ShowtimeRow from "./ShowtimeRow";
import { useState, useEffect } from "react";
import showtimeApi from "../../api/showtimeApi";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

// Types matching Backend
export type Showtime = {
  TimeID: number;
  MovieName: string;
  RunTime: number;
  RuntimeMinutes: number;
  RoomType: string;
  RoomID: number;
  BranchID: number;
  Day: string;
  StartTime: string;
  EndTime: string;
  Price: number;
  TicketsSold: number;
  TotalSeats: number;
};

// Types for Display
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

  // Filter Date (Default Today)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // --- 1. MODAL STATE & FORM DATA ---
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    MovieID: "",
    RoomID: "",
    StartTime: "",
    EndTime: "",
    Format: "2D"
  });

  // --- 2. CREATE HANDLER ---
  const handleCreate = async () => {
    // Validation
    if (!formData.MovieID || !formData.RoomID || !formData.StartTime || !formData.EndTime) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      // Prepare Payload
      const payload = {
        ...formData,
        BranchID: 1, 
        Day: selectedDate, 
        MovieID: parseInt(formData.MovieID),
        RoomID: parseInt(formData.RoomID),
        
        // 👇 SỬA Ở ĐÂY: Giữ nguyên, KHÔNG CẦN cộng thêm ":00"
        StartTime: formData.StartTime, 
        EndTime: formData.EndTime,
        
        FName: formData.Format, 
        TimeID: 0 
      };

      // Call API
      // @ts-ignore
      await showtimeApi.createShowtime(payload);
      
      alert("Thêm suất chiếu thành công!");
      setOpenModal(false);
      
      // Reset Form
      setFormData({
        MovieID: "", RoomID: "", StartTime: "", EndTime: "", Format: "2D"
      });
      
      fetchShowtimes(); 
    } catch (err: any) {
      console.error(err);
      const message = err.response?.data?.message || "Lỗi khi thêm suất chiếu";
      alert(`Thất bại: ${message}`);
    }
  };

  // --- 3. FETCH DATA ---
  const fetchShowtimes = async () => {
    try {
      setLoading(true);
      const res = await showtimeApi.getAllShowtimes(selectedDate);
      setShowtimes(res.data);
      setError(null);
    } catch (err: any) {
      console.error("Error loading showtimes:", err);
      setError(err.response?.data?.message || "Không thể tải danh sách suất chiếu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowtimes();
  }, [selectedDate]);

  // --- 4. FORMAT DATA ---
  const formattedShowtimes: ShowtimeDisplay[] = showtimes.map(st => ({
    id: st.TimeID,
    movieTitle: st.MovieName,
    runtimeMin: st.RuntimeMinutes || 0,
    room: `${st.RoomType} ${st.RoomID}`,
    date: st.Day,
    time: st.StartTime,
    priceUSD: st.Price,
    soldSeats: st.TicketsSold,
    totalSeats: st.TotalSeats,
  }));

  // --- 5. DELETE HANDLER ---
  const handleDelete = async (timeId: number) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa suất chiếu ID: ${timeId}?`)) return;
    try {
      await showtimeApi.deleteShowtime(timeId);
      alert("Xóa thành công!");
      fetchShowtimes();
    } catch (err: any) {
      alert(`Xóa thất bại: ${err.response?.data?.message || 'Lỗi server.'}`);
    }
  }

  // --- RENDER ---
  if (loading) return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f6f7fb' }}>
      <LeftMenuBar />
      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Đang tải...</Typography>
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
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f6f7fb" }}>
      <LeftMenuBar />

      <Box component="main" sx={{ flexGrow: 1, px: 4, py: 4 }}>

        {/* HEADER */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" }, mb: 3, mt: 1 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Showtime Management</Typography>
            <Typography variant="body2" color="text.secondary">Schedule and manage movie showtimes</Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<MovieFilterOutlinedIcon />}
            onClick={() => setOpenModal(true)}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              px: 3, py: 1,
              fontWeight: 600, fontSize: 14,
              background: "linear-gradient(135deg,#A855F7,#F97316)",
              boxShadow: "0 10px 25px rgba(168,85,247,0.35)",
            }}
          >
            Add Showtime
          </Button>
        </Box>

        {/* FILTER BAR */}
        <Paper elevation={0} sx={{ borderRadius: 999, border: "1px solid #f0f0f0", bgcolor: "#ffffff", px: 2, py: 1.5, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Button
              startIcon={<MovieFilterOutlinedIcon />}
              variant="contained"
              size="small"
              sx={{ borderRadius: 999, textTransform: "none", bgcolor: "#111827", "&:hover": { bgcolor: "#0f172a" } }}
            >
              All Movies
            </Button>

            <Button
              startIcon={<TodayOutlinedIcon />}
              variant="outlined"
              size="small"
              onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
              sx={{ borderRadius: 999, textTransform: "none", borderColor: "#e5e7eb", bgcolor: "#ffffff" }}
            >
              Today
            </Button>

            <TextField
              size="small"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthOutlinedIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                minWidth: 160,
                "& .MuiOutlinedInput-root": { borderRadius: 999, bgcolor: "#ffffff", height: 36 },
              }}
            />
          </Stack>
        </Paper>

        {/* TABLE CARD */}
        <Paper elevation={0} sx={{ borderRadius: 4, overflow: "hidden", border: "1px solid #f0f0f0", bgcolor: "#ffffff" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#fafafa", "& th": { fontWeight: 600, color: "text.secondary", borderBottom: "1px solid #eee" } }}>
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
              {formattedShowtimes.length > 0 ? (
                formattedShowtimes.map((st) => (
                  <ShowtimeRow key={st.id} showtime={st} onDelete={handleDelete} />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    Không có suất chiếu nào vào ngày {selectedDate}.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      {/* --- MODAL ADD SHOWTIME --- */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Thêm Suất Chiếu Mới</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Đang thêm lịch cho ngày: <b>{selectedDate}</b>
            </Typography>

            <TextField
              label="Movie ID" type="number" fullWidth
              value={formData.MovieID}
              onChange={(e) => setFormData({ ...formData, MovieID: e.target.value })}
              helperText="Nhập ID Phim (VD: 1)"
            />

            <TextField
              label="Room ID" type="number" fullWidth
              value={formData.RoomID}
              onChange={(e) => setFormData({ ...formData, RoomID: e.target.value })}
              helperText="Nhập số phòng (VD: 1)"
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Giờ Bắt Đầu" type="time" fullWidth InputLabelProps={{ shrink: true }}
                value={formData.StartTime}
                onChange={(e) => setFormData({ ...formData, StartTime: e.target.value })}
              />
              <TextField
                label="Giờ Kết Thúc" type="time" fullWidth InputLabelProps={{ shrink: true }}
                value={formData.EndTime}
                onChange={(e) => setFormData({ ...formData, EndTime: e.target.value })}
              />
            </Stack>

            <TextField
              select label="Định dạng" fullWidth
              value={formData.Format}
              onChange={(e) => setFormData({ ...formData, Format: e.target.value })}
            >
              <MenuItem value="2D">2D</MenuItem>
              <MenuItem value="3D">3D</MenuItem>
              <MenuItem value="IMAX">IMAX</MenuItem>
              <MenuItem value="4DX">4DX</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">Hủy</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            sx={{ bgcolor: "#A855F7", '&:hover': { bgcolor: "#9333EA" } }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}