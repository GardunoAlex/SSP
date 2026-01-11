import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import NewNav from "../components/newNav.jsx";


export default function AdminDashboard() {
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();
  const [users, setUsers] = useState([]);
  const [opportunities, setOpportunities] = useState([]);

  const isAdmin = user?.["https://studentstarter.com/role"] === "admin";

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;

    const fetchData = async () => {
      const token = await getAccessTokenSilently();

      const [usersRes, oppsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/opportunities`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setUsers(await usersRes.json());
      setOpportunities(await oppsRes.json());
    };

    fetchData();
  }, [isAuthenticated, isAdmin, getAccessTokenSilently]);

  if (!isAuthenticated) return <p>Please log in.</p>;
  if (!isAdmin) return <p>Access denied. Admins only.</p>;


  
  return (
    <>
    <NewNav />
    <div className="max-w-6xl mx-auto p-6 mt-20">
      <h1 className="text-3xl font-bold text-indigo-600 mb-8">Admin Dashboard</h1>

      {/* Users Table */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">All Users</h2>
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Verified</th>
              </tr>
            </thead>
            <tbody>
            {/** if the user isn't verify, display in the  */ }
              {users.filter((u) => !u.verified).map((u) => (
                <tr key={u.id} className="border-t">
                    <td className="p-3">{u.name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.role}</td>
                    <td className="p-3">
                      <button
                        onClick={async () => {

                            try {
                            const token = await getAccessTokenSilently();
                            const res = await fetch(
                                `${import.meta.env.VITE_API_BASE_URL}/api/admin/verify/${u.id}`,
                                {
                                method: "PATCH",
                                headers: { Authorization: `Bearer ${token}` },
                                }
                            );

                            if (!res.ok) throw new Error("Failed to verify user");
                            setUsers((prev) =>
                                prev.map((user) =>
                                user.id === u.id ? { ...user, verified: true } : user
                                )
                            );
                            } catch (err) {
                            console.error("Error verifying user:", err);
                            }
                        }}
                        className="text-indigo-600 hover:underline font-medium"
                        >
                        Not verified
                        </button>
                        </td>
               
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Opportunities Table */}
      <section>
        <h2 className="text-xl font-semibold mb-4">All Opportunities</h2>
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
                        onClick={async () => {
                          const token = await getAccessTokenSilently();
                          await fetch(
                            `${import.meta.env.VITE_API_BASE_URL}/api/admin/opportunity/${opp.id}/close`,
                            {
                              method: "PATCH",
                              headers: { Authorization: `Bearer ${token}` },
                            }
                          );
                          setOpportunities((prev) =>
                            prev.map((o) =>
                              o.id === opp.id ? { ...o, status: "closed" } : o
                            )
                          );
                        }}
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
      </section>
    </div>

    </>
  );
}
