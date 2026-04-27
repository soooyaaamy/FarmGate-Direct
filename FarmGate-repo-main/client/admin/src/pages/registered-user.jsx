import React from "react";

const RegisteredUser = () => {
  const users = [
    {
      name: "Soya",
      email: "soya@gmail.com",
      role: "Buyer",
      joined: "01-05-2026",
      status: "Active",
      transactions: "₱6,000",
    },
    {
      name: "Chi",
      email: "chi@gmail.com",
      role: "Buyer",
      joined: "01-05-2026",
      status: "Active",
      transactions: "₱5,550",
    },
    {
      name: "Jape",
      email: "jape@gmail.com",
      role: "Buyer",
      joined: "01-05-2026",
      status: "Active",
      transactions: "₱8,950",
    },
    {
      name: "Galoy",
      email: "galoy@gmail.com",
      role: "Buyer",
      joined: "01-05-2026",
      status: "Active",
      transactions: "₱6,700",
    },
    {
      name: "Mario Santos",
      email: "mariosantos@gmail.com",
      role: "Farmer",
      joined: "02-23-2025",
      status: "Active",
      transactions: "₱15,850",
    },
  ];

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">
        REGISTERED USERS
      </h1>

      {/* FILTER BAR */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search user..."
          className="w-1/3 bg-gray-100 px-4 py-2 rounded-lg outline-none text-sm"
        />

        <div className="flex gap-3 items-center">
          <select className="bg-gray-100 px-3 py-2 rounded-lg text-sm">
            <option>All Roles</option>
          </select>

          <select className="bg-gray-100 px-3 py-2 rounded-lg text-sm">
            <option>All Status</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white h-110 rounded-2xl shadow-md p-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 uppercase text-xs tracking-wider">
              <th className="pb-4">User</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Transactions</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody className="text-gray-700">
            {users.map((user, i) => (
              <tr key={i} className="hover:bg-gray-50 transition">
                {/* USER */}
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>

                {/* ROLE */}
                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === "Farmer"
                        ? "bg-green-100 text-green-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>

                {/* JOINED */}
                <td>{user.joined}</td>

                {/* STATUS */}
                <td>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                    {user.status}
                  </span>
                </td>

                {/* TRANSACTIONS */}
                <td className="font-semibold">
                  {user.transactions}
                </td>

                {/* ACTIONS */}
                <td>
                  <div className="flex gap-2">
                    <button className="bg-gray-200 px-2 py-1 rounded-md text-xs">
                      👁
                    </button>
                    <button className="bg-purple-200 text-purple-700 px-2 py-1 rounded-md text-xs">
                      ✏
                    </button>
                    <button className="bg-red-200 text-red-600 px-2 py-1 rounded-md text-xs">
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default RegisteredUser;