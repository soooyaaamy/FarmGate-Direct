import { Routes, Route,Navigate  } from "react-router-dom";
import Sidebar from "./components/sidebar";
import Dashboard from "./pages/dashboard";
import RequestApproval from "./pages/request-approval";
import OrderPayments from "./pages/order-payments";
import RegisteredUser from "./pages/registered-user";
import ReportAnalytics from "./pages/report-analytics";

function App() {
  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-8 ml-64">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/approvals" element={<RequestApproval />} />
          <Route path="/orders" element={<OrderPayments />} />
          <Route path="/users" element={<RegisteredUser />} />
          <Route path="/reports" element={<ReportAnalytics />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
