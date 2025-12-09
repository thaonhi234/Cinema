import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Avatar,
  Stack,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  TableSortLabel,
  TextField
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import StarRateRoundedIcon from "@mui/icons-material/StarRateRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import LeftMenuBar from "../../components/LeftMenuBar";

// Import componenets
import StatusChip from "./StatusChip";
import GenreChip from "./GenreChip";
import { useState, useEffect } from "react";
import moviesApi from "../../api/movieApi";
import MovieFormModal from "./MovieFormModal"; 
type Movie = {
    MovieID: number;
    MName: string; // Title
    RunTime: number; // Duration (đơn vị phút)
    releaseDate: string; 
    closingDate: string;
    AgeRating: string;
    AvgRating: number; 
    Genres: string[]; 
    Descript: string;
    isDub?: boolean;
    isSub?: boolean;

    Status: MovieStatus; // Tính toán từ SQL
    poster?: string; // Poster URL (tạm thời vẫn là client-side)
};
type MovieStatus = "Now Showing" | "Coming Soon" | "Ended"; // <--- Bổ sung 'Ended'
// ================== MAIN PAGE ==================
interface ModalState {
  isOpen: boolean;
  isEdit: boolean; // True nếu là Sửa, False nếu là Thêm
  currentMovie: Movie | null; // Dữ liệu phim hiện tại (chỉ khi Edit)
}
export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalState, setModalState] = useState<ModalState>({
        isOpen: false,
        isEdit: false,
        currentMovie: null,
    });
    const [searchTerm, setSearchTerm] = useState(''); // << STATE MỚI: Từ khóa tìm kiếm
    const [sortBy, setSortBy] = useState<keyof Movie>('MName'); // << STATE MỚI: Cột sắp xếp (Mặc định theo tên)
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // << STATE MỚI: Thứ tự sắp xếp
    
    const formatToYYYYMMDD = (date: Date) => {
    // Sử dụng date-fns hoặc thủ công để lấy YYYY-MM-DD
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
    };
    
    const filteredAndSortedMovies = movies
        .filter(movie => {
            const term = searchTerm.toLowerCase();
        const matchName = movie.MName.toLowerCase().includes(term);
        const matchGenres = movie.Genres.some(genre => 
            genre.toLowerCase().includes(term)
        );
        return matchName || matchGenres;
        })
        .sort((a, b) => {
            const isAsc = sortOrder === 'asc';
            let comparison = 0;
            
            // Xử lý so sánh cho từng loại dữ liệu
            const aValue = a[sortBy];
            const bValue = b[sortBy];

            if (sortBy === 'Genres') {
            // Sắp xếp theo tên thể loại đầu tiên
            const aGenre = a.Genres[0] || '';
            const bGenre = b.Genres[0] || '';
            comparison = aGenre.localeCompare(bGenre);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
            // Sắp xếp theo số (Rating, Duration)
            comparison = aValue > bValue ? 1 : -1;
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
            // Sắp xếp theo chuỗi (Movie Name, Status, Date)
            comparison = aValue.localeCompare(bValue);
        } else {
            comparison = 0; 
        }

            return isAsc ? comparison : -comparison;
        });
        
   const headCells: { id: keyof Movie; label: string }[] = [
    { id: 'MName', label: 'Movie' },
    { id: 'AvgRating', label: 'Rating' },
    { id: 'RunTime', label: 'Duration' },
    { id: 'Genres', label: 'Genres' },
    { id: 'Status', label: 'Status' },
    ];
    
    const handleOpenCreateModal = () => {
        setModalState({ isOpen: true, isEdit: false, currentMovie: null });
    };
    const handleOpenEditModal = (movie: Movie) => {
        setModalState({ isOpen: true, isEdit: true, currentMovie: movie });
    };
    const handleCloseModal = () => {
        setModalState({ isOpen: false, isEdit: false, currentMovie: null });
    };
    const handleDelete = async (movieId: number) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phim ID: ${movieId} không? Phim này chỉ có thể xóa nếu đã hết thời gian công chiếu.`)) return;

    try {
        await moviesApi.delete(movieId); // Gọi API DELETE
        alert(`Xóa phim ID: ${movieId} thành công!`);
        fetchMovies(); // Tải lại danh sách
    } catch (err: any) {
        // Lỗi 400 Bad Request thường là do phim đang công chiếu (validation từ SP)
        alert(`Xóa thất bại: ${err.response?.data?.message || 'Lỗi server.'}`);
    }
    };

    const handleSaveMovie = async (data: any, genres: string[]) => {
    try {
        // 1. Chuyển sang Date object
        const releaseDateObj : Date = data.releaseDate;
        const closingDateObj : Date = data.closingDate;

        // 2. Kiểm tra hợp lệ
        if (isNaN(releaseDateObj.getTime())) {
            alert("Ngày công chiếu không hợp lệ!");
            return;
        }
        if (isNaN(closingDateObj.getTime())) {
            alert("Ngày kết thúc công chiếu không hợp lệ!");
            return;
        }

        // 3. Chuẩn hóa payload
        const payload = {
            MName: data.MName,
            Descript: data.Descript || "Đang cập nhật mô tả.",
            RunTime: Number(data.RunTime),
            releaseDate: formatToYYYYMMDD(releaseDateObj),  // gửi Date object
            closingDate: formatToYYYYMMDD(closingDateObj),  // gửi Date object
            AgeRating: data.AgeRating,
            isDub: data.isDub ?? false,
            isSub: data.isSub ?? true,
            AvgRating: data.AvgRating ?? 0,
            Genres: genres,
            posterURL: data.posterURL || null,
        };
        const newPosterURL = data.posterURL;
        let newId: number | undefined;
        console.log("Payload gửi lên backend:", payload);

        if (modalState.isEdit && modalState.currentMovie) {
            // Cập nhật
            await moviesApi.update(modalState.currentMovie.MovieID, payload);
            if (newPosterURL && newPosterURL !== modalState.currentMovie.poster) {
                await moviesApi.updatePoster(modalState.currentMovie.MovieID, newPosterURL); // <<< GỌI API MỚI
            }
            alert("Cập nhật phim thành công!");
        } else {
            // Thêm mới
            const creationResponse = await moviesApi.create(payload);
            newId = creationResponse.data.MovieID;
            //await moviesApi.create(payload);
            alert("Thêm phim mới thành công!");
            if (newId && newPosterURL) {
                await moviesApi.updatePoster(newId, newPosterURL);
            }
        }

        handleCloseModal(); // đóng modal
        fetchMovies();      // tải lại danh sách
    } catch (err: any) {
        console.error("Lỗi khi tạo/cập nhật movie:", err);
        alert(`Thao tác thất bại: ${err.response?.data?.message || err.message || 'Lỗi server.'}`);
    }
};
    const handleRequestSort = (property: keyof Movie) => {
        const isAsc = sortBy === property && sortOrder === 'asc';
        setSortOrder(isAsc ? 'desc' : 'asc');
        setSortBy(property);
    };
    // 1. FETCH DATA TỪ BACKEND
    const fetchMovies = async () => {
        try {
            setLoading(true);
            const res = await moviesApi.getAll(); // GET /api/movies
            
            // Dữ liệu từ BE đã là cấu trúc Movie[], chỉ cần lưu vào state
            setMovies(res.data);
            setError(null);
        } catch (err: any) {
            console.error("Lỗi khi tải danh sách phim:", err);
            // Xử lý lỗi 403 (Token/Quyền hạn)
            if (err.response && err.response.status === 403) {
                setError("Bạn không có quyền truy cập chức năng này.");
            } else {
                setError(err.response?.data?.message || "Không thể tải dữ liệu từ server.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, []);
    
  

    // 3. HIỂN THỊ TRẠNG THÁI
    if (loading) return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f6f7fb' }}>
            <LeftMenuBar />
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2 }}>Đang tải danh mục phim...</Typography>
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
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#f6f7fb",
      }}
    >
      {/* Left sidebar */}
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
        {/* HEADER ROW */}
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
              Movie Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your cinema&apos;s movie catalog
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateModal}
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
            Add New Movie
          </Button>
        </Box>
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Search Movies"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ maxWidth: 400 }}
          />
        </Box>
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
            {/* TABLE HEADER */}
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
                {headCells.map((headCell) => (
            <TableCell
                key={headCell.id}
                sortDirection={sortBy === headCell.id ? sortOrder : false}
                sx={{
                    // ...
                    width: headCell.id === 'MName' ? '40%' : 'auto', // Giữ nguyên độ rộng cột Movie
                }}
            >
                <TableSortLabel
                    active={sortBy === headCell.id}
                    direction={sortBy === headCell.id ? sortOrder : 'asc'}
                    onClick={() => handleRequestSort(headCell.id)}
                    // sx={{
                    //     // Xóa icon sắp xếp cho cột Genres và Status nếu không muốn sắp xếp
                    //     '& .MuiTableSortLabel-icon': {
                    //         display: (headCell.id === 'Genres' || headCell.id === 'Status') ? 'none' : 'block',
                    //     }
                    // }}
                >
                    {headCell.label}
                </TableSortLabel>
            </TableCell>
        ))}
        <TableCell align="center">Actions</TableCell> {/* Cột Actions giữ nguyên */}
              </TableRow>
            </TableHead>

            {/* TABLE BODY */}
            <TableBody>
              {filteredAndSortedMovies.map((movie) => (
                <TableRow
                  key={movie.MovieID}
                  hover
                  sx={{
                    "& td": {
                      borderBottom: "1px solid #f3f4f6",
                    },
                  }}
                >
                  {/* MOVIE CELL: poster + title + date */}
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        variant="rounded"
                        src={movie.poster}
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: "#f3f4f6",
                          flexShrink: 0,
                        }}
                      />
                      <Box>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 600, mb: 0.3 }}
                        >
                          {movie.MName}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {movie.releaseDate}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  {/* RATING */}
                  <TableCell>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <StarRateRoundedIcon
                        sx={{ fontSize: 18, color: "#FACC15" }}
                      />
                      <Typography variant="body2">{movie.AvgRating.toFixed(1)}</Typography> {/* Dùng AvgRating */}
                    </Stack>
                  </TableCell>

                  {/* DURATION */}
                  <TableCell>
                    <Typography variant="body2">
                      {movie.RunTime} min {/* Dùng RunTime */}
                    </Typography>
                  </TableCell>

                  {/* GENRES */}
                  <TableCell>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {movie.Genres.map((g) => (
                        <GenreChip key={g} label={g} />
                      ))}
                    </Stack>
                  </TableCell>

                  {/* STATUS */}
                  <TableCell>
                    <StatusChip status={movie.Status as MovieStatus} /> {/* Dùng Status */}
                  </TableCell>

                  {/* ACTIONS */}
                  <TableCell align="center">
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="center"
                    >
                      <IconButton size="small" color="inherit" onClick={() => handleOpenEditModal(movie)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" sx={{ color: "#DC2626" }} onClick={() => handleDelete(movie.MovieID)}>
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <MovieFormModal 
          modalState={modalState}
          onClose={handleCloseModal}
          onSave={handleSaveMovie} 
      />
        </Paper>
      </Box>
    </Box>
  );
}