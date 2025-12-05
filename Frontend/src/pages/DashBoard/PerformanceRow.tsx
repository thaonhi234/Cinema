import {
    Box,
    Typography,
    LinearProgress,
} from "@mui/material";


type PerfRowProps = {
    label: string;
    value: number;
    color: string;
};

export default function PerfRow({ label, value, color }: PerfRowProps) {
    return (
        <Box sx={{ mb: 2 }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                    fontSize: 14,
                }}
            >
                <Typography variant="body2">{label}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {value}%
                </Typography>
            </Box>
            <LinearProgress
                variant="determinate"
                value={value}
                sx={{
                    height: 8,
                    borderRadius: 999,
                    "& .MuiLinearProgress-bar": {
                        borderRadius: 999,
                        backgroundColor: color,
                    },
                }}
            />
        </Box>
    );
}
