// import { Route, Routes } from "react-router-dom";
// import Navbar from "./components/Navbar";
// import SideBar from "./components/SideBar";
// import Add from "./pages/Add";
// import List from "./pages/List";
// import Order from "./pages/Order";
// import { useEffect, useState } from "react";
// import Login from "./components/Login";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// export const backendUrl = import.meta.env.VITE_BACKEND_URL;
// export const currency = "$";

// const AdminApp = () => {
//   const [token, setToken] = useState(
//     localStorage.getItem("admin_token") ? localStorage.getItem("admin_token") : ""
//   );

//   useEffect(() => {
//     localStorage.setItem("admin_token", token);
//   }, [token]);

//   return (
//     <div className="bg-gray-50 min-h-screen">
//       <ToastContainer />
//       {token === "" ? (
//         <Login setToken={setToken} />
//       ) : (
//         <>
//           <Navbar setToken={setToken} />
//           <hr />
//           <div className="flex w-full">
//             <SideBar />
//             <div className="w-[70%] mx-auto ml-[max(5vw, 25px)] my-8 text-gray-600 text-base">
//               <Routes>
//                 <Route path="/admin/add" element={<Add token={token} />} />
//                 <Route path="/admin/list" element={<List token={token} />} />
//                 <Route path="/admin/orders" element={<Order token={token} />} />
//               </Routes>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default AdminApp;
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import SideBar from "./components/SideBar";
import Add from "./pages/Add";
import List from "./pages/List";
import Order from "./pages/Order";
import AuditLogs from "./pages/AuditLogs";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = "$";

const AdminApp = () => {
  const { user, adminLogout } = useAuth();

  // Admin is authenticated (handled by AdminRoute), show admin dashboard
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar setToken={adminLogout} />
      <hr />
      <div className="flex w-full">
        <SideBar />
        <div className="w-[70%] mx-auto ml-[max(5vw, 25px)] my-8 text-gray-600 text-base">
          <Routes>
            <Route path="add" element={<Add />} />
            <Route path="list" element={<List />} />
            <Route path="orders" element={<Order />} />
            <Route path="audit" element={<AuditLogs />} />
            <Route index element={<Add />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminApp;
