import {
    Box,
    Typography,
} from "@mui/material";


// kiểu dữ liệu riêng để mô tả các props mà component Quick Stats Row sẽ nhận.
type QuickStatRowProps = {
    icon: React.ReactNode;
    label: string;
    value: string;
};


export default function QuickStatRow({ icon, label, value }: QuickStatRowProps) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                    sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 2,
                        bgcolor: "#f4f4ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#6366F1",
                    }}
                >
                    {icon}
                </Box>
                <Typography variant="body2">{label}</Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {value}
            </Typography>
        </Box>
    );
}