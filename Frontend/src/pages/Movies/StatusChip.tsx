import {
  Chip,
} from "@mui/material";


// ================== MOCK DATA ==================
//type MovieStatus = "Now Showing" | "Coming Soon"||"Ended";

export default function StatusChip({ status }: {status: string }) {
  const isNow = status === "Now Showing";
  const isSoon = status === "Coming Soon";
  const isEnded = status === "Ended"; // Thêm logic cho Ended

  return (
    <Chip
      label={status}
      size="small"
      sx={{
        fontSize: 12,
        fontWeight: 500,
        borderRadius: 999,
        px: 1.5,
        bgcolor: isNow ? "rgba(34,197,94,0.12)" : (isEnded ? "#FEE2E2" : "rgba(129,140,248,0.12)"), // Sửa màu cho Ended
        color: isNow ? "#16A34A" : (isEnded ? "#DC2626" : "#6366F1"), // Sửa màu cho Ended
      }}
    />
  );
}