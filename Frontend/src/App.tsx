import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/_id";
import ProtectedRoute from "./routers/ProtectedRoute";
import DashBoard from "./pages/DashBoard/_id";
import Movies from "./pages/Movies/_id"
import Rooms from "./pages/Rooms/_id"
// import Showtimes from "./pages/Showtimes/_id"
// import Employees from "./pages/Employees/_id"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login/>} />

          {/* Protected route  */} 
          <Route
            path="/dashboard" 
            element={ 
              <ProtectedRoute> 
                <DashBoard /> 
              </ProtectedRoute> }
          />
          
          <Route
            path="/movies"
            element={
              <ProtectedRoute>
                <Movies />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/rooms"
            element={
              <ProtectedRoute>
                <Rooms />
              </ProtectedRoute>
            }
          />
          
          {/* <Route
            path="/showtimes"
            element={
              <ProtectedRoute>
                <Showtimes />
              </ProtectedRoute>
            }
          />
          
          
          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <Employees />
              </ProtectedRoute>
            }
          /> */}

          {/* Default route */}
          <Route 
            path="/" element={<Login/>} />
        
      </Routes>
    </BrowserRouter>
  );
}
