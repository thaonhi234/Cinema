export interface DashboardSummary {
  totalMovies: number;
  activeRooms: number;
  showtimesToday: number;
  ticketsSold: number;
  weeklyRevenue: number;
  weeklyRevenueGrowth: number;
  performance: {
    occupancyRate: number;
    revenueTarget: number;
    customerSatisfaction: number;
  };
  quickStats: {
    totalViews: number;
  };
}
