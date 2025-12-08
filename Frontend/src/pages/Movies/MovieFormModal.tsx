// TRONG src/pages/MoviesPage/MovieFormModal.tsx

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Stack, Grid, FormControlLabel,
    Checkbox, MenuItem, Typography, Chip 
} from '@mui/material';
import moviesApi from '../../api/movieApi';
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
const handlePosterUpdate = async (movieId: number, url: string) => {
    try {
        await moviesApi.updatePoster(movieId, url);
        alert('Poster đã được cập nhật thành công!');
        // Cần fetch lại dữ liệu movie để component hiển thị ảnh mới
    } catch (error) {
        alert('Cập nhật thất bại.');
    }
};
// Khởi tạo trạng thái form trống
const initialFormState = {
    MName: '', Descript: '', RunTime: 120, isDub: false, isSub: false,
    releaseDate: '', closingDate: '', AgeRating: '13+',posterURL: '',
};
const parseDateString = (dateString: string): string => {
    // Kiểm tra nếu chuỗi rỗng hoặc đã là định dạng YYYY-MM-DD (dạng ISO chuẩn)
    if (!dateString || dateString.includes('-')) {
        return dateString; // Giữ nguyên (nếu dùng type="date" thì nó đã là YYYY-MM-DD)
    }
    // Giả định chuỗi là DD/MM/YYYY
    const parts = dateString.split('/');
    if (parts.length === 3) {
        // Trả về YYYY-MM-DD
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dateString;
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
                posterURL: movie.poster || '',
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
    formData.RunTime <= 0 
) {
    alert("Vui lòng điền đủ Tên và chọn ít nhất một Thể loại.");
    return;
}

       const releaseDateISO = parseDateString(formData.releaseDate);
    const closingDateISO = parseDateString(formData.closingDate);
    
    // 2. Tạo Date Object và thêm 'T00:00:00' để tránh lỗi múi giờ cục bộ
    const start = new Date(releaseDateISO + 'T00:00:00');
    const end = new Date(closingDateISO + 'T00:00:00');
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        alert("Ngày công chiếu hoặc ngày kết thúc không hợp lệ!");
        return;
    }

    

    if (start >= end) {
        alert("Ngày khởi chiếu phải nhỏ hơn ngày kết thúc!");
        return;
    }
    //const formatDate = (date: Date) => date.toISOString().split('T')[0]; // YYYY-MM-DD

        // Gọi hàm onSave trong MoviesPage, hàm này sẽ gọi API
        onSave({
        ...formData,releaseDate: start,
        closingDate: end,
    }, selectedGenres);
    };

    return (
        <Dialog open={modalState.isOpen} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{isEdit ? `Update: ${modalState.currentMovie?.MName}` : "Create Movie"}</DialogTitle>
            <DialogContent dividers sx={{ overflowY: 'auto',maxHeight: '80vh' }}>
                <Grid container spacing={2}>
                    
                    {/* Tên Phim */}
                     <Grid size={{ xs: 12, md: 6 }}>
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
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField 
                            label="Duration (minutes)" 
                            name="RunTime" 
                            type="number"
                            value={formData.RunTime} 
                            onChange={handleChange} 
                            
                            fullWidth 
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md:12}}>
                        <Typography variant="subtitle2" gutterBottom>Thể loại (Genres)</Typography>
                        <Stack spacing={{ xs: 1, sm: 1 }}
                                direction="row"
                                useFlexGap
                                sx={{ flexWrap: 'wrap' }}>
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
                    <Grid size={{ xs: 12, md:4}}>
                        <TextField 
                            label="Release Date" 
                            name="releaseDate" 
                            type="date"
                            value={formData.releaseDate} 
                            onChange={handleChange} 
                            fullWidth 
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>
                
                
                    
                     {/* Genres */}
                    <Grid size={{ xs: 12, md:4}}>
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
                        <Grid size={{ xs: 12, md:4}}>
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
                    <Grid size={{ xs: 12, md:12}}>
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
                    <Grid item xs={12}>
                        <TextField 
                            label="Poster URL" 
                            name="posterURL" 
                            value={formData.posterURL} 
                            onChange={handleChange} 
                            fullWidth 
                            helperText="Đường dẫn ảnh poster (Chỉ cập nhật khi chỉnh sửa phim hoặc ngay sau khi tạo)."
                        />
                    </Grid>
                    {/* Checkboxes */}
                    {/* Checkboxes Dub/Sub (Giữ nguyên) */}
                    <Grid item xs={6}>
                        <FormControlLabel
                            control={<Checkbox checked={formData.isDub} onChange={handleChange} name="isDub" />}
                            label="Dub"
                        />
                    </Grid>
                    <Grid item xs={6}>
                    <FormControlLabel
                        control={<Checkbox checked={formData.isSub} onChange={handleChange} name="isSub" />}
                        label="Sub"
                    />
                    </Grid>
                    </Grid>
            </DialogContent>
            
            
            <DialogActions style={{ padding: '0 24px 24px 24px' }}>
                <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <Button onClick={onClose} color="inherit" style={{ color: '#000' }}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained" 
                        style={{ 
                            background: 'linear-gradient(to right, #6A5ACD, #BA55D3, #FF8C00)',
                            color: 'white',
                            textTransform: 'none',
                            padding: '8px 24px'
                        }}
                    >
                        {isEdit ? "Lưu Thay Đổi" : "Save Movie"}
                    </Button>
                </div>
            </DialogActions>
        </Dialog>
    );
}