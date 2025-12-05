import {
    Box,
    Typography,
    Divider,
} from "@mui/material";

// Định nghĩa kiểu dữ liệu cho một bộ phim trong danh sách Top 5
type TopMovieCardProps = {
    rank: number;
    title: string;
    rating: number;
    runtime: number; // Đơn vị phút
    status: 'Now' | 'Soon';
};

// Hàm định nghĩa màu nền và màu chữ cho Rank Badge
const getRankColor = (rank: number) => {
    switch (rank) {
        case 1: return { bgColor: '#F97316', textColor: 'white' }; // Orange
        case 2: return { bgColor: '#3B82F6', textColor: 'white' }; // Blue
        case 3: return { bgColor: '#EF4444', textColor: 'white' }; // Red
        default: return { bgColor: '#E5E7EB', textColor: '#6B7280' }; // Gray
    }
};

export default function TopMovieCard({ rank, title, rating, runtime, status }: TopMovieCardProps) {
    const rankColors = getRankColor(rank);

    return (
        <>
            <Box 
                sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    gap: 1, 
                    py: 1.5 
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Rank Badge */}
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 2,
                            bgcolor: rankColors.bgColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: rankColors.textColor,
                            fontWeight: 700,
                            fontSize: 14,
                        }}
                    >
                        #{rank}
                    </Box>

                    {/* Movie Info */}
                    <Box>
                        <Typography 
                            variant="body1" 
                            sx={{ fontWeight: 600, fontSize: 15 }}
                        >
                            {title}
                        </Typography>
                        <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                            <span style={{ color: rankColors.bgColor }}>
                                • {rating}
                            </span>
                             • {runtime} min
                        </Typography>
                    </Box>
                </Box>
                
                {/* Status Tag */}
                <Box
                    sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: 999,
                        bgcolor: status === 'Now' ? '#D1FAE5' : '#E0F2FE',
                        color: status === 'Now' ? '#059669' : '#3B82F6',
                        fontSize: 12,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                    }}
                >
                    {status}
                </Box>
            </Box>
            {rank < 5 && <Divider sx={{ my: 0.5 }} />} {/* Thêm Divider cho 4 mục đầu */}
        </>
    );
}