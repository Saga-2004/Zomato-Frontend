import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";

const ROLE_STYLES = {
  admin: {
    badge: "bg-red-100 text-red-700 border border-red-200",
    dot: "bg-red-500",
  },
  customer: {
    badge: "bg-gray-100 text-gray-600 border border-gray-200",
    dot: "bg-gray-400",
  },
  restaurant_owner: {
    badge: "bg-amber-100 text-amber-700 border border-amber-200",
    dot: "bg-amber-500",
  },
  delivery_partner: {
    badge: "bg-blue-100 text-blue-700 border border-blue-200",
    dot: "bg-blue-500",
  },
};

function getRoleStyle(role) {
  return ROLE_STYLES[role] || ROLE_STYLES.customer;
}

function getInitials(name = "") {
  return (
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

const AVATAR_COLORS = [
  "from-red-400 to-orange-400",
  "from-blue-400 to-cyan-400",
  "from-violet-400 to-purple-400",
  "from-emerald-400 to-teal-400",
  "from-amber-400 to-yellow-400",
];

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

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

  const filtered = users
    .filter((u) => u.role !== "admin")
    .filter((u) => roleFilter === "all" || u.role === roleFilter)
    .filter(
      (u) =>
        !search ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()),
    );

  const roles = [
    "all",
    ...Array.from(
      new Set(users.filter((u) => u.role !== "admin").map((u) => u.role)),
    ),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-0.5">
            Management
          </p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            All Users
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm">
          <svg
            className="w-4 h-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <span className="font-medium text-gray-700">{filtered.length}</span>{" "}
          users
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg
            className="w-4 h-4 text-gray-300 absolute left-3.5 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-gray-700 placeholder-gray-300 shadow-sm focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-50 transition"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                roleFilter === role
                  ? "bg-red-500 text-white shadow-sm"
                  : "bg-white border border-gray-100 text-gray-500 hover:border-red-200 hover:text-red-500 shadow-sm"
              }`}
            >
              {role === "all" ? "All" : role.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-gray-100 rounded-full w-32" />
                  <div className="h-3 bg-gray-100 rounded-full w-48" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-gray-300"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <p className="text-gray-400 font-medium">No users found</p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="mt-2 text-red-500 text-sm hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((user, idx) => {
            const style = getRoleStyle(user.role);
            const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            return (
              <Link
                key={user._id}
                to={`/admin/users/${user._id}`}
                className="group bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm hover:border-red-200 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 block"
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center shrink-0 text-white text-sm font-bold shadow-sm`}
                >
                  {getInitials(user.name)}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors truncate">
                      {user.name}
                    </p>
                    {user.isBlocked && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-100 text-red-600 border border-red-200 uppercase tracking-wide">
                        Blocked
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm truncate">{user.email}</p>
                </div>
                {/* Role badge */}
                <span
                  className={`shrink-0 hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${style.badge}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                  {user.role.replace("_", " ")}
                </span>
                <svg
                  className="w-4 h-4 text-gray-200 group-hover:text-red-300 shrink-0 transition-all duration-200 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Users;
