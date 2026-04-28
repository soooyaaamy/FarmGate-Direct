import React, { useState } from "react";

const OrderPayments = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  const orders = [
    {
      id: "#001",
      buyer: "Soya",
      farmer: "Mario Santos",
      produce: "Tomato",
      amount: "₱60",
      status: "Completed",
      date: "Feb 19, 2026",
    },
    {
      id: "#002",
      buyer: "Soya",
      farmer: "Mario Santos",
      produce: "Eggplant",
      amount: "₱70",
      status: "Pending",
      date: "Feb 19, 2026",
    },
    {
      id: "#003",
      buyer: "Soya",
      farmer: "Mario Santos",
      produce: "Okra",
      amount: "₱70",
      status: "Processing",
      date: "Feb 19, 2026",
    },
    {
      id: "#004",
      buyer: "Soya",
      farmer: "Mario Santos",
      produce: "Chilli",
      amount: "₱120",
      status: "Cancelled",
      date: "Feb 19, 2026",
    },
  ];

  const filteredOrders =
    activeFilter === "All"
      ? orders
      : orders.filter((order) => order.status === activeFilter);

  const statusStyle = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Processing":
        return "bg-purple-100 text-purple-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "";
    }
  };

  return (
    <>
      {/* TITLE */}
      <h1 className="text-2xl font-semibold mb-8">ORDER & PAYMENTS</h1>

      {/* FILTERS */}
      <div className="flex gap-3 mb-8">
        {["All", "Completed", "Processing", "Pending", "Cancelled"].map(
          (filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-1.5 rounded-full text-sm transition ${
                activeFilter === filter
                  ? "bg-green-700 text-white"
                  : "bg-white shadow-sm text-green-700"
              }`}
            >
              {filter}
            </button>
          ),
        )}
      </div>

      {/* ORDER & PAYMENTS */}
      <div className="bg-white h-120 rounded-2xl shadow-md p-6">
        <h2 className="font-semibold text-gray-800 mb-6">
          Transaction Records
        </h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 uppercase text-xs tracking-wider">
              <th className="pb-3">Order ID</th>
              <th>Buyer</th>
              <th>Farmer</th>
              <th>Produce</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody className="text-gray-700">
            {filteredOrders.map((order, i) => (
              <tr key={i} className="hover:bg-gray-50 transition">
                <td className="py-4">{order.id}</td>

                <td className="font-medium">{order.buyer}</td>

                <td>{order.farmer}</td>

                <td>{order.produce}</td>

                <td className="font-semibold">{order.amount}</td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : order.status === "Processing"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>

                <td className="text-gray-400">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default OrderPayments;
