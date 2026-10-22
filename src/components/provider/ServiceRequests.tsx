"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Check, Clock, Loader2, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  budget: number | string;
  currency: string;
  deadline: string | null;
  createdAt: string;
  service: {
    id: string;
    title: string;
    providerId: string;
  } | null;
  category: {
    id: string;
    name: string;
  } | null;
  customer: {
    user: {
      id: string;
      name: string | null;
    };
  };
}

export default function ServiceRequests() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/provider/service-requests", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load service requests.");
      }

      setRequests(data.requests ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load service requests."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  async function handleDecision(
    requestId: string,
    action: "ACCEPT" | "DECLINE"
  ) {
    const confirmed = window.confirm(
      action === "ACCEPT"
        ? "Accept this service request and create a contract?"
        : "Are you sure you want to decline this service request?"
    );

    if (!confirmed) return;

    setProcessingId(requestId);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/provider/service-requests/${requestId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not process this request.");
      }

      setRequests((current) =>
        current.filter((item) => item.id !== requestId)
      );

      setMessage(
        action === "ACCEPT"
          ? "Request accepted and contract created successfully."
          : "Service request declined."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not process this request."
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900">
            Incoming Service Requests
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Requests from customers interested in your published services.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadRequests()}
          disabled={loading}
          className="text-sm font-semibold text-primary-900 hover:underline disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-2"
        >
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          {message}
        </div>
      )}

      {loading ? (
        <div className="card-base p-8 flex items-center justify-center gap-3 text-gray-500">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Loading service requests...</span>
        </div>
      ) : requests.length === 0 ? (
        <div className="card-base p-8 text-center">
          <Clock size={30} className="mx-auto mb-3 text-gray-400" />
          <p className="font-medium text-gray-800">
            No pending service requests
          </p>
          <p className="text-sm text-gray-500 mt-1">
            New requests for your published services will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((item) => (
            <article key={item.id} className="card-base p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                    Pending response
                  </span>

                  <h3 className="font-semibold text-gray-900 mt-3">
                    {item.service?.title ?? item.title}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Requested by {item.customer.user.name || "Customer"}
                    {item.category ? ` · ${item.category.name}` : ""}
                  </p>
                </div>

                <p className="text-lg font-semibold text-primary-900 whitespace-nowrap">
                  {item.currency === "NGN" || item.currency === "NGN "
                    ? "₦"
                    : `${item.currency} `}
                  {Number(item.budget).toLocaleString()}
                </p>
              </div>

              <p className="text-sm text-gray-700 mt-4 whitespace-pre-wrap">
                {item.description}
              </p>

              {item.deadline && (
                <p className="text-sm text-gray-500 mt-3">
                  Deadline:{" "}
                  {new Date(item.deadline).toLocaleDateString()}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => void handleDecision(item.id, "ACCEPT")}
                  disabled={processingId !== null}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {processingId === item.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  Accept & Create Contract
                </button>

                <button
                  type="button"
                  onClick={() => void handleDecision(item.id, "DECLINE")}
                  disabled={processingId !== null}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <X size={16} />
                  Decline
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}