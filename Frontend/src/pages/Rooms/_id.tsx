import * as React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Stack,
  Chip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import AppsIcon from "@mui/icons-material/Apps";
import LeftMenuBar from "../../components/LeftMenuBar";

// Imort components:
import SeatingMap from "./SeatingMap";
import RoomListItem from "./RoomListItem"
import SummaryItem from "./SummaryItem";

import { getTotalSeats } from "../utils/roomUtils";
import roomsApi from "../../api/roomsApi"; // Import API service
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
interface Room {
    BranchID: number;
    RoomID: number; // Dùng làm ID chính
    BranchName: string; // Tên chi nhánh
    RType: string; // Loại phòng (IMAX, 2D, 3D,...)
    TotalCapacity: number;
    TotalRows: number; // Số hàng
    MaxColumns: number; // Số ghế mỗi hàng
}
/* ================== TYPES & MOCK DATA ================== */

/* ================== MAIN PAGE ================== */

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
 // Tìm phòng đang được chọn
  const selectedRoom =
    rooms.find((room) => room.RoomID === selectedRoomId) ?? rooms[0];
  
  // Lấy BranchID từ phòng đang chọn
  const branchId = rooms[0]?.BranchID; // Lấy BranchID của phòng đầu tiên (hoặc của user nếu cần)

  // 1. Fetch Rooms Data
  useEffect(() => {
    const fetchRooms = async () => {
        try {
            // Lấy BranchID từ token (Giả định Manager đang login)
            const token = localStorage.getItem('token');
            if (!token) {
                navigate("/"); // Nếu không có token, chuyển về Login
                return;
            }
            
            // Hàm roomsApi.getAllRooms() đã được bảo vệ và sẽ tự động lọc theo BranchID
            const res = await roomsApi.getAllRooms();
            const fetchedRooms: Room[] = res.data;
            
            setRooms(fetchedRooms);
            
            // Chọn phòng đầu tiên làm mặc định nếu có dữ liệu
            if (fetchedRooms.length > 0 && selectedRoomId === null) {
                setSelectedRoomId(fetchedRooms[0].RoomID);
            }
            
        } catch (err: any) {
            console.error("Lỗi khi tải Rooms:", err);
            setError(err.response?.data?.message || "Không thể tải danh sách phòng.");
        } finally {
            setLoading(false);
        }
    };
    fetchRooms();
  }, [navigate, selectedRoomId]);

  // Handle Loading/Error States
  if (loading) return <Typography sx={{ p: 4 }}>Đang tải danh sách phòng...</Typography>;
  if (error) return <Typography color="error" sx={{ p: 4 }}>Lỗi: {error}</Typography>;
  if (rooms.length === 0) return <Typography sx={{ p: 4 }}>Không có phòng chiếu nào trong chi nhánh này.</Typography>;


  // Dùng tên phòng kết hợp loại phòng cho Title (ví dụ: Royal Hall A - 2D)
  const roomTitle = `${selectedRoom.RType} ${selectedRoom.RoomID} (${selectedRoom.BranchName})`;
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#f6f7fb",
      }}
    >
      {/* Sidebar */}
      <LeftMenuBar />

      {/* Main content */}
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
              Room Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure theater rooms and seating layouts
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
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
            Add New Room
          </Button>
        </Box>

        {/* CONTENT 2 CỘT */}
        <Grid container spacing={3}>
          {/* LEFT: ROOM LIST */}
          <Grid sx={{ xs: 12, mb: 4}}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                border: "1px solid #f0f0f0",
                bgcolor: "#ffffff",
                p: 3,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 2 }}
              >
                Theater Rooms
              </Typography>

              <Stack spacing={2}>
                {rooms.map((room) => (
                  <RoomListItem
                    key={room.RoomID}
                    // Truyền các prop theo tên mới
                    room={{
                        id: room.RoomID,
                        name: `${room.RType} ${room.RoomID}`,
                        BranchName: room.BranchName,
                        rows: room.TotalRows,
                        seatsPerRow: room.MaxColumns,
                        BranchID: room.BranchID, // Truyền BranchID để dùng cho các Actions
                    }}
                    isActive={room.RoomID === selectedRoomId}
                    onClick={() => setSelectedRoomId(room.RoomID)}
                  />
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* RIGHT: ROOM DETAIL + SEATING MAP */}
          <Grid sx={{ xs: 12, mb: 8}}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                border: "1px solid #f0f0f0",
                bgcolor: "#ffffff",
                p: 3,
                display: "flex",
                flexDirection: "column",
                minHeight: 420,
              }}
            >
              {/* TOP TITLE & LAYOUT SIZE */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {roomTitle}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >{`Seating capacity: ${selectedRoom.TotalCapacity} seats`}</Typography>
                </Box>

                <Chip
                  icon={<AppsIcon />}
                  label={`${selectedRoom.TotalRows}x${selectedRoom.MaxColumns}`}
                  sx={{
                    borderRadius: 999,
                    bgcolor: "#f3f4ff",
                    fontWeight: 500,
                  }}
                />
              </Box>

              {/* SEATING MAP */}
              <SeatingMap
                rows={selectedRoom.TotalRows} // Dùng TotalRows
                seatsPerRow={selectedRoom.MaxColumns}
              />

              {/* SUMMARY NUMBERS */}
              <Box
                sx={{
                  mt: "auto",
                  pt: 4,
                  display: "flex",
                  justifyContent: "space-evenly",
                  borderTop: "1px solid #f3f4f6",
                }}
              >
                <SummaryItem label="Rows" value={selectedRoom.TotalRows} />
                <SummaryItem
                  label="Seats per Row"
                  value={selectedRoom.MaxColumns}
                />
                <SummaryItem
                  label="Total Seats"
                  value={selectedRoom.TotalCapacity}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
