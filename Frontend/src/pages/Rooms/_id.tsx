import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    Stack,
    Chip,
    CircularProgress
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import AppsIcon from "@mui/icons-material/Apps";
import LeftMenuBar from "../../components/LeftMenuBar";

// Import components:
import SeatingMap from "./SeatingMap";
import RoomListItem from "./RoomListItem"
import SummaryItem from "./SummaryItem";
import RoomFormDialog  from "./RoomFormDialog";
import type { RoomFormValues }  from "./RoomFormDialog";

import roomsApi from "../../api/roomsApi"; // Import API
import type { RoomResponse } from "../../api/roomsApi"; // Import API

// Sử dụng kiểu dữ liệu từ API trả về
type Room = RoomResponse;

export default function RoomsPage() {
    // --- State ---
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    // State cho Dialog (Create/Edit)
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);

    const navigate = useNavigate();

    // --- Computed Values ---
    const selectedRoom = rooms.find((room) => room.RoomID === selectedRoomId);
    
    // Lấy BranchID hiện tại (giả định lấy từ phòng đầu tiên hoặc localStorage)
    const currentBranchId = rooms.length > 0 ? rooms[0].BranchID : Number(localStorage.getItem('BranchID') || 1); 

    // --- Effects: Fetch Data ---
    const fetchRooms = async () => {
        try {
            // setLoading(true); // Có thể comment dòng này nếu không muốn hiện loading spinner mỗi lần refresh nhẹ
            const res = await roomsApi.getAllRooms();
            const fetchedRooms: Room[] = Array.isArray(res) ? res : (res as any).data;

            setRooms(fetchedRooms);

            // Nếu chưa chọn phòng nào, chọn phòng đầu tiên
            if (fetchedRooms.length > 0 && selectedRoomId === null) {
                setSelectedRoomId(fetchedRooms[0].RoomID);
            }
        } catch (err: any) {
            console.error("Lỗi tải Rooms:", err);
            setError("Không thể kết nối đến máy chủ.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- Handlers ---

    // 1. Mở Dialog Thêm mới
    const handleAddNew = () => {
        setEditingRoom(null); // Reset mode edit -> create mode
        setDialogOpen(true);
    };

    // 2. Mở Dialog Edit
    const handleEditRoom = (roomItemProps: any) => {
        // Tìm object Room đầy đủ từ state dựa trên ID được click
        const roomToEdit = rooms.find(r => r.RoomID === roomItemProps.id);
        if (roomToEdit) {
            setEditingRoom(roomToEdit); // Set mode edit
            setDialogOpen(true);
        }
    };

    // 3. Xử lý Delete (CẬP NHẬT MỚI)
    const handleDeleteRoom = async (roomItemProps: any) => {
        // roomItemProps nhận từ RoomListItem gồm: { id, BranchID, name, ... }
        const { id, BranchID, name } = roomItemProps;

        try {
            // 1. Gọi API Xóa
            await roomsApi.deleteRoom(BranchID, id);

            // 2. Cập nhật State: Loại bỏ phòng vừa xóa khỏi danh sách hiện tại
            const remainingRooms = rooms.filter((r) => r.RoomID !== id);
            setRooms(remainingRooms);

            // 3. Xử lý lựa chọn (Selection):
            // Nếu phòng bị xóa là phòng đang được chọn, hãy chuyển sang phòng khác (nếu còn)
            if (selectedRoomId === id) {
                if (remainingRooms.length > 0) {
                    setSelectedRoomId(remainingRooms[0].RoomID);
                } else {
                    setSelectedRoomId(null);
                }
            }

            // (Tùy chọn) Thông báo thành công nhỏ nếu cần, hoặc dựa vào alert của RoomListItem
            // console.log(`Deleted room ${name} successfully`);

        } catch (error: any) {
            console.error("Lỗi xóa phòng:", error);
            const msg = error.response?.data?.message || "Không thể xóa phòng này (có thể do ràng buộc dữ liệu).";
            alert(msg);
        }
    };

    // 4. Xử lý Submit Dialog (Create & Update)
    const handleDialogSubmit = async (values: RoomFormValues) => {
        try {
            // Tính toán sức chứa
            const capacity = values.TotalRows * values.MaxColumns;

            if (editingRoom) {
                // === UPDATE EXISTING ROOM ===
                const payload = {
                    RType: values.RType,
                    TotalRows: values.TotalRows,
                    SeatsPerRow: values.MaxColumns, // API Controller dùng tên này
                    RCapacity: capacity
                };

                // 1. Gọi API Update
                await roomsApi.updateRoom(editingRoom.BranchID, editingRoom.RoomID, payload);
                
                // 2. KHẮC PHỤC: Cập nhật trực tiếp State 'rooms' tại frontend
                // Giúp giao diện thay đổi ngay lập tức mà không lo vấn đề Cache hay độ trễ Server
                setRooms((prevRooms) => 
                    prevRooms.map((room) => {
                        if (room.RoomID === editingRoom.RoomID) {
                            return {
                                ...room,
                                // Ghi đè các thông tin mới sửa
                                RType: values.RType,
                                TotalRows: values.TotalRows,
                                MaxColumns: values.MaxColumns, // Map đúng tên biến hiển thị ở FE
                                TotalCapacity: capacity
                            };
                        }
                        return room;
                    })
                );

                // (Tùy chọn) Vẫn có thể gọi fetchRooms để đồng bộ ngầm, nhưng không bắt buộc await để chặn UI
                fetchRooms(); 
                
            } else {
                // === CREATE NEW ROOM ===
                const maxId = rooms.length > 0 ? Math.max(...rooms.map(r => r.RoomID)) : 0;
                const newRoomId = maxId + 1;

                const payload = {
                    BranchID: currentBranchId,
                    RoomID: newRoomId,
                    RType: values.RType,
                    TotalRows: values.TotalRows,
                    SeatsPerRow: values.MaxColumns, 
                    RCapacity: capacity
                };

                await roomsApi.createRoom(payload);
                
                // Với Create, ta nên fetch lại vì cần chắc chắn dữ liệu đồng bộ
                await fetchRooms();
                setSelectedRoomId(newRoomId);
            }

            // Đóng dialog sau khi thành công
            setDialogOpen(false);

        } catch (err: any) {
            console.error("Lỗi khi lưu phòng:", err);
            const msg = err.response?.data?.message || "Có lỗi xảy ra.";
            alert(`Thao tác thất bại: ${msg}`);
        }
    };
    
    // --- Render ---

    if (loading && rooms.length === 0) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <CircularProgress />
        </Box>
    );

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f6f7fb" }}>
            <LeftMenuBar />

            <Box component="main" sx={{ flexGrow: 1, px: 4, py: 4 }}>
                {/* HEADER */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, mt: 1 }}>
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
                        onClick={handleAddNew}
                        sx={{
                            borderRadius: 999,
                            textTransform: "none",
                            px: 3, py: 1,
                            fontWeight: 600,
                            background: "linear-gradient(135deg,#A855F7,#F97316)",
                            boxShadow: "0 10px 25px rgba(168,85,247,0.35)",
                        }}
                    >
                        Add New Room
                    </Button>
                </Box>

                {/* CONTENT */}
                {rooms.length === 0 && !loading ? (
                     <Typography sx={{ p: 4, textAlign: 'center' }}>Chưa có dữ liệu phòng.</Typography>
                ) : (
                    <Grid container spacing={3}>
                        {/* LEFT: ROOM LIST */}
                        <Grid size={{xs:12, md:4}}>
                            <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid #f0f0f0", bgcolor: "#ffffff", p: 3 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                    Theater Rooms
                                </Typography>
                                <Stack spacing={2}>
                                    {rooms.map((room) => (
                                        <RoomListItem
                                            key={room.RoomID}
                                            room={{
                                                id: room.RoomID,
                                                name: room.RType, 
                                                BranchName: room.BranchName || "Chi nhánh",
                                                rows: room.TotalRows,
                                                seatsPerRow: room.MaxColumns,
                                                BranchID: room.BranchID,
                                            }}
                                            isActive={room.RoomID === selectedRoomId}
                                            onClick={() => setSelectedRoomId(room.RoomID)}
                                            onEdit={handleEditRoom}   // Truyền hàm Edit
                                            onDelete={handleDeleteRoom} // Truyền hàm Delete
                                        />
                                    ))}
                                </Stack>
                            </Paper>
                        </Grid>

                        {/* RIGHT: ROOM DETAIL */}
                        <Grid size={{xs:12, md:8}}>
                            {selectedRoom && (
                                <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid #f0f0f0", bgcolor: "#ffffff", p: 3, display: "flex", flexDirection: "column", minHeight: 420 }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                {selectedRoom.RType} {selectedRoom.RoomID}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {`Seating capacity: ${selectedRoom.TotalCapacity} seats`}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            icon={<AppsIcon />}
                                            label={`${selectedRoom.TotalRows} rows x ${selectedRoom.MaxColumns} seats`}
                                            sx={{ borderRadius: 999, bgcolor: "#f3f4ff", fontWeight: 500 }}
                                        />
                                    </Box>

                                    {/* Component vẽ sơ đồ ghế */}
                                    <SeatingMap
                                        rows={selectedRoom.TotalRows}
                                        seatsPerRow={selectedRoom.MaxColumns}
                                    />

                                    <Box sx={{ mt: "auto", pt: 4, display: "flex", justifyContent: "space-evenly", borderTop: "1px solid #f3f4f6" }}>
                                        <SummaryItem label="Rows" value={selectedRoom.TotalRows} />
                                        <SummaryItem label="Seats per Row" value={selectedRoom.MaxColumns} />
                                        <SummaryItem label="Total Seats" value={selectedRoom.TotalCapacity} />
                                    </Box>
                                </Paper>
                            )}
                        </Grid>
                    </Grid>
                )}

                {/* DIALOG: Dùng chung cho Create và Edit */}
                <RoomFormDialog
                    open={dialogOpen}
                    title={editingRoom ? `Edit Room: ${editingRoom.RType}` : "Add New Room"}
                    onClose={() => setDialogOpen(false)}
                    initialValues={
                        editingRoom
                            ? {
                                RType: editingRoom.RType,
                                TotalRows: editingRoom.TotalRows,
                                MaxColumns: editingRoom.MaxColumns,
                              }
                            : undefined
                    }
                    onSubmit={handleDialogSubmit}
                />
            </Box>
        </Box>
    );
}