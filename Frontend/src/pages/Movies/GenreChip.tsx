import {
  Chip,
} from "@mui/material";

export default function GenreChip({ label }: { label: string }) {
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        borderRadius: 999,
        bgcolor: "#f3f4f6",
        color: "text.primary",
        fontSize: 12,
      }}
    />
  );
}