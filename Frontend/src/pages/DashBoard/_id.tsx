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
import QuickStatRow from "./QuickStatRow"
import StatCard from "./StatCard"
import PerfRow from "./PerformanceRow";


export default function DashBoard() {
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
                            value="156"
                            label="Total Movies"
                            change="+12%"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <StatCard
                            color="#2563EB"
                            icon={<MeetingRoomOutlinedIcon />}
                            value="8"
                            label="Active Rooms"
                            change="+2"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <StatCard
                            color="#EA9713"
                            icon={<EventOutlinedIcon />}
                            value="42"
                            label="Showtimes Today"
                            change="+8%"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <StatCard
                            color="#16A34A"
                            icon={<LocalActivityIcon />}
                            value="1,248"
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
                                        $26,900
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
                                            +18.2%
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
                                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                                    <span key={d}>{d}</span>
                                ))}
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Right column: Today performance + quick stats */}
                    <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {/* Today's performance */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                bgcolor: "#ffffff",
                                border: "1px solid #f0f0f0",
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Today&apos;s Performance
                            </Typography>

                            <PerfRow label="Occupancy Rate" value={78} color="#C084FC" />
                            <PerfRow label="Revenue Target" value={92} color="#22C55E" />
                            <PerfRow label="Customer Satisfaction" value={95} color="#F97316" />
                        </Paper>

                        {/* Quick stats */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                bgcolor: "#ffffff",
                                border: "1px solid #f0f0f0",
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Quick Stats
                            </Typography>
                            <QuickStatRow
                                icon={<RemoveRedEyeIcon />}
                                label="Total Views"
                                value="45.2K"
                            />
                            <Divider sx={{ my: 1.5 }} />
                            <QuickStatRow
                                icon={<StarBorderOutlinedIcon />}
                                label="Avg Rating"
                                value="4.7"
                            />
                            <Divider sx={{ my: 1.5 }} />
                            <QuickStatRow
                                icon={<LocalActivityIcon />}
                                label="Today Revenue"
                                value="$4,820"
                            />
                            <Divider sx={{ my: 1.5 }} />
                            <QuickStatRow
                                icon={<PeopleAltIcon />}
                                label="Active Users"
                                value="892"
                            />
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}
