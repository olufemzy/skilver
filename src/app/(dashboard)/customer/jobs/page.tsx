"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";

type JobStatus =
  | "DRAFT"
  | "OPEN"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "REVISION_REQUESTED"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED";

type Job = {
  id: string;
  title: string;
  description: string;
  budget: number;
  currency: string;
  serviceType: "REMOTE" | "PHYSICAL" | "BOTH";
  location: string | null;
  deadline: string | null;
  providersNeeded: number;
  status: JobStatus;
  createdAt: string;

  category: {
    id: string;
    name: string;
    slug: string;
  };

  service: {
    id: string;
    title: string;
  } | null;

  _count: {
    applications: number;
  };

  contract: {
    id: string;
    status: JobStatus;
    agreedPrice: number;
    currency: string;
    startDate: string;
    deadline: string | null;
    completedAt: string | null;
  } | null;
};

const statusConfig: Record<
  JobStatus,
  {
    label: string;
    className: string;
  }
> = {
  DRAFT: {
    label: "Draft",
    className: "bg-gray-100 text-gray-700",
  },
  OPEN: {
    label: "Open",
    className: "bg-green-50 text-green-700",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-blue-50 text-blue-700",
  },
  SUBMITTED: {
    label: "Submitted",
    className: "bg-purple-50 text-purple-700",
  },
  REVISION_REQUESTED: {
    label: "Revision Requested",
    className: "bg-orange-50 text-orange-700",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-500",
  },
  DISPUTED: {
    label: "Disputed",
    className: "bg-red-50 text-red-700",
  },
};

function formatPrice(amount: number, currency = "NGN") {
  if (currency === "NGN") {
    return `₦${amount.toLocaleString()}`;
  }

  return `${currency} ${amount.toLocaleString()}`;
}

