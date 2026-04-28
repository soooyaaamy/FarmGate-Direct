import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers } from "react-icons/fa";
import { BsBarChartFill } from "react-icons/bs";
import farmerImg from "../assets/images/farmer.png";
import { FaUser } from "react-icons/fa6";
const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: { farmer: 0, buyer: 0 },
    total: 0,
    pending: 0,
  });

  const [pendingUsers, setPendingUsers] = useState([]);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetchStats();
    fetchPending();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchPending = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/pending");
      const data = await res.json();
      setPendingUsers(data);
    } catch (error) {
      console.error("Failed to fetch pending:", error);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold mb-8">HOME</h1>

      {/* IMPORTANT: items-stretch para pantay height */}
      <div className="flex gap-6">
        {/* ================= LEFT SIDE ================= */}
        <div className="flex-1 flex flex-col gap-6">
          {/* ================= STATS (HINDI GINALAW SIZE) ================= */}
          <div className="flex gap-6 h-50">
            {/* TOTAL FARMERS */}
            <div className="bg-white rounded-2xl shadow-sm p-6 flex-1 flex flex-col justify-center items-center">
              <div className="flex items-center space-x-4">
                <img src={farmerImg} alt="Farmer" width={40} />
                <div className="text-3xl font-bold">
                  {stats?.totalUsers?.farmer || 0}
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-2">Registered Farmers</p>
            </div>

            {/* TOTAL BUYERS */}
            <div className="bg-white rounded-2xl shadow-sm p-6 flex-1 flex flex-col justify-center items-center">
              <div className="flex items-center space-x-4">
                <FaUser size={40} />
                <div className="text-3xl font-bold">
                  {stats?.totalUsers?.buyer || 0}
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-2">Registered Buyers</p>
            </div>

            {/* TOTAL USERS */}
            <div className="bg-white rounded-2xl shadow-sm p-6 flex-1 flex flex-col justify-center items-center">
              <div className="flex items-center space-x-4">
                <FaUsers size={40} />
                <div className="text-3xl font-bold">{stats?.total || 0}</div>
              </div>
              <p className="text-gray-500 text-sm mt-2">Total Users</p>
            </div>

            {/* MONTHLY (HINDI GINALAW) */}
            <div className="bg-white rounded-2xl shadow-sm p-6 flex-1 flex flex-col justify-center items-center">
              <div className="flex items-center space-x-4">
                <BsBarChartFill size={40} />
                <div className="text-3xl font-bold">10k</div>
              </div>
              <p className="text-gray-500 text-sm mt-2">Monthly Revenue</p>
            </div>
          </div>

          {/* ================= RECENT TRANSACTIONS ================= */}
          {/* flex-1 para pantay height sa right */}
          <div className="bg-white flex-1 rounded-2xl shadow-md p-6">
            <h2 className="font-semibold text-gray-800 mb-6">
              Recent Transactions
            </h2>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 uppercase text-xs tracking-wider">
                  <th className="pb-3">Buyer</th>
                  <th>Farmer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody className="text-gray-700">
                {[
                  {
                    buyer: "Soya",
                    amount: "₱50",
                    status: "Completed",
                    color: "bg-green-100 text-green-700",
                  },
                  {
                    buyer: "Chi",
                    amount: "₱80",
                    status: "Pending",
                    color: "bg-yellow-100 text-yellow-700",
                  },
                  {
                    buyer: "Jape",
                    amount: "₱75",
                    status: "Processing",
                    color: "bg-blue-100 text-blue-700",
                  },
                  {
                    buyer: "Galoy",
                    amount: "₱90",
                    status: "Cancelled",
                    color: "bg-red-100 text-red-700",
                  },
                ].map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="py-4 font-medium">{item.buyer}</td>
                    <td>Mario Santos</td>
                    <td className="font-semibold">{item.amount}</td>
                    <td>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${item.color}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="text-gray-400">Feb 20</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div className="w-80 flex flex-col gap-6">
          {/* PENDING */}
          <div className="bg-white h-64 rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Pending Approvals</h2>
              <span
                onClick={() => {
                  if (pendingUsers.length > 0) {
                    navigate("/approvals"); // palitan mo kung iba route mo
                  }
                }}
                className={`text-sm ${
                  pendingUsers.length > 0
                    ? "text-blue-600 cursor-pointer hover:underline"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                See All
              </span>
            </div>

            {pendingUsers.length > 0 ? (
              <div className="space-y-4">
                {pendingUsers.slice(0, 4).map((user) => (
                  <div
                    key={user.id}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs mr-3">
                        {user.fullName?.charAt(0)}
                      </div>
                      <span>{user.fullName}</span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      New
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                📭 No pending approvals
              </div>
            )}
          </div>

          {/* RECENT ACTIVITY – flex-1 para pantay */}
          <div className="bg-white flex-1 rounded-2xl shadow-md p-6">
            <h2 className="font-semibold mb-6">Recent Activity</h2>

            {pendingUsers.length > 0 ? (
              <ul className="text-sm text-gray-600 space-y-4">
                {pendingUsers.slice(0, 5).map((user) => (
                  <li key={user.id}>
                    • {user.fullName} registered as{" "}
                    <span className="font-medium capitalize">{user.role}</span>
                    <br />
                    <span className="text-xs text-gray-400">
                      Submitted on {user.submitted}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                📭 No recent activity
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
