import axiosClient from './axiosClient';

const dashboardApi = {
  getSummary: () => axiosClient.get('/dashboard/summary'),
};

export default dashboardApi;
