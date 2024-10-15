import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

// Tạo context cho người dùng
const UserContext = createContext();

// Custom hook để sử dụng context
export const useUserContext = () => {
    return useContext(UserContext);
};

// Provider cho UserContext
export const UserProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Hàm để lấy danh sách người dùng từ API
    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                "http://localhost:9000/api/users",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    // Hàm để thêm người dùng
    const addUser = async (userData) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                "http://localhost:9000/api/users",
                userData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setUsers((prevUsers) => [...prevUsers, response.data]);
        } catch (error) {
            console.error("Error adding user:", error);
            throw error; // Để có thể bắt lỗi trong component
        }
    };

    // Hàm để chỉnh sửa người dùng
    const editUser = async (userId, updatedData) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(
                `http://localhost:9000/api/users/${userId}`,
                updatedData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId ? response.data : user
                )
            );
        } catch (error) {
            console.error("Error editing user:", error);
            throw error; // Để có thể bắt lỗi trong component
        }
    };

    // Hàm để xóa người dùng
    const deleteUser = async (userId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:9000/api/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers((prevUsers) =>
                prevUsers.filter((user) => user.id !== userId)
            );
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <UserContext.Provider
            value={{ users, loading, addUser, editUser, deleteUser }}
        >
            {children}
        </UserContext.Provider>
    );
};
