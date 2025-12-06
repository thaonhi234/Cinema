import type { Room } from "../Rooms/types/room";

export const getTotalSeats = (room: Room) => room.rows * room.seatsPerRow;
