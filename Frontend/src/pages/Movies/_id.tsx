import * as React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Avatar,
  Stack,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import StarRateRoundedIcon from "@mui/icons-material/StarRateRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import LeftMenuBar, { drawerWidth } from "../../components/LeftMenuBar";

// Import componenets
import StatusChip from "./StatusChip";
import GenreChip from "./GenreChip";

// ================== MOCK DATA ==================
type MovieStatus = "Now Showing" | "Coming Soon";

type Movie = {
  id: number;
  title: string;
  releaseDate: string;
  rating: number;
  durationMin: number;
  genres: string[];
  status: MovieStatus;
  poster?: string; // url poster, có thể để trống
};

const movies: Movie[] = [
  {
    id: 1,
    title: "Stellar Odyssey",
    releaseDate: "2025-11-15",
    rating: 8.5,
    durationMin: 148,
    genres: ["Sci-Fi", "Adventure"],
    status: "Now Showing",
    poster:
      "https://images.pexels.com/photos/7991570/pexels-photo-7991570.jpeg?auto=compress&w=80",
  },
  {
    id: 2,
    title: "The Last Symphony",
    releaseDate: "2025-11-20",
    rating: 9.1,
    durationMin: 132,
    genres: ["Drama", "Music"],
    status: "Now Showing",
    poster:
      "https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg?auto=compress&w=80",
  },
  {
    id: 3,
    title: "Shadow Protocol",
    releaseDate: "2025-11-25",
    rating: 7.8,
    durationMin: 125,
    genres: ["Action", "Thriller"],
    status: "Now Showing",
    poster:
      "https://images.pexels.com/photos/7991505/pexels-photo-7991505.jpeg?auto=compress&w=80",
  },
  {
    id: 4,
    title: "Midnight Garden",
    releaseDate: "2025-11-28",
    rating: 8.2,
    durationMin: 118,
    genres: ["Fantasy", "Romance"],
    status: "Now Showing",
  },
  {
    id: 5,
    title: "Velocity Rush",
    releaseDate: "2025-11-30",
    rating: 7.5,
    durationMin: 110,
    genres: ["Action", "Racing"],
    status: "Now Showing",
  },
  {
    id: 6,
    title: "Echoes of Tomorrow",
    releaseDate: "2025-12-10",
    rating: 8.8,
    durationMin: 142,
    genres: ["Sci-Fi", "Drama"],
    status: "Coming Soon",
  },
  {
    id: 7,
    title: "The Crimson Crown",
    releaseDate: "2025-12-15",
    rating: 8.0,
    durationMin: 156,
    genres: ["Fantasy", "Adventure"],
    status: "Coming Soon",
  },
];


// ================== MAIN PAGE ==================

export default function MoviesPage() {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#f6f7fb",
      }}
    >
      {/* Left sidebar */}
      <LeftMenuBar />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: 4,
          py: 4,
        }}
      >
        {/* HEADER ROW */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            mb: 3,
            mt: 1,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Movie Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your cinema&apos;s movie catalog
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              px: 3,
              py: 1,
              fontWeight: 600,
              fontSize: 14,
              background: "linear-gradient(135deg,#A855F7,#F97316)",
              boxShadow: "0 10px 25px rgba(168,85,247,0.35)",
            }}
          >
            Add New Movie
          </Button>
        </Box>

        {/* TABLE CARD */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            border: "1px solid #f0f0f0",
            bgcolor: "#ffffff",
          }}
        >
          <Table>
            {/* TABLE HEADER */}
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: "#fafafa",
                  "& th": {
                    fontWeight: 600,
                    color: "text.secondary",
                    borderBottom: "1px solid #eee",
                  },
                }}
              >
                <TableCell sx={{ width: "40%" }}>Movie</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Genres</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            {/* TABLE BODY */}
            <TableBody>
              {movies.map((movie) => (
                <TableRow
                  key={movie.id}
                  hover
                  sx={{
                    "& td": {
                      borderBottom: "1px solid #f3f4f6",
                    },
                  }}
                >
                  {/* MOVIE CELL: poster + title + date */}
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        variant="rounded"
                        src={movie.poster}
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: "#f3f4f6",
                          flexShrink: 0,
                        }}
                      />
                      <Box>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 600, mb: 0.3 }}
                        >
                          {movie.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {movie.releaseDate}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  {/* RATING */}
                  <TableCell>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <StarRateRoundedIcon
                        sx={{ fontSize: 18, color: "#FACC15" }}
                      />
                      <Typography variant="body2">{movie.rating}</Typography>
                    </Stack>
                  </TableCell>

                  {/* DURATION */}
                  <TableCell>
                    <Typography variant="body2">
                      {movie.durationMin} min
                    </Typography>
                  </TableCell>

                  {/* GENRES */}
                  <TableCell>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {movie.genres.map((g) => (
                        <GenreChip key={g} label={g} />
                      ))}
                    </Stack>
                  </TableCell>

                  {/* STATUS */}
                  <TableCell>
                    <StatusChip status={movie.status} />
                  </TableCell>

                  {/* ACTIONS */}
                  <TableCell align="center">
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="center"
                    >
                      <IconButton size="small" color="inherit">
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" sx={{ color: "#DC2626" }}>
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Box>
  );
}
