import {
    Box,
    Grid,
    Paper,
    Typography,
    Divider,
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

type StatData = {
    totalMovies: number;
    activeRooms: number;
    showtimesToday: number;
    ticketsSold: number;
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
const mockTopMovies = [
    { rank: 1, title: 'The Last Symphony', rating: 9.1, runtime: 132, status: 'Now' as 'Now' | 'Soon' },
    { rank: 2, title: 'Echoes of Tomorrow', rating: 8.8, runtime: 142, status: 'Soon' as 'Now' | 'Soon' },
    { rank: 3, title: 'Stellar Odyssey', rating: 8.5, runtime: 148, status: 'Now' as 'Now' | 'Soon' },
    { rank: 4, title: 'Midnight Garden', rating: 8.2, runtime: 118, status: 'Now' as 'Now' | 'Soon' },
    { rank: 5, title: 'Quantum Leap', rating: 8.0, runtime: 105, status: 'Soon' as 'Now' | 'Soon' },
];
export default function DashBoard() {
    // 1. STATE ĐỂ LƯU TRỮ DỮ LIỆU
    const [stats, setStats] = useState<StatData | null>(null);
    const [revenue, setRevenue] = useState<RevenueData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // 2. HÀM GỌI API
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Sử dụng Promise.all để gọi 2 API song song
                const [statsRes, revenueRes] = await Promise.all([
                    dashboardApi.getStats(),
                    dashboardApi.getWeeklyRevenue(),
                ]);

                setStats(statsRes.data);
                setRevenue(revenueRes.data);
                
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
    const formatValue = (num: number) => num.toLocaleString();
    const formatCurrency = (num: number) => `$${num.toLocaleString()}`;
    const formatPercentage = (num: number) => `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;

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
                            change="+12%"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <StatCard
                            color="#2563EB"
                            icon={<MeetingRoomOutlinedIcon />}
                            value={formatValue(stats.activeRooms)}
                            label="Active Rooms"
                            change="+2"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <StatCard
                            color="#EA9713"
                            icon={<EventOutlinedIcon />}
                            value={formatValue(stats.showtimesToday)}
                            label="Showtimes Today"
                            change="+8%"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <StatCard
                            color="#16A34A"
                            icon={<LocalActivityIcon />}
                            value={formatValue(stats.ticketsSold)}
                            label="Tickets Sold"
                            change="+23%"
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
                                height: 280,
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
                                    }}
                                    >
                                        <TrendingUpIcon sx={{ color: "#16A34A" }}/>
                                        <Typography
                                            variant="body2"
                                            sx={{ color: "#16A34A", fontWeight: 500 }}
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
                                    mt: 4,
                                    borderRadius: 3,
                                    border: "1px dashed #e0e0e0",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "text.secondary",
                                    fontSize: 14,
                                }}
                            >
                                (Chart component here)
                            </Box>

                            {/* Days row */}
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    mt: 3,
                                    color: "text.secondary",
                                    fontSize: 12,
                                }}
                            >
                                {revenue.dailyRevenue.map((d) => ( // Dùng dailyRevenue
                                    <span key={d.DayName}>{d.DayName}</span>
                                ))}
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
                            height: 450, 
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: 'center' }}>
                            <Typography variant="h6">
                                Top 5 Movies by Rating
                            </Typography>
                            <Typography 
                                variant="body2" 
                                color="primary" 
                                sx={{ 
                                    fontWeight: 600, 
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                View All
                            </Typography>
                        </Box>
                        
                        {/* HIỂN THỊ DANH SÁCH TOP 5 MOVIES (Hardcode) */}
                        <Box sx={{ flexGrow: 1, mt: 1 }}>
                            {mockTopMovies.map((movie) => (
                                <TopMovieCard
                                    key={movie.rank}
                                    rank={movie.rank}
                                    title={movie.title}
                                    rating={movie.rating}
                                    runtime={movie.runtime}
                                    status={movie.status}
                                />
                            ))}
                        </Box>
                        
                    </Paper>
                </Grid>
                {/* KẾT THÚC TOP 5 MOVIES */}
            </Grid>
                
            </Box>
        </Box>
    );
}
