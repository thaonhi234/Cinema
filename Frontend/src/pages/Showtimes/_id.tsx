import {
  Box, Paper, Typography, Button, Stack, Table, TableHead, TableRow, TableCell, TableBody,
  TextField, InputAdornment, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem
} from "@mui/material";
import MovieFilterOutlinedIcon from "@mui/icons-material/MovieFilterOutlined";
import TodayOutlinedIcon from "@mui/icons-material/Today";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

import LeftMenuBar from "../../components/LeftMenuBar";
import { useState, useEffect } from "react";
import showtimeApi from "../../api/showtimeApi";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

// 1. Import Component và Types
import ShowtimeRow from "./ShowtimeRow"; // <-- Sử dụng component này
import type { Showtime, ShowtimeDisplay } from "./types/Showtime";

export default function ShowtimesPage() {
  const navigate = useNavigate();
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // --- STATE MODAL ---
  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); 
  const [currentEditId, setCurrentEditId] = useState<number | null>(null); 

  const [formData, setFormData] = useState({
    MovieID: "",
    RoomID: "",
    StartTime: "",
    EndTime: "",
    Format: "2D"
  });

  // --- 2. CHUẨN BỊ DỮ LIỆU HIỂN THỊ (MAPPING) ---
  // Bước này cực quan trọng: Chuyển dữ liệu từ API sang dạng mà ShowtimeRow hiểu
  // Đồng thời "giấu" các dữ liệu cần thiết cho việc sửa (movieId, roomId...) vào đây
  const formattedShowtimes: ShowtimeDisplay[] = showtimes.map(st => ({
    id: st.TimeID,
    movieTitle: st.MovieName,
    runtimeMin: st.RuntimeMinutes || 0,
    room: `${st.RoomType} ${st.RoomID}`,
    date: st.Day,
    time: st.StartTime ? st.StartTime.substring(0, 5) : "--:--",
    priceUSD: st.Price, 
    soldSeats: st.TicketsSold,
    totalSeats: st.TotalSeats,
    
    // 👇 GẮN DỮ LIỆU ẨN ĐỂ DÙNG KHI SỬA
    movieId: st.MovieID,
    roomId: st.RoomID,
    rawStartTime: st.StartTime,
    rawEndTime: st.EndTime,
    format: st.FormatName || st.FName || "2D"
  }));

  // --- HANDLER MODAL ---
  const handleOpenCreate = () => {
    setIsEditMode(false);
    setFormData({ MovieID: "", RoomID: "", StartTime: "", EndTime: "", Format: "2D" });
    setOpenModal(true);
  };

  // 3. HÀM MỞ FORM SỬA (Nhận item từ ShowtimeRow gửi lên)
  const handleOpenEdit = (item: ShowtimeDisplay) => {
    setIsEditMode(true);
    setCurrentEditId(item.id);
    
    // Đổ dữ liệu cũ vào form
    setFormData({
      MovieID: item.movieId ? item.movieId.toString() : "",
      RoomID: item.roomId ? item.roomId.toString() : "",
      StartTime: item.rawStartTime ? item.rawStartTime.substring(0, 5) : "",
      EndTime: item.rawEndTime ? item.rawEndTime.substring(0, 5) : "",
      Format: item.format || "2D"
    });
    setOpenModal(true);
  };

  // --- XỬ LÝ LƯU ---
  const handleSave = async () => {
    if (!formData.MovieID || !formData.RoomID || !formData.StartTime || !formData.EndTime) {
      alert("Vui lòng điền đủ thông tin!");
      return;
    }

    try {
      const payload = {
        BranchID: 1, 
        Day: selectedDate,
        MovieID: parseInt(formData.MovieID),
        RoomID: parseInt(formData.RoomID),
        StartTime: formData.StartTime, 
        EndTime: formData.EndTime,     
        FName: formData.Format,
        TimeID: 0
      };

      if (isEditMode && currentEditId) {
        await showtimeApi.updateShowtime(currentEditId, payload);
        alert("Cập nhật thành công!");
      } else {
        // @ts-ignore
        await showtimeApi.createShowtime(payload);
        alert("Thêm mới thành công!");
      }

      setOpenModal(false);
      fetchShowtimes(); 
    } catch (err: any) {
      console.error(err);
      alert("Lỗi: " + (err.response?.data?.message || "Thất bại"));
    }
  };

  // --- FETCH DATA ---
  const fetchShowtimes = async () => {
    try {
      setLoading(true);
      const res = await showtimeApi.getAllShowtimes(selectedDate);
      setShowtimes(res.data);
      setError(null);
    } catch (err: any) {
      setError("Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShowtimes(); }, [selectedDate]);

  // --- DELETE ---
  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa?")) return;
    try {
      await showtimeApi.deleteShowtime(id);
      alert("Đã xóa!");
      fetchShowtimes();
    } catch (err) { alert("Không thể xóa (có thể đã bán vé)."); }
  };

  // --- RENDER ---
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f6f7fb" }}>
      <LeftMenuBar />
      <Box component="main" sx={{ flexGrow: 1, px: 4, py: 4 }}>
        
        {/* HEADER */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h4" fontWeight={700}>Showtime Management</Typography>
          <Button variant="contained" startIcon={<MovieFilterOutlinedIcon />} onClick={handleOpenCreate}
            sx={{ borderRadius: 999, background: "linear-gradient(135deg,#A855F7,#F97316)" }}>
            Add Showtime
          </Button>
        </Box>

        {/* FILTER */}
        <Paper elevation={0} sx={{ borderRadius: 999, p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button variant="contained" size="small" sx={{ borderRadius: 999, bgcolor: "#111827" }}>All Movies</Button>
          <TextField size="small" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} type="date"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 999 } }} />
        </Paper>

        {/* TABLE */}
        <Paper elevation={0} sx={{ borderRadius: 4, overflow: "hidden" }}>
          {loading ? <Box p={4} textAlign="center"><CircularProgress /></Box> : (
            <Table>
              <TableHead sx={{ bgcolor: "#fafafa" }}>
                <TableRow>
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
                {/* 4. SỬ DỤNG COMPONENT ShowtimeRow TẠI ĐÂY */}
                {formattedShowtimes.length > 0 ? formattedShowtimes.map((st) => (
                  <ShowtimeRow 
                    key={st.id} 
                    showtime={st} 
                    onDelete={handleDelete} 
                    onEdit={handleOpenEdit} // Truyền hàm sửa xuống component con
                  />
                )) : (
                  <TableRow><TableCell colSpan={7} align="center">No data</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Box>

      {/* MODAL */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight="bold">
          {isEditMode ? "Cập Nhật Suất Chiếu" : "Thêm Suất Chiếu Mới"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={1}>
            <TextField label="Movie ID" type="number" fullWidth value={formData.MovieID}
              onChange={(e) => setFormData({ ...formData, MovieID: e.target.value })} />
            
            <TextField label="Room ID" type="number" fullWidth value={formData.RoomID}
              onChange={(e) => setFormData({ ...formData, RoomID: e.target.value })} />
            
            <Stack direction="row" spacing={2}>
                <TextField label="Giờ Bắt Đầu" type="time" fullWidth InputLabelProps={{ shrink: true }}
                value={formData.StartTime}
                onChange={(e) => setFormData({ ...formData, StartTime: e.target.value })} />
                
                <TextField label="Giờ Kết Thúc" type="time" fullWidth InputLabelProps={{ shrink: true }}
                value={formData.EndTime}
                onChange={(e) => setFormData({ ...formData, EndTime: e.target.value })} />
            </Stack>
            
            <TextField select label="Định dạng" fullWidth value={formData.Format}
              onChange={(e) => setFormData({ ...formData, Format: e.target.value })}>
              <MenuItem value="2D">2D</MenuItem>
              <MenuItem value="3D">3D</MenuItem>
              <MenuItem value="IMAX">IMAX</MenuItem>
              <MenuItem value="4DX">4DX</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">Hủy</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: "#A855F7" }}>
            {isEditMode ? "Cập Nhật" : "Lưu Mới"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}