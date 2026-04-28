import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
import "../index.css";

const users = [
  { id: 1, name: "Soya", role: "Buyer", color: "bg-yellow-400" },
  { id: 2, name: "Chi", role: "Buyer", color: "bg-orange-400" },
  { id: 3, name: "Galoy", role: "Buyer", color: "bg-blue-400" },
  { id: 4, name: "Jape", role: "Buyer", color: "bg-green-500" },
  { id: 5, name: "Mario Santos", role: "Farmer", color: "bg-red-500" },
];

const RequestApproval = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [activeUser, setActiveUser] = useState(users[0]); // safe default
  const [activeTab, setActiveTab] = useState("information");

  const filteredUsers = users.filter((user) => {
    const matchSearch = user.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchFilter = filter === "All" || user.role === filter;
    return matchSearch && matchFilter;
  });

  return (
    <>
      <h1 className="text-2xl font-semibold mb-20">
        REQUEST APPROVAL
      </h1>

      <div className="flex gap-8">

        {/* LEFT PANEL */}
        <div className="w-80 h-[450px] bg-white rounded-xl border shadow-sm p-5 flex flex-col">

          {/* SEARCH */}
          <div className="relative mb-5">
            <input
              type="text"
              placeholder="search user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded-full py-2 px-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-green-600"
            />
            <FiSearch className="absolute right-3 top-2.5 text-gray-400" />
          </div>

          {/* FILTER */}
          <div className="flex gap-2 mb-5">
            {["All", "Farmer", "Buyer"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-1 rounded-full text-xs font-medium transition ${
                  filter === type
                    ? "bg-green-700 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* USERS */}
          <div className="space-y-2">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setActiveUser(user)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${
                    activeUser.id === user.id
                      ? "bg-green-100 border border-green-300"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm ${user.color}`}
                    >
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">
                      {user.name}
                    </span>
                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      user.role === "Farmer"
                        ? "bg-green-200 text-green-800"
                        : "bg-purple-200 text-purple-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-400 text-center mt-10">
                No users found
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="flex-1 bg-white rounded-xl border shadow-sm flex flex-col">

          {/* HEADER */}
          <div className="bg-[#3D6B0F] text-white px-6 py-4 rounded-t-xl text-lg">
            <span className="opacity-90">Applicant:</span>
            <span className="ml-4 font-semibold">
              {activeUser.name}
            </span>
          </div>

          {/* TABS */}
          <div className="px-6 pt-4 border-b flex gap-8 text-sm">
            <button
              onClick={() => setActiveTab("information")}
              className={`pb-2 ${
                activeTab === "information"
                  ? "border-b-2 border-green-700 font-medium"
                  : "text-gray-500"
              }`}
            >
              Information
            </button>

            <button
              onClick={() => setActiveTab("documents")}
              className={`pb-2 ${
                activeTab === "documents"
                  ? "border-b-2 border-green-700 font-medium"
                  : "text-gray-500"
              }`}
            >
              Documents
            </button>
          </div>

          {/* TAB CONTENT */}
          <div className="flex-1">

            {activeTab === "information" && (
              <div className="p-8 grid grid-cols-3 gap-x-16 gap-y-10 text-sm">

                <div>
                  <p className="text-gray-400 text-xs uppercase mb-2">
                    FULL NAME
                  </p>
                  <div className="bg-gray-100 px-4 py-3 rounded-md">
                    {activeUser.name}
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-xs uppercase mb-2">
                    PHONE NO.
                  </p>
                  <div className="bg-gray-100 px-4 py-3 rounded-md">
                    +63 123 456 7890
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-xs uppercase mb-2">
                    FARM SIZE
                  </p>
                  <div className="bg-gray-100 px-4 py-3 rounded-md">
                    2.5 Hectares
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-xs uppercase mb-2">
                    YEARS OF FARMING
                  </p>
                  <div className="bg-gray-100 px-4 py-3 rounded-md">
                    7 years
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-xs uppercase mb-2">
                    EMAIL
                  </p>
                  <div className="bg-gray-100 px-4 py-3 rounded-md">
                    mario.santos@gmail.com
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-xs uppercase mb-2">
                    PRODUCE
                  </p>
                  <div className="bg-gray-100 px-4 py-3 rounded-md">
                    Vegetables, Fruits
                  </div>
                </div>

              </div>
            )}

            {activeTab === "documents" && (
              <div className="p-8 grid grid-cols-3 gap-x-12 gap-y-10 text-sm">

                <div>
                  <p className="text-gray-400 text-xs uppercase mb-3">
                    FARMER CERTIFICATION
                  </p>
                  <div className="border bg-gray-100 rounded-lg p-4 hover:bg-gray-200 transition cursor-pointer">
                    📄 FARMER CERTIFICATION
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-xs uppercase mb-3">
                    BARANGAY CLEARANCE
                  </p>
                  <div className="border bg-gray-100 rounded-lg p-4 hover:bg-gray-200 transition cursor-pointer">
                    📄 BARANGAY CLEARANCE
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-xs uppercase mb-3">
                    FARM PHOTOS
                  </p>
                  <div className="border bg-gray-100 rounded-lg p-4 hover:bg-gray-200 transition cursor-pointer">
                    🖼️ FARM PHOTOS
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-xs uppercase mb-3">
                    VALID ID
                  </p>
                  <div className="border bg-gray-100 rounded-lg p-4 hover:bg-gray-200 transition cursor-pointer">
                    🪪 VALID ID
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="border-t bg-gray-50 px-6 py-4 flex justify-between items-center rounded-b-xl">
            <span className="text-xs text-gray-400">
              SUBMITTED: FEB 14, 2026
            </span>

            <div className="flex gap-4">
              <button className="px-6 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition">
                Reject
              </button>

              <button className="px-6 py-2 bg-[#3D6B0F] text-white rounded-md hover:bg-[#2f520b] transition">
                Approve Request
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default RequestApproval;
       <div className="flex gap-2 mb-6">
  {["All", "Farmer", "Buyer"].map((type) => (
    <button
      key={type}
      onClick={() => setFilter(type)}
      className={`flex-1 px-4 py-1 rounded-full text-xs font-medium transition ${
        filter === type
          ? "bg-green-700 text-white"
          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
      }`}
    >
      {type}
    </button>
  ))}
</div>