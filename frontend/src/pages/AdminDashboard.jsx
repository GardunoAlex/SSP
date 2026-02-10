import { useEffect, useState, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { AdminDashboardSkeleton } from "../components/Skeletons";
import NewNav from "../components/newNav.jsx";
import ConfirmModal from "../components/ConfirmModal";
import { ChevronDown, ChevronRight } from "lucide-react";

const MIN_LOAD_MS = 300;

const STATUS_LABELS = {
  not_verified: { text: "Not Verified", color: "text-red-500" },
  in_progress: { text: "In Progress", color: "text-yellow-600" },
  verified: { text: "Verified", color: "text-green-600" },
};

export default function AdminDashboard() {
  const { isAuthenticated, isLoading: authLoading, getAccessTokenSilently, user } = useAuth0();
  const [users, setUsers] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState({ users: true, orgs: true, opps: true });

  // ConfirmModal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    confirmColor: "red",
    action: null,
  });

  const toggleSection = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const isAdmin = user?.["https://studentstarter.com/role"] === "admin";

  const openConfirm = useCallback(({ title, message, confirmText, confirmColor, action }) => {
    setConfirmModal({ isOpen: true, title, message, confirmText: confirmText || "Confirm", confirmColor: confirmColor || "red", action });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (confirmModal.action) await confirmModal.action();
    setConfirmModal((prev) => ({ ...prev, isOpen: false, action: null }));
  }, [confirmModal.action]);

  const handleCancelConfirm = useCallback(() => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false, action: null }));
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !isAdmin) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      const minDelay = new Promise(r => setTimeout(r, MIN_LOAD_MS));
      const token = await getAccessTokenSilently();

      const [usersRes, oppsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/opportunities`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        minDelay
      ]);

      setUsers(await usersRes.json());
      setOpportunities(await oppsRes.json());
      setLoading(false);
    };

    fetchData();
  }, [isAuthenticated, authLoading, isAdmin, getAccessTokenSilently]);

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/verify/${userId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!res.ok) throw new Error("Failed to update status");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, verified: newStatus } : u))
      );
    } catch (err) {
      console.error("Error updating verification status:", err);
    }
  };

  const handleRemoveOrg = async (orgId) => {
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/organization/${orgId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to remove organization");
      setUsers((prev) => prev.filter((u) => u.id !== orgId));
      setOpportunities((prev) => prev.filter((opp) => opp.org_id !== orgId));
    } catch (err) {
      console.error("Error removing organization:", err);
    }
  };

  const handleCloseOpp = async (oppId) => {
    try {
      const token = await getAccessTokenSilently();
      await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/opportunity/${oppId}/close`,
        { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }
      );
      setOpportunities((prev) =>
        prev.map((o) => (o.id === oppId ? { ...o, status: "closed" } : o))
      );
    } catch (err) {
      console.error("Error closing opportunity:", err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 mt-20">
        <AdminDashboardSkeleton />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <NewNav />
        <div className="max-w-6xl mx-auto p-6 mt-20">
          <p className="text-center text-slate-600">
            You don’t have access to this page.
          </p>
        </div>
      </>
    );
  }

  return (
  <>
    <NewNav />

    <div className="max-w-6xl mx-auto p-6 mt-20">
      <h1 className="text-3xl font-bold text-indigo-600 mb-8">
        Admin Dashboard
      </h1>

      {/* USERS */}
      <section className="mb-10">
        <button
          onClick={() => toggleSection("users")}
          className="flex items-center gap-2 text-xl font-semibold mb-4 hover:text-indigo-600 transition-colors"
        >
          {openSections.users ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          All Users ({users.length})
        </button>

        {openSections.users && (
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full bg-white table-fixed">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left w-[25%]">Name</th>
                  <th className="p-3 text-left w-[30%]">Email</th>
                  <th className="p-3 text-left w-[10%]">Role</th>
                  <th className="p-3 text-left w-[20%]">Verification</th>
                  <th className="p-3 text-left w-[15%]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const status =
                    STATUS_LABELS[u.verified] || STATUS_LABELS.not_verified;

                  return (
                    <tr key={u.id} className="border-t">
                      <td className="p-3 truncate">{u.name}</td>
                      <td className="p-3 truncate">{u.email}</td>
                      <td className="p-3">{u.role}</td>
                      <td className="p-3">
                        <select
                          value={u.verified || "not_verified"}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            openConfirm({
                              title: "Change Verification Status",
                              message: `Set "${u.name}" to "${STATUS_LABELS[newStatus].text}"?`,
                              confirmText: "Update",
                              confirmColor: "purple",
                              action: () =>
                                handleStatusChange(u.id, newStatus),
                            });
                          }}
                          className={`text-sm font-medium rounded-lg px-2 py-1 border ${status.color}`}
                        >
                          <option value="not_verified">Not Verified</option>
                          <option value="in_progress">In Progress</option>
                          <option value="verified">Verified</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <button
                          className="text-red-500 hover:underline font-medium"
                          onClick={() =>
                            openConfirm({
                              title: "Remove Organization",
                              message: `Remove "${u.name}"? This will delete the organization and all its opportunities.`,
                              confirmText: "Remove",
                              action: () => handleRemoveOrg(u.id),
                            })
                          }
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ORGS */}
      <section className="mb-10">
        <button
          onClick={() => toggleSection("orgs")}
          className="flex items-center gap-2 text-xl font-semibold mb-4 hover:text-indigo-600 transition-colors"
        >
          {openSections.orgs ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          All Organizations ({users.length})
        </button>

        {openSections.orgs && (
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full bg-white table-fixed">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left w-[25%]">Name</th>
                  <th className="p-3 text-left w-[35%]">Email</th>
                  <th className="p-3 text-left w-[15%]">Verified</th>
                  <th className="p-3 text-left w-[25%]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const status =
                    STATUS_LABELS[u.verified] || STATUS_LABELS.not_verified;

                  return (
                    <tr key={u.id} className="border-t">
                      <td className="p-3 truncate">{u.name}</td>
                      <td className="p-3 truncate">{u.email}</td>
                      <td className="p-3 font-medium">
                        <span className={status.color}>{status.text}</span>
                      </td>
                      <td className="p-3">
                        <button
                          className="text-red-500 hover:underline font-medium"
                          onClick={() =>
                            openConfirm({
                              title: "Remove Organization",
                              message: `Remove "${u.name}"? This will delete the organization and all its opportunities.`,
                              confirmText: "Remove",
                              action: () => handleRemoveOrg(u.id),
                            })
                          }
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* OPPORTUNITIES */}
      <section>
        <button
          onClick={() => toggleSection("opps")}
          className="flex items-center gap-2 text-xl font-semibold mb-4 hover:text-indigo-600 transition-colors"
        >
          {openSections.opps ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          All Opportunities ({opportunities.length})
        </button>

        {openSections.opps && (
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Org</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((opp) => (
                  <tr key={opp.id} className="border-t">
                    <td className="p-3">{opp.title}</td>
                    <td className="p-3">{opp.users?.name || "Unknown"}</td>
                    <td className="p-3">{opp.status}</td>
                    <td className="p-3">
                      {opp.status === "active" && (
                        <button
                          className="text-red-500 hover:underline"
                          onClick={() =>
                            openConfirm({
                              title: "Close Opportunity",
                              message: `Close "${opp.title}"?`,
                              confirmText: "Close",
                              action: () => handleCloseOpp(opp.id),
                            })
                          }
                        >
                          Close
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>

    <ConfirmModal
      isOpen={confirmModal.isOpen}
      onConfirm={handleConfirm}
      onCancel={handleCancelConfirm}
      title={confirmModal.title}
      message={confirmModal.message}
      confirmText={confirmModal.confirmText}
      confirmColor={confirmModal.confirmColor}
    />
  </>
);
}
