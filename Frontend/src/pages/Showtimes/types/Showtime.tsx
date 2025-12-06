export type Showtime = {
  id: number;
  movieTitle: string;
  runtimeMin: number;
  room: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  priceUSD: number;
  soldSeats: number;
  totalSeats: number;
};
