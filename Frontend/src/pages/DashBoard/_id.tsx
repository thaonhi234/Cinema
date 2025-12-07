import {
    Box,
    Grid,
    Paper,
    Typography,
    Divider,
    CircularProgress,
    TextField
} from "@mui/material";

import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import MovieFilterOutlinedIcon from "@mui/icons-material/MovieFilterOutlined";
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LeftMenuBar from "../../components/LeftMenuBar";
import { drawerWidth } from "../../components/LeftMenuBar";
//import QuickStatRow from "./QuickStatRow"
import StatCard from "./StatCard"
import PerfRow from "./PerformanceRow";
import TopMovieCard from "./TopMovieCard"; // <--- Import component mới
// -----------------------
import { useState, useEffect } from "react";
import dashboardApi from "../../api/dashboardApi";
import moviesApi from "../../api/movieApi";
import DailyRevenueChart from "./DailyRevenueChart";
type StatData = {
    totalMovies: number;
    prevTotalMovies: number; // So sánh tuần trước
    activeRooms: number;
    prevActiveRooms: number; // So sánh tuần trước
    showtimesToday: number;
    prevShowtimesYesterday: number; // So sánh hôm trước
    ticketsSold: number;
    prevTicketsSold: number; // So sánh tuần trước
};

type RevenueData = {
    summary: { // <--- THÊM ĐỐI TƯỢNG 'summary' TẠI ĐÂY
        TotalRevenue: number;
        PreviousWeekRevenue: number;
        GrowthRate: number;
    };
    dailyRevenue: { 
        DayName: string, 
        Revenue: number 
    }[];
};
type TopMovie = {
    MovieID: number;
    MName: string;
    AvgRating: number;
    RunTime: number;
    Status: 'Now Showing' | 'Coming Soon' | 'Ended' | string;
    Rank: number; 
};
    const formatValue = (num: number) => num.toLocaleString();
    const formatCurrency = (num: number) => `$${num.toLocaleString()}`;
    const formatPercentage = (num: number) => `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
    const calculateChange = (current: number, previous: number): { value: string, color: string } => {
    if (previous === 0) {
        return { value: current > 0 ? "+∞%" : "0%", color: current > 0 ? '#16A34A' : '#6B7280' };
    }
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? '+' : '';
    const color = change >= 0 ? '#16A34A' : '#EF4444'; // Xanh lá nếu tăng, Đỏ nếu giảm

    return {
        value: `${sign}${change.toFixed(1)}%`,
        color: color
    };
};
export default function DashBoard() {
    // 1. STATE ĐỂ LƯU TRỮ DỮ LIỆU
    const [stats, setStats] = useState<StatData | null>(null);
    const [revenue, setRevenue] = useState<RevenueData | null>(null);
    const [topMovies, setTopMovies] = useState<TopMovie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // 2. HÀM GỌI API
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Sử dụng Promise.all để gọi 2 API song song
                const [statsRes, revenueRes, topMoviesRes] = await Promise.all([
                    dashboardApi.getStats(),
                    dashboardApi.getWeeklyRevenue(),
                    moviesApi.getTopMovies(5),
                ]);

                setStats(statsRes.data);
                setRevenue(revenueRes.data);
                const rankedMovies = topMoviesRes.data.map((movie: TopMovie, index: number) => ({
                    ...movie,
                    Rank: index + 1
                }));
                setTopMovies(rankedMovies);
            } catch (err: any) {
                // Xử lý lỗi (ví dụ: token hết hạn, lỗi server)
                console.error("Lỗi khi lấy dữ liệu Dashboard:", err);
                setError(err.response?.data?.message || "Không thể tải dữ liệu.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);
    // 3. HIỂN THỊ TRẠNG THÁI LOADING/ERROR
    if (loading) return <Typography sx={{ p: 4 }}>Đang tải Dashboard...</Typography>;
    if (error) return <Typography color="error" sx={{ p: 4 }}>Lỗi: {error}</Typography>;
    if (!stats || !revenue) return <Typography sx={{ p: 4 }}>Không có dữ liệu.</Typography>; // Fallback

    // Hàm format tiền tệ (vd: 1234 -> 1,234)
    const movieChange = calculateChange(stats.totalMovies, stats.prevTotalMovies);
    const roomsChange = calculateChange(stats.activeRooms, stats.prevActiveRooms);
    const showtimesChange = calculateChange(stats.showtimesToday, stats.prevShowtimesYesterday);
    const ticketsChange = calculateChange(stats.ticketsSold, stats.prevTicketsSold);
    return (
        <Box
            sx={{
                display: "flex",          
                minHeight: "100vh",
                bgcolor: "#f6f7fb",
                color: "text.primary",
            }}
        >
            {/* ========== LEFT MENU BAR ========== */}
            <LeftMenuBar />

            {/* ========== MAIN BOARD CONTENT ========== */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 4,
                }}
            >
                {/* Header */}
                <Box
                    component="header"
                    sx={{
                        position: "sticky",
                        top: 0,
                        left: `${drawerWidth}px`,
                        right: 0,
                        height: 80,
                        bgcolor: "rgba(255,255,255,0.8)",
                        backdropFilter: "blur(12px)",
                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 3,
                        zIndex: 1200,
                    }}
                >
                    <Box sx={{ fontWeight: 700 }}>
                        <Typography variant="h4" >
                            Dashboard
                        </Typography>
                        <Typography color="text.secondary">
                            Welcome back! Here&apos;s what&apos;s happening today.
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                        }}> 
                        <AccessTimeIcon/>Last updated: Just now
                    </Typography>
                </Box>

                {/* Top 4 stat cards */}
                <Grid container spacing={3} sx={{my: 3}}>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <StatCard
                            color="#A855F7"
                            icon={<MovieFilterOutlinedIcon />}
                            value={formatValue(stats.totalMovies)} // Dùng dữ liệu thật
                            label="Total Movies"
                            change={movieChange.value}
                            changeColor={movieChange.color}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <StatCard
                            color="#2563EB"
                            icon={<MeetingRoomOutlinedIcon />}
                            value={formatValue(stats.activeRooms)}
                            label="Active Rooms"
                            change={roomsChange.value}
                            changeColor={roomsChange.color}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <StatCard
                            color="#EA9713"
                            icon={<EventOutlinedIcon />}
                            value={formatValue(stats.showtimesToday)}
                            label="Showtimes Today"
                            change={showtimesChange.value} // So sánh hôm trước
                            changeColor={showtimesChange.color}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <StatCard
                            color="#16A34A"
                            icon={<LocalActivityIcon />}
                            value={formatValue(stats.ticketsSold)}
                            label="Tickets Sold"
                            change={ticketsChange.value}
                            changeColor={ticketsChange.color}
                        />
                    </Grid>
                </Grid>

                {/* Bottom area: left big card + right column */}
                <Grid container spacing={3} sx={{ mt: 3 }}>
                    {/* Weekly revenue (large card left) */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                bgcolor: "#ffffff",
                                border: "1px solid #f0f0f0",
                                height: 450,
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Box>
                                    <Typography variant="h6">Weekly Revenue</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total revenue for this week
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: "right", }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        {formatCurrency(revenue.summary.TotalRevenue)}
                                    </Typography>
                                    <Box sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "flex-end", 
                                    }}
                                    >
                                        <TrendingUpIcon sx={{color: revenue.summary.GrowthRate >= 0 ? "#16A34A" : "#EF4444" }}/>
                                        <Typography
                                            variant="body2"
                                            sx={{ color: revenue.summary.GrowthRate >= 0 ? "#16A34A" : "#EF4444", fontWeight: 500 }}
                                        >
                                            {formatPercentage(revenue.summary.GrowthRate)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Placeholder cho chart */}
                            <Box
                                sx={{
                                    flexGrow: 1,
                                    mt: 2, // Giảm margin top để tận dụng không gian
                                    borderRadius: 3,
                                    // Xóa border dashed và các style căn giữa
                                    display: "flex",
                                    minHeight: "200px" // Đảm bảo có đủ chiều cao cho biểu đồ
                                }}
                            >
                                {/* THAY THẾ BẰNG COMPONENT BIỂU ĐỒ THỰC TẾ */}
                                <DailyRevenueChart data={revenue.dailyRevenue} /> 
                                {/*  */}
                            </Box>

                            
                        </Paper>
                    </Grid>

                    {/* Right column: TOP 5 MOVIES */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 4,
                            bgcolor: "#ffffff",
                            border: "1px solid #f0f0f0",
                            // Đặt chiều cao tương đương với Weekly Revenue Card (280 + 32)
                            height: 500, 
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: 'center' }}>
                            <Typography variant="h6">
                                Top 5 Movies by Rating
                            </Typography>
                            
                        </Box>
                        
                        {/* HIỂN THỊ DANH SÁCH TOP 5 MOVIES (Hardcode) */}
                        <Box sx={{ flexGrow: 1, mt: 1 }}>
                            {topMovies.length > 0 ? (
                            topMovies.map((movie) => (
                                <TopMovieCard
                                    key={movie.MovieID}
                                        rank={movie.Rank}
                                        title={movie.MName}
                                        rating={movie.AvgRating}
                                        runtime={movie.RunTime}
                                        status={movie.Status === 'Now Showing' ? 'Now' : 'Soon'} //
                                />
                            ))
                            ) : (
                                <Typography color="text.secondary" sx={{ mt: 2 }}>
                                    No top movies available (rating data missing or API error).
                                </Typography>
                            )
                            }
                        </Box>
                        
                    </Paper>
                </Grid>
                {/* KẾT THÚC TOP 5 MOVIES */}
            </Grid>
                
            </Box>
        </Box>
    );
}
