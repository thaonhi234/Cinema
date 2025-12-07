// api/moviesApi.ts
import axiosClient from './axiosClient';

const moviesApi = {
  getAll: () => axiosClient.get('/movies'), // GET /api/movies
  getById: (id: number) => axiosClient.get(`/movies/${id}`), // GET /api/movies/:id
  create: (movie: any) => axiosClient.post('/movies', movie), // POST /api/movies
  update: (id: number, movie: any) => axiosClient.put(`/movies/${id}`, movie), // PUT /api/movies/:id
  delete: (id: number) => axiosClient.delete(`/movies/${id}`), // DELETE /api/movies/:id
  getTopMovies: (limit: number = 5) => axiosClient.get(`/movies/top-rated?limit=${limit}`),
};

export default moviesApi;
