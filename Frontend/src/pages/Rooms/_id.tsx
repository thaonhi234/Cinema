import * as React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Stack,
  Chip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import AppsIcon from "@mui/icons-material/Apps";
import LeftMenuBar from "../../components/LeftMenuBar";

// Imort components:
import SeatingMap from "./SeatingMap";
import RoomListItem from "./RoomListItem"
import SummaryItem from "./SummaryItem";
import type { Room } from "./types/room";
import { getTotalSeats } from "../utils/roomUtils";


/* ================== TYPES & MOCK DATA ================== */
const rooms: Room[] = [
  { id: 1, name: "Royal Hall A", rows: 10, seatsPerRow: 12 },
  { id: 2, name: "Gold Screen B", rows: 8, seatsPerRow: 10 },
  { id: 3, name: "Premium C", rows: 12, seatsPerRow: 14 },
  { id: 4, name: "IMAX Theater", rows: 15, seatsPerRow: 16 },
];

/* ================== MAIN PAGE ================== */

export default function RoomsPage() {
  const [selectedRoomId, setSelectedRoomId] = React.useState<number>(1);

  const selectedRoom =
    rooms.find((room) => room.id === selectedRoomId) ?? rooms[0];

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#f6f7fb",
      }}
    >
      {/* Sidebar */}
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
        {/* HEADER */}
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
              Room Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure theater rooms and seating layouts
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
            Add New Room
          </Button>
        </Box>

        {/* CONTENT 2 CỘT */}
        <Grid container spacing={3}>
          {/* LEFT: ROOM LIST */}
          <Grid sx={{ xs: 12, mb: 4}}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                border: "1px solid #f0f0f0",
                bgcolor: "#ffffff",
                p: 3,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 2 }}
              >
                Theater Rooms
              </Typography>

              <Stack spacing={2}>
                {rooms.map((room) => (
                  <RoomListItem
                    key={room.id}
                    room={room}
                    isActive={room.id === selectedRoomId}
                    onClick={() => setSelectedRoomId(room.id)}
                  />
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* RIGHT: ROOM DETAIL + SEATING MAP */}
          <Grid sx={{ xs: 12, mb: 8}}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                border: "1px solid #f0f0f0",
                bgcolor: "#ffffff",
                p: 3,
                display: "flex",
                flexDirection: "column",
                minHeight: 420,
              }}
            >
              {/* TOP TITLE & LAYOUT SIZE */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {selectedRoom.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >{`Seating capacity: ${getTotalSeats(
                    selectedRoom
                  )} seats`}</Typography>
                </Box>

                <Chip
                  icon={<AppsIcon />}
                  label={`${selectedRoom.rows}x${selectedRoom.seatsPerRow}`}
                  sx={{
                    borderRadius: 999,
                    bgcolor: "#f3f4ff",
                    fontWeight: 500,
                  }}
                />
              </Box>

              {/* SEATING MAP */}
              <SeatingMap
                rows={selectedRoom.rows}
                seatsPerRow={selectedRoom.seatsPerRow}
              />

              {/* SUMMARY NUMBERS */}
              <Box
                sx={{
                  mt: "auto",
                  pt: 4,
                  display: "flex",
                  justifyContent: "space-evenly",
                  borderTop: "1px solid #f3f4f6",
                }}
              >
                <SummaryItem label="Rows" value={selectedRoom.rows} />
                <SummaryItem
                  label="Seats per Row"
                  value={selectedRoom.seatsPerRow}
                />
                <SummaryItem
                  label="Total Seats"
                  value={getTotalSeats(selectedRoom)}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
