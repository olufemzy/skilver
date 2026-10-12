"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  UserRound,
  Eye,
} from "lucide-react";

type Project = {
  id: string;
  title: string;
  description: string;
  status: string;
  contract: {
    id: string;
    status: string;
    agreedPrice: number;
    currency: string;
    startDate: string;
    deadline: string | null;
    completedAt: string | null;
    provider: {
      id: string;
      user: {
        id: string;
        name: string | null;
        avatarUrl: string | null;
      };
    };
  };
};

function formatPrice(amount: number, currency = "NGN") {
  if (currency === "NGN") {
    return `₦${amount.toLocaleString("en-NG")}`;
  }

  return `${currency} ${amount.toLocaleString()}`;
}

function formatDate(date: string | null) {
  if (!date) return "Not specified";

  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusStyle(status: string) {
  switch (status) {
    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-700";

    case "SUBMITTED":
      return "bg-purple-50 text-purple-700";

    case "REVISION_REQUESTED":
      return "bg-orange-50 text-orange-700";

    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700";

    case "DISPUTED":
      return "bg-red-50 text-red-700";

    case "CANCELLED":
      return "bg-gray-100 text-gray-600";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function CustomerActiveProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProjects() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/customer/jobs", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load your projects."
        );
      }

      const jobs = Array.isArray(data.jobs) ? data.jobs : [];

      const activeProjects = jobs.filter(
        (job: Project) =>
          job.contract &&
          [
            "IN_PROGRESS",
            "SUBMITTED",
            "REVISION_REQUESTED",
          ].includes(job.contract.status)
      );

      setProjects(activeProjects);
    } catch (err) {
      console.error("Failed to load active projects:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your active projects."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl text-gray-900">
            Active Projects
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Track your contracted projects, providers, and deadlines.
          </p>
        </div>

        <button
          type="button"
          onClick={loadProjects}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Summary */}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card-base p-5">
            <p className="text-sm text-gray-500">
              Active Projects
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {projects.filter(
                (project) =>
                  project.contract.status === "IN_PROGRESS"
              ).length}
            </p>
          </div>

          <div className="card-base p-5">
            <p className="text-sm text-gray-500">
              Awaiting Your Review
            </p>
            <p className="mt-2 text-2xl font-bold text-purple-700">
              {projects.filter(
                (project) =>
                  project.contract.status === "SUBMITTED"
              ).length}
            </p>
          </div>

          <div className="card-base p-5">
            <p className="text-sm text-gray-500">
              Revision Requested
            </p>
            <p className="mt-2 text-2xl font-bold text-orange-700">
              {projects.filter(
                (project) =>
                  project.contract.status === "REVISION_REQUESTED"
              ).length}
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="card-base flex min-h-[260px] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 size={18} className="animate-spin" />
            Loading active projects...
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="card-base flex min-h-[240px] flex-col items-center justify-center p-6 text-center">
          <FileText size={28} className="text-red-500" />

          <h2 className="mt-3 font-semibold text-gray-900">
            Unable to load projects
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {error}
          </p>

          <button
            type="button"
            onClick={loadProjects}
            className="mt-4 rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && projects.length === 0 && (
        <div className="card-base flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-900">
            <BriefcaseBusiness size={25} />
          </div>

          <h2 className="mt-4 font-semibold text-gray-900">
            No active projects yet
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
            When you accept a provider&apos;s application, the
            resulting project will appear here. Projects awaiting
            your review will also be listed.
          </p>

          <Link
            href="/customer/jobs"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
          >
            View My Jobs
            <ChevronRight size={16} />
          </Link>
        </div>
      )}

      {/* Projects */}
      {!loading && !error && projects.length > 0 && (
        <div className="space-y-4">
          {projects.map((project) => {
            const contract = project.contract;
            const providerName =
              contract.provider.user.name || "Provider";

            return (
              <article
                key={contract.id}
                className="card-base p-5 sm:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                          contract.status
                        )}`}
                      >
                        {contract.status.replaceAll("_", " ")}
                      </span>

                      <span className="text-xs text-gray-400">
                        Contract #{contract.id.slice(0, 8)}
                      </span>
                    </div>

                    <h2 className="mt-3 text-lg font-semibold text-gray-900">
                      {project.title}
                    </h2>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                      {project.description}
                    </p>

                    {/* Provider */}
                    <div className="mt-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary-50 text-primary-900">
                        {contract.provider.user.avatarUrl ? (
                          <img
                            src={contract.provider.user.avatarUrl}
                            alt={providerName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserRound size={19} />
                        )}
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          Hired Provider
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {providerName}
                        </p>
                      </div>
                    </div>

                    {/* Contract details */}
                    <div className="mt-5 grid grid-cols-1 gap-4 rounded-xl bg-gray-50 p-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-gray-500">
                          Agreed Price
                        </p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {formatPrice(
                            contract.agreedPrice,
                            contract.currency
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar size={13} />
                          Start Date
                        </p>
                        <p className="mt-1 text-sm font-medium text-gray-900">
                          {formatDate(contract.startDate)}
                        </p>
                      </div>

                      <div>
                        <p className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock size={13} />
                          Delivery Deadline
                        </p>
                        <p className="mt-1 text-sm font-medium text-gray-900">
                          {formatDate(contract.deadline)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-col gap-2 lg:w-48">
                    <Link
                      href={`/contracts/${contract.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-800"
                    >
                      <Eye size={16} />
                      View Contract
                      <ChevronRight size={16} />
                    </Link>

                    <Link
                      href={`/jobs/${project.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-primary-900 hover:text-primary-900"
                    >
                      View Job
                      <ChevronRight size={16} />
                    </Link>

                    {contract.status === "SUBMITTED" && (
                      <p className="rounded-lg bg-purple-50 px-3 py-2 text-center text-xs leading-5 text-purple-700">
                        The provider has submitted work for your review.
                        Open the contract to approve it or request revisions.
                      </p>
                    )}

                    {contract.status === "REVISION_REQUESTED" && (
                      <p className="rounded-lg bg-orange-50 px-3 py-2 text-center text-xs leading-5 text-orange-700">
                        You have requested a revision. Open the contract to
                        check its current status.
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}