function formatDate(date: string | null) {
  if (!date) return "No deadline";

  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatServiceType(type: Job["serviceType"]) {
  switch (type) {
    case "REMOTE":
      return "Remote";
    case "PHYSICAL":
      return "Physical";
    case "BOTH":
      return "Remote or Physical";
    default:
      return type;
  }
}

export default function CustomerJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "ALL" | JobStatus
  >("ALL");

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/customer/jobs");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load jobs");
      }

      setJobs(data.jobs || []);
    } catch (err) {
      console.error("Failed to load customer jobs:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load your jobs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const stats = useMemo(() => {
    return {
      total: jobs.length,

      open: jobs.filter((job) => job.status === "OPEN").length,

      inProgress: jobs.filter(
        (job) =>
          job.status === "IN_PROGRESS" ||
          job.status === "SUBMITTED" ||
          job.status === "REVISION_REQUESTED"
      ).length,

      completed: jobs.filter(
        (job) => job.status === "COMPLETED"
      ).length,
    };
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    if (activeFilter === "ALL") {
      return jobs;
    }

    return jobs.filter((job) => job.status === activeFilter);
  }, [jobs, activeFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl text-gray-900">
            My Jobs
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage the jobs you have posted and track their progress.
          </p>
        </div>

        <Link
          href="/customer/post-jobs"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-800"
        >
          <Plus size={17} />
          Post a Job
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="card-base p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Jobs</p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {stats.total}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
              <BriefcaseBusiness size={19} />
            </div>
          </div>
        </div>

        <div className="card-base p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Open Jobs</p>

              <p className="mt-2 text-2xl font-bold text-green-700">
                {stats.open}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
              <FileText size={19} />
            </div>
          </div>
        </div>

        <div className="card-base p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">In Progress</p>

              <p className="mt-2 text-2xl font-bold text-blue-700">
                {stats.inProgress}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Clock size={19} />
            </div>
          </div>
        </div>

        <div className="card-base p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>

              <p className="mt-2 text-2xl font-bold text-emerald-700">
                {stats.completed}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <BriefcaseBusiness size={19} />
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Section */}
      <section className="card-base overflow-hidden">
        {/* Section Header */}
        <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">
                Your Jobs
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {filteredJobs.length}{" "}
                {filteredJobs.length === 1 ? "job" : "jobs"}
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {[
                { value: "ALL", label: "All" },
                { value: "OPEN", label: "Open" },
                {
                  value: "IN_PROGRESS",
                  label: "In Progress",
                },
                {
                  value: "COMPLETED",
                  label: "Completed",
                },
              ].map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() =>
                    setActiveFilter(
                      filter.value as "ALL" | JobStatus
                    )
                  }
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeFilter === filter.value
                      ? "bg-primary-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}

              <button
                type="button"
                onClick={loadJobs}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
                title="Refresh jobs"
              >
                <RefreshCw
                  size={13}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[280px] items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2
                size={18}
                className="animate-spin"
              />
              Loading your jobs...
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <FileText size={21} />
            </div>

            <h3 className="mt-4 font-semibold text-gray-900">
              Unable to load jobs
            </h3>

            <p className="mt-1 max-w-sm text-sm text-gray-500">
              {error}
            </p>

            <button
              type="button"
              onClick={loadJobs}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading &&
          !error &&
          filteredJobs.length === 0 && (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-900">
                <BriefcaseBusiness size={24} />
              </div>

              <h3 className="mt-4 font-semibold text-gray-900">
                {activeFilter === "ALL"
                  ? "You haven't posted any jobs yet"
                  : "No jobs found"}
              </h3>

              <p className="mt-1 max-w-sm text-sm text-gray-500">
                {activeFilter === "ALL"
                  ? "Post your first job and let verified providers apply."
                  : `You don't have any ${statusConfig[
                      activeFilter
                    ]?.label.toLowerCase() || "matching"} jobs.`}
              </p>

              {activeFilter === "ALL" && (
                <Link
                  href="/customer/post-jobs"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
                >
                  <Plus size={16} />
                  Post Your First Job
                </Link>
              )}
            </div>
          )}

        {/* Job List */}
        {!loading &&
          !error &&
          filteredJobs.length > 0 && (
            <div className="divide-y divide-gray-100">
              {filteredJobs.map((job) => {
                const status =
                  statusConfig[job.status];

                return (
                  <div
                    key={job.id}
                    className="p-5 transition hover:bg-gray-50/60 sm:p-6"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      {/* Main information */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${status.className}`}
                          >
                            {status.label}
                          </span>

                          <span className="text-xs text-gray-400">
                            {job.category.name}
                          </span>
                        </div>

                        <h3 className="mt-3 text-base font-semibold text-gray-900 sm:text-lg">
                          {job.title}
                        </h3>

                        <p className="mt-1.5 line-clamp-2 max-w-2xl text-sm leading-6 text-gray-500">
                          {job.description}
                        </p>

                        {/* Job metadata */}
                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="font-semibold text-gray-800">
                              {formatPrice(
                                job.budget,
                                job.currency
                              )}
                            </span>
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <Users size={14} />
                            {job._count.applications}{" "}
                            {job._count.applications === 1
                              ? "application"
                              : "applications"}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <BriefcaseBusiness size={14} />
                            {job.providersNeeded}{" "}
                            {job.providersNeeded === 1
                              ? "provider"
                              : "providers"}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <MapPin size={14} />
                            {formatServiceType(
                              job.serviceType
                            )}
                          </span>

                          {job.location && (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin size={14} />
                              {job.location}
                            </span>
                          )}
                        </div>

                        {/* Deadline */}
                        {job.deadline && (
                          <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                            <Calendar size={14} />
                            Deadline:{" "}
                            <span className="font-semibold text-gray-800">
                              {formatDate(job.deadline)}
                            </span>
                          </div>
                        )}

                        {/* Contract information */}
                        {job.contract && (
                          <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-blue-800">
                              <span className="font-semibold">
                                Contract active
                              </span>

                              <span>
                                Agreed:{" "}
                                <strong>
                                  {formatPrice(
                                    job.contract
                                      .agreedPrice,
                                    job.contract
                                      .currency
                                  )}
                                </strong>
                              </span>

                              {job.contract.deadline && (
                                <span>
                                  Deadline:{" "}
                                  <strong>
                                    {formatDate(
                                      job.contract.deadline
                                    )}
                                  </strong>
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <p className="mt-4 text-xs text-gray-400">
                          Posted{" "}
                          {formatDate(job.createdAt)}
                        </p>
                      </div>

                      {/* Action */}
                      <div className="flex shrink-0 lg:pt-1">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-primary-900 hover:text-primary-900 sm:w-auto"
                        >
                          View Job
                          <ChevronRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </section>
    </div>
  );
}
