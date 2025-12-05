import axiosClient from './axiosClient';

const dashboardApi = {
  // Lấy 4 số liệu tổng quan (Total Movies, Active Rooms, ...)
  getStats: () => axiosClient.get('/dashboard/stats'),

  // Lấy dữ liệu doanh thu hàng tuần và chi tiết theo ngày
  getWeeklyRevenue: () => axiosClient.get('/dashboard/weekly-revenue'),
};

export default dashboardApi;