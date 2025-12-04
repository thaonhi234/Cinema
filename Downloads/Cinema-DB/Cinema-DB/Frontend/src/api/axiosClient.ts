import axios from 'axios';

const axiosClient = axios.create({
  // Sửa cổng từ 5000 sang 3000
  baseURL: 'http://localhost:3000/api', // Địa chỉ Backend chính xác
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm Interceptor để tự động gắn Token vào mỗi request (cho các chức năng cần đăng nhập)
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;