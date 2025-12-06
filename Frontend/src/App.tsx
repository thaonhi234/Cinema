import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/_id";
import ProtectedRoute from "./routers/ProtectedRoute";
import DashBoard from "./pages/DashBoard/_id";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login/>} />

          {/* Protected route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashBoard />
              </ProtectedRoute>
            }
          />

          {/* Default route */}
          <Route 
            path="/" element={<Login/>} />
        
      </Routes>
    </BrowserRouter>
  );
}
