import { useState, useEffect, useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import PasswordStrengthBar from "../components/PasswordStrengthBar";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUserAccount,
} from "../api/user";
import { getUserOrders } from "../api/orders";

const Profile = () => {
  const { navigate } = useContext(ShopContext);
  const { user, logout } = useAuth();

  // Profile data state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    dateOfBirth: "",
    gender: "",
  });

  // UI state
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Order history state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Load user profile data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
      });
    }
  }, [user]);

  // Fetch user orders
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await getUserOrders();
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "orders" && user) {
      fetchOrders();
    }
  }, [activeTab, user]);

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await updateUserProfile(profileData);

      if (response.data.success) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.data.success) {
        toast.success("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        const response = await deleteUserAccount();

        if (response.data.success) {
          toast.success("Account deleted successfully");
          logout();
          navigate("/");
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to delete account");
      }
    }
  };

  const TabButton = ({ id, label, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        active ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="border-t pt-14 min-h-screen">
      <div className="text-2xl mb-8">
        <Title text1={"MY"} text2={"PROFILE"} />
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 border-b pb-4">
        <TabButton
          id="profile"
          label="Profile Info"
          active={activeTab === "profile"}
          onClick={setActiveTab}
        />
        <TabButton
          id="orders"
          label="Order History"
          active={activeTab === "orders"}
          onClick={setActiveTab}
        />
        <TabButton
          id="security"
          label="Security"
          active={activeTab === "security"}
          onClick={setActiveTab}
        />
        <TabButton
          id="settings"
          label="Settings"
          active={activeTab === "settings"}
          onClick={setActiveTab}
        />
      </div>

      {/* Profile Info Tab */}
      {activeTab === "profile" && (
        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium">Personal Information</h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      dateOfBirth: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={profileData.gender}
                  onChange={(e) =>
                    setProfileData({ ...profileData, gender: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-4">
                Address Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={profileData.address.street}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        address: {
                          ...profileData.address,
                          street: e.target.value,
                        },
                      })
                    }
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={profileData.address.city}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        address: {
                          ...profileData.address,
                          city: e.target.value,
                        },
                      })
                    }
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province
                  </label>
                  <input
                    type="text"
                    value={profileData.address.state}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        address: {
                          ...profileData.address,
                          state: e.target.value,
                        },
                      })
                    }
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP/Postal Code
                  </label>
                  <input
                    type="text"
                    value={profileData.address.zipCode}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        address: {
                          ...profileData.address,
                          zipCode: e.target.value,
                        },
                      })
                    }
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={profileData.address.country}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        address: {
                          ...profileData.address,
                          country: e.target.value,
                        },
                      })
                    }
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-black text-white px-6 py-2 text-sm hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="border border-gray-300 px-6 py-2 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Order History Tab */}
      {activeTab === "orders" && (
        <div>
          <h3 className="text-lg font-medium mb-6">Order History</h3>
          {ordersLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <img
                src={assets.cart_icon}
                alt="No Orders"
                className="w-16 h-16 mx-auto mb-4 opacity-50"
              />
              <h4 className="text-lg font-medium text-gray-800 mb-2">
                No Orders Yet
              </h4>
              <p className="text-gray-600 mb-6">
                You haven't placed any orders yet.
              </p>
              <button
                onClick={() => navigate("/collection")}
                className="bg-black text-white px-6 py-2 text-sm hover:bg-gray-800"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">
                        Order #{order._id.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        order.status === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "Shipped"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      {order.items.length} item(s)
                    </p>
                    <p className="font-medium">${order.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="max-w-md">
          <h3 className="text-lg font-medium mb-6">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                minLength={6}
              />
              <PasswordStrengthBar password={passwordData.newPassword} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2 text-sm hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="max-w-md space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Account Actions</h3>
            <div className="space-y-4">
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <div>
                    <p className="font-medium">Logout</p>
                    <p className="text-sm text-gray-600">
                      Sign out of your account
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={handleDeleteAccount}
                className="w-full text-left px-4 py-2 border border-red-300 rounded-md hover:bg-red-50 text-red-600"
              >
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm">
                    Permanently delete your account and all data
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Account Information</h3>
            <div className="bg-gray-50 p-4 rounded-md space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Member since:</span>
                <span className="text-sm">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Account type:</span>
                <span className="text-sm">
                  {user?.role === "admin" ? "Administrator" : "Customer"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Email verified:</span>
                <span className="text-sm">
                  {user?.emailVerified ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
