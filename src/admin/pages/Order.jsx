import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { currency } from "../App";

const Order = () => {
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    try {
      // Use the correct orders endpoint, not cart
      const res = await axiosInstance.get("/api/order/list");
      console.log("Admin orders response:", res.data); // Debug log
      if (res.data.success) {
        const ordersArray = res.data.orders || [];
        if (Array.isArray(ordersArray)) {
          setOrders(ordersArray.reverse());
        } else {
          console.warn("Orders data is not an array:", ordersArray);
          setOrders([]);
        }
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const statusHandler = async (e, orderId) => {
    try {
      const res = await axiosInstance.put("/api/order/status", {
        orderId,
        status: e.target.value,
      });

      if (res.data.success) {
        await fetchAllOrders();
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  return (
    <div>
      <h3>Order Page</h3>
      <div>
        {orders.map((order, i) => (
          <div
            key={i}
            className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700"
          >
            <img src={assets.parcel_icon} className="w-12" alt="" />
            <div>
              <div>
                {order.items.map((item, i) => {
                  if (i === order.items.length - 1) {
                    return (
                      <p key={i} className="py-0.5">
                        {item.name} x {item.quantity} <span>{item.size}</span>
                      </p>
                    );
                  } else {
                    return (
                      <p key={i} className="py-0.5">
                        {item.name} x {item.quantity} <span>{item.size}</span> ,
                      </p>
                    );
                  }
                })}
              </div>
              <p className="mb-2 mt-3 font-medium">
                {order.address.firstName + " " + order.address.lastName}
              </p>
              <div>
                <p>{order.address.street + ","}</p>
                <p>
                  {order.address.city +
                    ", " +
                    order.address.state +
                    ", " +
                    order.address.country +
                    ", " +
                    order.address.zipcode}
                </p>
              </div>
              <p>{order.address.phone}</p>
            </div>
            <div>
              <p className="text-sm sm:text-[15px]">
                Items : {order.items.length}
              </p>
              <p className="mt-3">Method : {order.paymentMethod}</p>
              <p>Payment : {order.payment ? "Done" : "Pending"}</p>
              <p>Date : {new Date(order.date).toLocaleString()}</p>
            </div>
            <p className="text-sm sm:text-[15px]">
              {currency} {order.amount}
            </p>

            <select
              value={order.status}
              className="p-2 font-semibold"
              onChange={(e) => statusHandler(e, order._id)}
            >
              <option value="Order Placed">Order Placed</option>
              <option value="Packing">Packing</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Order;
