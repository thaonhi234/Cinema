import axiosClient from './axiosClient';

const authApi = {
  // --- SỬA TỪ 'username' THÀNH 'email' TRONG BODY GỬI ĐI ---
  login: (email: string, password: string) => 
    axiosClient.post('/auth/login', { 
        email: email, // Key phải là 'email'
        password: password 
    }),
};

export default authApi;
