import React, { type JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";

type ProtectedRouteProps = {
    children: JSX.Element;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const location = useLocation();

    // Lay token tu LocalStorage (trong Login page)
    const token = localStorage.getItem("token");

    // Neu khong co token => tro ve login page
    if (!token) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }} // Luu lai trang truoc
            />
        );
    }

    // Neu co token => cho vao trang
    return children;
};

export default ProtectedRoute;
