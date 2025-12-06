import {
  Box,
  Typography,
} from "@mui/material";


export default function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.3 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}
