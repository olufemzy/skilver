"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  UserRound,
  ShieldCheck,
  ShieldAlert,
  UserX,
  Eye,
} from "lucide-react";

type AccountType = "STUDENT" | "CUSTOMER" | "ADMIN";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  accountType: AccountType;
  isActive: boolean;
  isSuspended: boolean;
  emailVerified: string | null;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [accountType, setAccountType] = useState("");
  const [status, setStatus] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (accountType) {
        params.set("accountType", accountType);
      }

      if (status) {
        params.set("status", status);
      }

      const response = await fetch(
        `/api/admin/users?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch users");
      }

      setUsers(data.users || []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [accountType, status]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) {
      return users;
    }

    const value = search.toLowerCase();

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(value) ||
        user.email.toLowerCase().includes(value)
    );
  }, [users, search]);

  const getStatus = (user: User) => {
    if (user.isSuspended) {
      return {
        label: "Suspended",
        className:
          "bg-red-50 text-red-700 border-red-200",
      };
    }

    if (!user.isActive) {
      return {
        label: "Inactive",
        className:
          "bg-gray-100 text-gray-600 border-gray-200",
      };
    }

    return {
      label: "Active",
      className:
        "bg-green-50 text-green-700 border-green-200",
    };
  };

  const getAccountTypeLabel = (
    accountType: AccountType
  ) => {
    if (accountType === "STUDENT") {
      return "Student / Provider";
    }

    if (accountType === "CUSTOMER") {
      return "Customer";
    }

    return "Admin";
  };

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.isActive && !user.isSuspended
  ).length;

  const suspendedUsers = users.filter(
    (user) => user.isSuspended
  ).length;

  const inactiveUsers = users.filter(
    (user) => !user.isActive
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl text-gray-900">
          Users
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage registered users and their accounts.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="card-base p-5">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <UserRound size={18} />
          </div>

          <p className="text-2xl font-display text-gray-900">
            {totalUsers}
          </p>

          <p className="mt-0.5 text-xs text-gray-500">
            Total Users
          </p>
        </div>

        <div className="card-base p-5">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-700">
            <ShieldCheck size={18} />
          </div>

          <p className="text-2xl font-display text-gray-900">
            {activeUsers}
          </p>

          <p className="mt-0.5 text-xs text-gray-500">
            Active
          </p>
        </div>

        <div className="card-base p-5">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-700">
            <ShieldAlert size={18} />
          </div>

          <p className="text-2xl font-display text-gray-900">
            {suspendedUsers}
          </p>

          <p className="mt-0.5 text-xs text-gray-500">
            Suspended
          </p>
        </div>

        <div className="card-base p-5">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
            <UserX size={18} />
          </div>

          <p className="text-2xl font-display text-gray-900">
            {inactiveUsers}
          </p>

          <p className="mt-0.5 text-xs text-gray-500">
            Inactive
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card-base p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_200px_180px]">
          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name or email..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary-900"
            />
          </div>

          {/* Account type */}
          <select
            value={accountType}
            onChange={(event) =>
              setAccountType(event.target.value)
            }
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-900"
          >
            <option value="">All account types</option>
            <option value="STUDENT">
              Students / Providers
            </option>
            <option value="CUSTOMER">
              Customers
            </option>
            <option value="ADMIN">
              Admins
            </option>
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-900"
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Users table */}
      <div className="card-base overflow-hidden">
        {loading ? (
          <div className="px-5 py-12 text-center text-sm text-gray-500">
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <UserRound
              size={32}
              className="mx-auto text-gray-300"
            />

            <p className="mt-3 text-sm font-medium text-gray-700">
              No users found
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">
                    User
                  </th>

                  <th className="hidden px-5 py-3 text-left text-xs font-semibold text-gray-500 md:table-cell">
                    Account Type
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">
                    Status
                  </th>

                  <th className="hidden px-5 py-3 text-left text-xs font-semibold text-gray-500 md:table-cell">
                    Joined
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user) => {
                  const statusInfo = getStatus(user);

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-500">
                            {user.email}
                          </p>
                        </div>
                      </td>

                      <td className="hidden px-5 py-4 md:table-cell">
                        <span className="text-sm text-gray-600">
                          {getAccountTypeLabel(
                            user.accountType
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="hidden px-5 py-4 md:table-cell">
                        <span className="text-sm text-gray-500">
                          {new Date(
                            user.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-900 hover:underline"
                        >
                          <Eye size={14} />
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Showing {filteredUsers.length} user
        {filteredUsers.length === 1 ? "" : "s"}.
      </p>
    </div>
  );
}