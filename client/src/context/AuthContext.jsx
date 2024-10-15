import React, { createContext, useContext, useState } from "react";

// Tạo context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userName, setUserName] = useState("");

    const login = (name) => {
        setIsAuthenticated(true);
        setUserName(name);
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUserName("");
    };

    return (
        <AuthContext.Provider
            value={{ isAuthenticated, login, logout, userName }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
