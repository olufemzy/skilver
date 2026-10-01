"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  MapPin,
  XCircle,
} from "lucide-react";

interface RequestItem {
  id: string;
  title: string;
  description: string;
  budget: number;
  currency: string;
  serviceType: "REMOTE" | "PHYSICAL" | "BOTH";
  location: string | null;
  deadline: string | null;
  status: string;
  createdAt: string;

  service: {
    id: string;
    title: string;
    startPrice: number;
    maxPrice: number | null;
    currency: string;
    serviceType: "REMOTE" | "PHYSICAL" | "BOTH";
    provider: {
      id: string;
      user: {
        id: string;
        name: string;
        avatarUrl: string | null;
        location: string | null;
      };
    };
  } | null;

  category: {
    id: string;
    name: string;
    slug: string;
  };

  contract: {
    id: string;
    status: string;
    agreedPrice: number;
    currency: string;
    startDate: string;
    deadline: string | null;
  } | null;
}

function getStatusLabel(status: string) {
  switch (status) {
    case "OPEN":
      return "Pending";

    case "IN_PROGRESS":
      return "In Progress";

    case "SUBMITTED":
      return "Submitted";

    case "REVISION_REQUESTED":
      return "Revision Requested";

    case "COMPLETED":
      return "Completed";

    case "CANCELLED":
      return "Cancelled";

    case "DISPUTED":
      return "Disputed";

    case "DRAFT":
      return "Draft";

    default:
      return status.replace(/_/g, " ");
  }
}

function getStatusClasses(status: string) {
  switch (status) {
    case "OPEN":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "SUBMITTED":
      return "bg-purple-50 text-purple-700 border-purple-200";

    case "REVISION_REQUESTED":
      return "bg-orange-50 text-orange-700 border-orange-200";

    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "CANCELLED":
      return "bg-gray-100 text-gray-600 border-gray-200";

    case "DISPUTED":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CustomerRequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRequests() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/customer/requests"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load your requests."
          );
        }

        setRequests(data.requests || []);
      } catch (err) {
        console.error(
          "Failed to load requests:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load your requests."
        );
      } finally {
        setLoading(false);
      }
    }

    loadRequests();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2
          size={32}
          className="animate-spin text-primary-900"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-primary-900">
          Marketplace
        </p>

        <h1 className="mt-1 font-display text-3xl text-gray-900">
          My Requests
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Track services you have requested and monitor
          their progress.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      {!error && requests.length === 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center shadow-card">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-900/5">
            <FileText
              size={26}
              className="text-primary-900"
            />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-gray-900">
            No service requests yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            When you request a service from a provider,
            your request will appear here.
          </p>

          <Link
            href="/services"
            className="mt-6 inline-flex rounded-xl bg-primary-900 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-800"
          >
            Browse Services
          </Link>
        </div>
      )}

      {requests.length > 0 && (
        <div className="space-y-5">
          {requests.map((request) => {
            const provider =
              request.service?.provider.user;

            const currency =
              request.currency === "NGN"
                ? "₦"
                : request.currency;

            return (
              <div
                key={request.id}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                          request.status
                        )}`}
                      >
                        {getStatusLabel(
                          request.status
                        )}
                      </span>

                      <span className="text-xs text-gray-400">
                        Requested{" "}
                        {formatDate(request.createdAt)}
                      </span>
                    </div>

                    <h2 className="mt-3 text-lg font-semibold text-gray-900">
                      {request.service?.title ||
                        request.title}
                    </h2>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                      {request.description}
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    <p className="text-xs text-gray-400">
                      Your budget
                    </p>

                    <p className="mt-1 text-xl font-bold text-gray-900">
                      {currency}
                      {request.budget.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 border-t border-gray-100 pt-5 md:grid-cols-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
                      <FileText
                        size={17}
                        className="text-gray-500"
                      />
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        Category
                      </p>

                      <p className="text-sm font-medium text-gray-800">
                        {request.category.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
                      <Clock
                        size={17}
                        className="text-gray-500"
                      />
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        Service type
                      </p>

                      <p className="text-sm font-medium text-gray-800">
                        {request.serviceType ===
                        "REMOTE"
                          ? "Remote"
                          : request.serviceType ===
                              "PHYSICAL"
                            ? "Physical"
                            : "Remote & Physical"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
                      <Calendar
                        size={17}
                        className="text-gray-500"
                      />
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        Deadline
                      </p>

                      <p className="text-sm font-medium text-gray-800">
                        {request.deadline
                          ? formatDate(
                              request.deadline
                            )
                          : "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {provider && (
                  <div className="mt-5 flex flex-col gap-4 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      {provider.avatarUrl ? (
                        <Image
                          src={provider.avatarUrl}
                          alt={provider.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-900 text-sm font-semibold text-white">
                          {provider.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <div>
                        <p className="text-xs text-gray-400">
                          Provider
                        </p>

                        <p className="text-sm font-semibold text-gray-900">
                          {provider.name}
                        </p>

                        {provider.location && (
                          <p className="flex items-center gap-1 text-xs text-gray-400">
                            <MapPin size={11} />
                            {provider.location}
                          </p>
                        )}
                      </div>
                    </div>

                    {request.service && (
                      <Link
                        href={`/services/${request.service.id}`}
                        className="text-sm font-semibold text-primary-900 hover:underline"
                      >
                        View Service
                      </Link>
                    )}
                  </div>
                )}

                {request.status === "COMPLETED" && (
                  <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
                    <CheckCircle size={18} />
                    <span>
                      This service request has been
                      completed.
                    </span>
                  </div>
                )}

                {request.status === "CANCELLED" && (
                  <div className="mt-5 flex items-center gap-2 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                    <XCircle size={18} />
                    <span>
                      This service request has been
                      cancelled.
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}