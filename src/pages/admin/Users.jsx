import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await API.get("/admin/users");
      setUsers(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const roleBadge = (role) => {
    const styles = {
      admin: "bg-red-100 text-red-800",
      customer: "bg-gray-100 text-gray-800",
      restaurant_owner: "bg-amber-100 text-amber-800",
      delivery_partner: "bg-blue-100 text-blue-800",
    };
    return styles[role] || "bg-gray-100 text-gray-800";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">All Users</h1>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          Loading users…
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          No users found.
        </div>
      ) : (
        <ul className="space-y-3">
          {users
            .filter((user) => user.role !== "admin")
            .map((user) => (
              <li key={user._id}>
                <Link
                  to={`/admin/users/${user._id}`}
                  className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm hover:border-red-200 hover:shadow-md transition"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-gray-500 text-sm">{user.email}</p>
                  </div>
                  <span
                    className={`text-sm font-medium px-3 py-1 rounded-full ${roleBadge(user.role)}`}
                  >
                    {user.role}
                  </span>
                  {user.isBlocked && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-100 text-red-800">
                      Blocked
                    </span>
                  )}
                </Link>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

export default Users;
