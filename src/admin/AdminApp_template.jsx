// Copy this file to: CW_1/frontend/src/admin/AdminApp.jsx

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

// Import admin components
import AdminNavbar from "./components/Navbar";
import AdminSideBar from "./components/SideBar";
import AdminAdd from "./pages/Add";
import AdminList from "./pages/List";
import AdminOrder from "./pages/Order";

const AdminApp = () => {
  return (
    <>
      <ToastContainer />
      <AdminNavbar />
      <hr />
      <div className="flex w-full">
        <AdminSideBar />
        <div className="w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base">
          <Routes>
            <Route path="/" element={<Navigate to="/admin/add" replace />} />
            <Route path="/add" element={<AdminAdd />} />
            <Route path="/list" element={<AdminList />} />
            <Route path="/orders" element={<AdminOrder />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default AdminApp;
