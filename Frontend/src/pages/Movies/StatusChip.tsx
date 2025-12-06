import {
  Chip,
} from "@mui/material";


// ================== MOCK DATA ==================
type MovieStatus = "Now Showing" | "Coming Soon";

export default function StatusChip({ status }: { status: MovieStatus }) {
  const isNow = status === "Now Showing";
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        fontSize: 12,
        fontWeight: 500,
        borderRadius: 999,
        px: 1.5,
        bgcolor: isNow ? "rgba(34,197,94,0.12)" : "rgba(129,140,248,0.12)",
        color: isNow ? "#16A34A" : "#6366F1",
      }}
    />
  );
}