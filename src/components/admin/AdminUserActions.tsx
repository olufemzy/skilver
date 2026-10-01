"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AdminUserActionsProps = {
  userId: string;
  isActive: boolean;
  isSuspended: boolean;
  isCurrentUser: boolean;
  isAdmin: boolean;
};

export default function AdminUserActions({
  userId,
  isActive,
  isSuspended,
  isCurrentUser,
  isAdmin,
}: AdminUserActionsProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAction = async (
    action: "SUSPEND" | "ACTIVATE" | "DEACTIVATE"
  ) => {
    setError("");

    let message = "";

    if (action === "SUSPEND") {
      message =
        "Are you sure you want to suspend this user?";
    }

    if (action === "DEACTIVATE") {
      message =
        "Are you sure you want to deactivate this user?";
    }

    if (action === "ACTIVATE") {
      message =
        "Are you sure you want to activate this user?";
    }

    if (!window.confirm(message)) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/users/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update user"
        );
      }

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Prevent the current administrator from modifying
   * their own account.
   */
  if (isCurrentUser) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-800">
          This is your current administrator account.
        </p>

        <p className="text-xs text-amber-700 mt-1">
          You cannot suspend or deactivate your own account.
        </p>
      </div>
    );
  }

  /*
   * Protect other administrator accounts for now.
   */
  if (isAdmin) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm font-medium text-gray-700">
          Administrator account
        </p>

        <p className="text-xs text-gray-500 mt-1">
          Administrator accounts cannot be suspended or
          deactivated at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {isSuspended ? (
          <button
            type="button"
            onClick={() => handleAction("ACTIVATE")}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-medium hover:bg-green-800 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Activate User"}
          </button>
        ) : isActive ? (
          <>
            <button
              type="button"
              onClick={() => handleAction("SUSPEND")}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Suspend User"}
            </button>

            <button
              type="button"
              onClick={() => handleAction("DEACTIVATE")}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Deactivate User"}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => handleAction("ACTIVATE")}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-medium hover:bg-green-800 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Activate User"}
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}