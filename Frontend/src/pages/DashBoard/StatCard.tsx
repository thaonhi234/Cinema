import {
    Box,
    Typography,
    Paper,
} from "@mui/material";

import TrendingUpIcon from '@mui/icons-material/TrendingUp';


// kiểu dữ liệu riêng để mô tả các props mà component Stats Card sẽ nhận.
type StatCardProps = {
    color: string;
    icon: React.ReactNode;
    value: string;
    label: string;
    change: string;
    changeColor: string;
};

export default function StatCard({ color, icon, value, label, change, changeColor }: StatCardProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                borderRadius: 4,
                bgcolor: "#ffffff",
                border: "1px solid #f0f0f0",
                display: "flex",
                flexDirection: "column",
                alignItems: "left",
                gap: 2,
            }}
        >
            <Box sx={{display: "flex",}}>

                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 3,
                        bgcolor: color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        boxShadow: "0 8px 18px rgba(0,0,0,0.16)",
                    }}
                >
                    {icon}
                </Box>

                <Box sx={{ flexGrow: 1 }}></Box>
                
                <Box sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                    }}
                >
                    <TrendingUpIcon sx={{ color: changeColor, fontWeight: 500, whiteSpace: "nowrap" }}/> 
                    <Typography
                        variant="body2"
                        sx={{ color: changeColor, fontWeight: 500, whiteSpace: "nowrap" }}
                    >
                        {change}
                    </Typography>
                </Box>
            </Box>

            <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, alignItems: "center", justifyContent: "center", }}>
                    {value}
                </Typography>
            </Box>

            <Box>
                <Typography variant="body2" color="text.secondary">
                    {label}
                </Typography>
            </Box>
        </Paper>
    );
}
