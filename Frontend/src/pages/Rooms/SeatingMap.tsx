import {
  Box,
} from "@mui/material";



const rowLetter = (index: number) => String.fromCharCode(65 + index); // 0 -> A

type SeatingMapProps = {
  rows: number;
  seatsPerRow: number;
};

export default function SeatingMap({ rows, seatsPerRow }: SeatingMapProps) {
  return (
    <>
      {/* SCREEN LABEL */}
      <Box
        sx={{
          mt: 3,
          mb: 1,
          textAlign: "center",
          fontSize: 12,
          color: "text.secondary",
          position: "relative",
          pb: 1,
          "&::after": {
            content: '""',
            position: "absolute",
            left: "10%",
            right: "10%",
            bottom: 0,
            height: 3,
            borderRadius: 999,
            boxShadow: "0 6px 10px rgba(0,0,0,0.18)",
            bgcolor: "#e5e7eb",
          },
        }}
      >
        SCREEN
      </Box>

      {/* SEATING GRID */}
      <Box
        sx={{
          mt: 4,
          display: "flex",
          justifyContent: "center",
          gap: 2,
        }}
      >
        {/* LEFT ROW LABELS */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 1,
            fontSize: 12,
            color: "text.secondary",
          }}
        >
          {Array.from({ length: rows }).map((_, r) => (
            <Box
              key={r}
              sx={{ height: 22, display: "flex", alignItems: "center" }}
            >
              {rowLetter(r)}
            </Box>
          ))}
        </Box>

        {/* SEATS */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${seatsPerRow}, 22px)`,
            gap: 0.75,
          }}
        >
          {Array.from({ length: rows }).map((_, r) =>
            Array.from({ length: seatsPerRow }).map((_, c) => (
              <Box
                key={`${r}-${c}`}
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: "6px 6px 4px 4px",
                  border: "1px solid #e5e7eb",
                  bgcolor: "#ffffff",
                }}
              />
            ))
          )}
        </Box>

        {/* RIGHT ROW LABELS */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 1,
            fontSize: 12,
            color: "text.secondary",
          }}
        >
          {Array.from({ length: rows }).map((_, r) => (
            <Box
              key={r}
              sx={{ height: 22, display: "flex", alignItems: "center" }}
            >
              {rowLetter(r)}
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
}
