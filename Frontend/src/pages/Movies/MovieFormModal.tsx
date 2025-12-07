// TRONG src/pages/MoviesPage/MovieFormModal.tsx

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Stack, Grid, FormControlLabel,
    Checkbox, MenuItem, Typography, Chip 
} from '@mui/material';

// --- Imports Types từ MoviesPage ---
interface ModalState {
    isOpen: boolean; isEdit: boolean; currentMovie: Movie | null;
}
type MovieStatus = "Now Showing" | "Coming Soon" | "Ended";
interface Movie {
    MovieID: number; MName: string; RunTime: number; releaseDate: string; closingDate: string; Descript: string;
    AgeRating: string; AvgRating: number; Genres: string[]; Status: MovieStatus; poster?: string;
}
// --- END Imports Types ---

// Giả định các thể loại và xếp hạng tuổi (Có thể fetch từ DB nếu cần)
const availableGenres = ["Action", "Drama", "Sci-Fi", "Animation", "Romance", "Crime", "Thriller", "Adventure", "Fantasy"];
const ageRatings = ['0+', '13+', '16+', '18+'];


interface MovieFormModalProps {
    modalState: ModalState;
    onClose: () => void;
    // Hàm gọi API Save, nhận data form và danh sách genres
    onSave: (data: any, genres: string[]) => void; 
}

// Khởi tạo trạng thái form trống
const initialFormState = {
    MName: '', Descript: '', RunTime: 120, isDub: false, isSub: false,
    releaseDate: '', closingDate: '', AgeRating: '13+'
};

export default function MovieFormModal({ modalState, onClose, onSave }: MovieFormModalProps) {
    const [formData, setFormData] = useState(initialFormState);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const isEdit = modalState.isEdit;
    const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0'); // Tháng 0-index
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
    };
    // 1. DÙNG useEffect ĐỂ LOAD DỮ LIỆU KHI EDIT
    useEffect(() => {
        if (modalState.isOpen && modalState.currentMovie) {
            const movie = modalState.currentMovie;
            setFormData({
                MName: movie.MName,
                Descript: movie.Descript|| "", // Giữ nguyên, không có trong Type bạn cung cấp
                RunTime: movie.RunTime,
                isDub: true, // Giả định
                isSub: true, // Giả định
                // Định dạng ngày sang YYYY-MM-DD (cần thiết cho type="date")
                releaseDate: formatDate(movie.releaseDate), 
                closingDate: formatDate(movie.closingDate),
                AgeRating: movie.AgeRating,
            });
            setSelectedGenres(movie.Genres || []);
        } else if (!modalState.isEdit) {
            // Reset form khi tạo mới
            setFormData(initialFormState);
            setSelectedGenres([]);
        }
    }, [modalState.isOpen, modalState.currentMovie]);

    // 2. HÀM XỬ LÝ NHẬP LIỆU CHUNG
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };
    
    // 3. XỬ LÝ CHỌN GENRES
    const handleGenreChange = (genre: string) => {
        setSelectedGenres(prev => 
            prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
        );
    };

    // 4. HÀM SUBMIT
    const handleSubmit = () => {
        if (
    !formData.MName ||
    selectedGenres.length === 0 ||
    formData.RunTime <= 0 ||
    
    formData.Descript.trim().length === 0
) {
    alert("Vui lòng điền đủ Tên, Ngày, và chọn ít nhất một Thể loại.");
    return;
}

        const start = new Date(formData.releaseDate);
    const end = new Date(formData.closingDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        alert("Ngày công chiếu hoặc ngày kết thúc không hợp lệ!");
        return;
    }

    

    if (start >= end) {
        alert("Ngày khởi chiếu phải nhỏ hơn ngày kết thúc!");
        return;
    }
    const formatDate = (date: Date) => date.toISOString().split('T')[0]; // YYYY-MM-DD

        // Gọi hàm onSave trong MoviesPage, hàm này sẽ gọi API
        onSave({
        ...formData,releaseDate: formatDate(start),
        closingDate: formatDate(end),
    }, selectedGenres);
    };

    return (
        <Dialog open={modalState.isOpen} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{isEdit ? `Sửa Phim: ${modalState.currentMovie?.MName}` : "Thêm Phim Mới"}</DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    
                    {/* Tên Phim */}
                    <Grid item xs={12}>
                        <TextField 
                            label="Movie Title" 
                            name="MName" 
                            value={formData.MName} 
                            onChange={handleChange} 
                            fullWidth 
                            required 
                        />
                    </Grid>
                    
                    {/* Thời lượng & Xếp hạng tuổi */}
                    <Grid item xs={6}>
                        <TextField 
                            label="Duration (minutes)" 
                            name="RunTime" 
                            type="number"
                            value={formData.RunTime} 
                            onChange={handleChange} 
                            fullWidth 
                        />
                    </Grid>
                    <Grid item xs={6}>
                    <Typography variant="subtitle2" gutterBottom>Thể loại (Genres)</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {availableGenres.map(genre => (
                            <Chip
                                key={genre}
                                label={genre}
                                onClick={() => handleGenreChange(genre)}
                                color={selectedGenres.includes(genre) ? 'primary' : 'default'}
                                variant={selectedGenres.includes(genre) ? 'filled' : 'outlined'}
                            />
                        ))}
                    </Stack>
                </Grid>

                    {/* Ngày công chiếu & Ngày kết thúc */}
                    <Grid item xs={6}>
                        <TextField 
                            label="Release Date" 
                            name="releaseDate" 
                            type="date"
                            value={formData.releaseDate} 
                            onChange={handleChange} 
                            fullWidth 
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                
                    
                    {/* Genres */}
                    <Grid item xs={6}>
                    <TextField 
                        select 
                        label="Rating (Age Restriction)" 
                        name="AgeRating" 
                        value={formData.AgeRating} 
                        onChange={handleChange} 
                        fullWidth
                    >
                        {ageRatings.map(rating => <MenuItem key={rating} value={rating}>{rating}</MenuItem>)}
                    </TextField>
                </Grid>
                    <Grid item xs={6}>
                    <TextField 
                        label="Closing Date" 
                        name="closingDate" 
                        type="date"
                        value={formData.closingDate} 
                        onChange={handleChange} 
                        fullWidth 
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>
                {/* Description (Trường bắt buộc cho Backend) */}
                <Grid item xs={12}>
                    <TextField 
                        label="Description" 
                        name="Descript" 
                        value={formData.Descript} 
                        onChange={handleChange} 
                        fullWidth 
                        multiline
                        rows={3}
                        required 
                    />
                </Grid>
                    {/* Checkboxes */}
                    {/* Checkboxes Dub/Sub (Giữ nguyên) */}
                <Grid item xs={6}>
                    <FormControlLabel
                        control={<Checkbox checked={formData.isDub} onChange={handleChange} name="isDub" />}
                        label="Lồng tiếng (Dub)"
                    />
                </Grid>
                <Grid item xs={6}>
                    <FormControlLabel
                        control={<Checkbox checked={formData.isSub} onChange={handleChange} name="isSub" />}
                        label="Phụ đề (Sub)"
                    />
                </Grid>
                </Grid>
            </DialogContent>
            
            <DialogActions>
                <Button onClick={onClose} color="error">Hủy</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    {isEdit ? "Lưu Thay Đổi" : "Thêm Phim"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}