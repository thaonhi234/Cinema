// src/pages/rooms/_id.tsx
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

// Sử dụng kiểu dữ liệu từ API hoặc định nghĩa khớp với Response
type Room = RoomResponse;

export default function RoomsPage() {
    // --- State ---
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    // State cho Dialog
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);

    const navigate = useNavigate();

    // --- Computed Values ---
    const selectedRoom = rooms.find((room) => room.RoomID === selectedRoomId);
    
    // Lấy BranchID hiện tại (ưu tiên từ room list, hoặc lấy từ localStorage nếu list rỗng)
    // Lưu ý: Logic này giả định User Manager chỉ quản lý 1 Branch.
    const currentBranchId = rooms.length > 0 ? rooms[0].BranchID : Number(localStorage.getItem('BranchID') || 1); 

    // --- Effects ---
    const fetchRooms = async () => {
        try {
            setLoading(true);
            const res = await roomsApi.getAllRooms();
            // res.data là mảng Room (do axiosClient cấu hình trả về data)
            // hoặc res là mảng nếu axiosClient dùng interceptor trả về response.data
            const fetchedRooms: Room[] = Array.isArray(res) ? res : (res as any).data;

            setRooms(fetchedRooms);

            // Auto select room đầu tiên
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
        setEditingRoom(null); // Reset mode edit
        setDialogOpen(true);
    };

    // 2. Mở Dialog Edit (Placeholder)
    const handleEditRoom = (roomData: any) => {
        // Cần map lại dữ liệu từ RoomListItem sang Room object nếu cần
        const roomToEdit = rooms.find(r => r.RoomID === roomData.id);
        if(roomToEdit) {
            setEditingRoom(roomToEdit);
            setDialogOpen(true);
        }
    };

    // 3. Xử lý Submit (Create/Update)
    const handleDialogSubmit = async (values: RoomFormValues) => {
        try {
            if (editingRoom) {
                // --- Logic Update (Sẽ làm sau nếu cần) ---
                console.log("Update functionality not fully implemented yet");
                // await roomsApi.updateRoom(...)
            } else {
                // --- Logic Create ---
                
                // 1. Tự sinh RoomID: Tìm max ID hiện có + 1
                const maxId = rooms.length > 0 
                    ? Math.max(...rooms.map(r => r.RoomID)) 
                    : 0;
                const newRoomId = maxId + 1;

                // 2. Chuẩn bị payload khớp với Controller Backend
                const payload = {
                    BranchID: currentBranchId,
                    RoomID: newRoomId,
                    RType: values.RType,
                    TotalRows: values.TotalRows,
                    SeatsPerRow: values.MaxColumns, // Mapping: UI(MaxColumns) -> API(SeatsPerRow)
                    RCapacity: values.TotalRows * values.MaxColumns
                };

                console.log("Submitting New Room:", payload);

                // 3. Gọi API
                await roomsApi.createRoom(payload);
                
                // 4. Reload data & Close dialog
                await fetchRooms(); // Tải lại danh sách để cập nhật UI
                
                // Nếu muốn auto-select phòng mới tạo:
                setSelectedRoomId(newRoomId);
            }
            setDialogOpen(false);
        } catch (err: any) {
            console.error("Lỗi khi lưu phòng:", err);
            alert(err.response?.data?.message || "Có lỗi xảy ra khi lưu phòng.");
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
                        onClick={handleAddNew} // Kích hoạt dialog
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
                     <Typography sx={{ p: 4, textAlign: 'center' }}>Không có phòng chiếu nào. Hãy tạo mới.</Typography>
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
                                                name: room.RType, // Sử dụng RType làm tên hiển thị
                                                BranchName: room.BranchName || "Chi nhánh",
                                                rows: room.TotalRows,
                                                seatsPerRow: room.MaxColumns, // API trả về MaxColumns
                                                BranchID: room.BranchID,
                                            }}
                                            isActive={room.RoomID === selectedRoomId}
                                            onClick={() => setSelectedRoomId(room.RoomID)}
                                            onEdit={handleEditRoom}
                                            onDelete={() => console.log("Delete logic here")}
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

                {/* DIALOG COMPONENT */}
                <RoomFormDialog
                    open={dialogOpen}
                    title={editingRoom ? "Edit Room" : "Add New Room"}
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