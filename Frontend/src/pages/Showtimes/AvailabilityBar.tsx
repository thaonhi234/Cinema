import {
  Box,
  Typography,
} from "@mui/material";


/* ============ AvailabilityBar COMPONENT ============ */

type AvailabilityBarProps = {
  soldSeats: number;
  totalSeats: number;
};

const getAvailabilityColor = (ratio: number) => {
  if (ratio < 0.3) return "#EF4444"; // đỏ – ít khách
  return "#16A34A"; // xanh – ổn
};

export default function AvailabilityBar({ soldSeats, totalSeats }: AvailabilityBarProps) {
  const ratio = soldSeats / totalSeats;
  const color = getAvailabilityColor(ratio);

  return (
    <Box sx={{ minWidth: 160 }}>
      <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
        {soldSeats} / {totalSeats} seats
      </Typography>
      <Box
        sx={{
          position: "relative",
          height: 4,
          borderRadius: 999,
          bgcolor: "#e5e7eb",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${ratio * 100}%`,
            bgcolor: color,
          }}
        />
      </Box>
    </Box>
  );
}
