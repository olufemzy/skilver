
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type RequestStatus = "ACCEPTED" | "DECLINED";

interface ServiceRequestHistoryItem {
  id: string;
  title: string;
  description: string;
  budget: number | string;
  currency: string;
  createdAt: string;
  serviceRequestStatus: RequestStatus;
  service: {
    id: string;
    title: string;
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
  contracts: {
    id: string;
    status: string;
  }[];
}


interface ServiceRequestHistoryProps {
  limit?: number;
}


export default function ServiceRequestHistory({limit,}: ServiceRequestHistoryProps) {
  const [requests, setRequests] = useState< ServiceRequestHistoryItem[]>([]);
  const [filter, setFilter] = useState<"ALL" | RequestStatus>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/provider/service-requests/history",
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load service request history."
          );
        }

        if (!cancelled) {
          setRequests(data.requests ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load service request history."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRequests =
   filter === "ALL"
      ? requests
      : requests.filter(
         (item) => item.serviceRequestStatus === filter
         );

   const displayedRequests =
   limit === undefined
      ? filteredRequests
      : filteredRequests.slice(0, limit);

  function formatAmount(
    amount: number | string,
    currency: string
  ) {
    const value = Number(amount);

    return `${currency === "NGN" ? "₦" : `${currency} `}${value.toLocaleString()}`;
  }

  return (
    <section className="space-y-4">
      {limit !== undefined && (
      <div className="flex justify-end">
         <Link
            href="/provider/service-requests"
            className="text-sm font-semibold text-primary-900 hover:underline"
         >
            View all history →
         </Link>
      </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900">
            Service Request History
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Review service requests you've already handled.
          </p>
        </div>
        

        <div className="flex flex-wrap gap-2">
          {(["ALL", "ACCEPTED", "DECLINED"] as const).map(
            (option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  filter === option
                    ? "bg-primary-900 text-white border-primary-900"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {option === "ALL"
                  ? "All"
                  : option === "ACCEPTED"
                    ? "Accepted"
                    : "Declined"}
              </button>
            )
          )}
        </div>
      </div>

      {loading ? (
        <div className="card-base p-6 text-center text-sm text-gray-500">
          Loading service request history...
        </div>
      ) : error ? (
        <div className="card-base p-6 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 text-sm font-semibold text-primary-900"
          >
            Reload page
          </button>
        </div>
      ) : displayedRequests.length === 0 ? (
        <div className="card-base p-6 text-center text-sm text-gray-500">
          {filter === "ALL"
            ? "No handled service requests yet."
            : `No ${filter.toLowerCase()} service requests found.`}
        </div>
      ) : (
        <div className="space-y-3">
          {displayedRequests.map((item) => (
            <div
              key={item.id}
              className="card-base p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="font-semibold text-sm text-gray-900">
                  {item.title}
                </p>

                <p className="text-xs text-gray-500 mt-2">
                  Service: {item.service?.title ?? "Service"}
                  {" · "}
                  Customer: {item.customer.user.name ?? "Customer"}
                </p>

                <p className="text-xs text-gray-500 mt-2">
                  Requested{" "}
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>

                {item.contracts[0] && (
                  <Link
                    href={`/contracts/${item.contracts[0].id}`}
                     className="inline-flex items-center mt-2 justify-center gap-2 rounded-xl bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-800"
                  //   className="inline-block mt-2 text-xs font-semibold text-primary-900 underline"
                  >
                    View contract
                  </Link>
                )}
              </div>

              <div className="sm:text-right shrink-0">
                <p className="font-semibold text-primary-900">
                  {formatAmount(item.budget, item.currency)}
                </p>

                <span
                  className={`inline-block mt-2 rounded-full px-2.5 py-1 text-xs font-medium ${
                    item.serviceRequestStatus === "ACCEPTED"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {item.serviceRequestStatus === "ACCEPTED"
                    ? "Accepted"
                    : "Declined"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
