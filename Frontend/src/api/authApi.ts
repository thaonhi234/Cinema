import axiosClient from './axiosClient';

const authApi = {
  login: (username: string, password: string) =>
    axiosClient.post('/auth/login', { username, password }),
};

export default authApi;
