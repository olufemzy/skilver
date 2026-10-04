"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Users,
  Wallet,
} from "lucide-react";

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
  status: string;
  createdAt: string;

  category: {
    id: string;
    name: string;
    slug: string;
  };

  customer: {
    id: string;
    user: {
      id: string;
      name: string;
      avatarUrl: string | null;
      location: string | null;
    };
  };

  service: {
    id: string;
    title: string;
    providerId: string;
  } | null;

  _count: {
    applications: number;
  };
};

function formatPrice(amount: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string | null) {
  if (!date) return "No deadline";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(new Date(date));
}

function getServiceTypeLabel(type: string) {
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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ProviderJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [serviceType, setServiceType] = useState("");

  async function loadJobs(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (category) {
        params.set("category", category);
      }

      if (serviceType) {
        params.set("serviceType", serviceType);
      }

      const response = await fetch(
        `/api/provider/jobs?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load available jobs"
        );
      }

      setJobs(data.jobs || []);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load available jobs"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    loadJobs();
  }

  function clearFilters() {
    setSearch("");
    setCategory("");
    setServiceType("");

    setTimeout(() => {
      loadJobs();
    }, 0);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Available Jobs
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Find jobs posted by customers that match your skills.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadJobs(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Search and filters */}
      <section className="bg-white border border-gray-200 rounded-2xl p-4">
        <form
          onSubmit={handleSearch}
          className="flex flex-col lg:flex-row gap-3"
        >
          <div className="relative flex-1">
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
              placeholder="Search jobs..."
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#0E4A30] focus:ring-2 focus:ring-[#0E4A30]/10"
            />
          </div>

          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
            className="h-11 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 outline-none focus:border-[#0E4A30]"
          >
            <option value="">All Categories</option>
            <option value="digital-tech">
              Digital & Tech
            </option>
            <option value="education">
              Education
            </option>
            <option value="professional">
              Professional
            </option>
            <option value="skilled-trades">
              Skilled Trades
            </option>
            <option value="events-media">
              Events & Media
            </option>
            <option value="fashion-beauty">
              Fashion & Beauty
            </option>
          </select>

          <select
            value={serviceType}
            onChange={(event) =>
              setServiceType(event.target.value)
            }
            className="h-11 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 outline-none focus:border-[#0E4A30]"
          >
            <option value="">All Service Types</option>
            <option value="REMOTE">Remote</option>
            <option value="PHYSICAL">Physical</option>
            <option value="BOTH">
              Remote or Physical
            </option>
          </select>

          <button
            type="submit"
            className="h-11 px-5 rounded-lg bg-[#0E4A30] text-white text-sm font-medium hover:bg-[#0B3D27]"
          >
            Search
          </button>
        </form>
      </section>

      {/* Loading */}
      {loading && (
        <div className="bg-white border border-gray-200 rounded-2xl py-16 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2
              size={20}
              className="animate-spin"
            />
            <span>Loading available jobs...</span>
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-white border border-red-200 rounded-2xl p-8 text-center">
          <p className="text-red-600 font-medium">
            {error}
          </p>

          <button
            type="button"
            onClick={() => loadJobs()}
            className="mt-4 px-4 py-2 rounded-lg bg-[#0E4A30] text-white text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && jobs.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl py-16 px-6 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
            <BriefcaseBusiness
              size={24}
              className="text-gray-400"
            />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            No available jobs
          </h2>

          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            There are currently no open jobs matching your
            search. Try changing your filters or check again
            later.
          </p>

          {(search || category || serviceType) && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 text-sm font-medium text-[#0E4A30] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Jobs */}
      {!loading && !error && jobs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {jobs.length} open{" "}
              {jobs.length === 1 ? "job" : "jobs"}
            </p>
          </div>

          {jobs.map((job) => (
            <article
              key={job.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                <div className="flex-1 min-w-0">
                  {/* Category + service request */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-green-50 text-[#0E4A30] text-xs font-medium">
                      {job.category.name}
                    </span>

                    {job.service && (
                      <span className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-medium">
                        Service Request
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <Link
                    href={`/jobs/${job.id}`}
                    className="block mt-3 text-lg font-semibold text-gray-900 hover:text-[#0E4A30]"
                  >
                    {job.title}
                  </Link>

                  {/* Description */}
                  <p className="mt-2 text-sm text-gray-500 leading-6 line-clamp-2">
                    {job.description}
                  </p>

                  {/* Job metadata */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Wallet size={14} />
                      {formatPrice(
                        job.budget,
                        job.currency
                      )}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={14} />
                      {getServiceTypeLabel(
                        job.serviceType
                      )}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <Users size={14} />
                      {job.providersNeeded} provider
                      {job.providersNeeded === 1
                        ? ""
                        : "s"} needed
                    </span>

                    {job.deadline && (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={14} />
                        Due {formatDate(job.deadline)}
                      </span>
                    )}

                    {job.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={14} />
                        {job.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right side */}
                <div className="lg:w-48 lg:text-right">
                  <div className="flex lg:justify-end items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-[#0E4A30] text-white flex items-center justify-center text-xs font-semibold">
                      {getInitials(
                        job.customer.user.name
                      )}
                    </div>

                    <div className="text-left lg:text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {job.customer.user.name}
                      </p>

                      {job.customer.user.location && (
                        <p className="text-xs text-gray-500">
                          {job.customer.user.location}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-gray-500">
                    {job._count.applications}{" "}
                    {job._count.applications === 1
                      ? "application"
                      : "applications"}
                  </p>

                  <Link
                    href={`/jobs/${job.id}`}
                    className="mt-4 inline-flex w-full lg:w-auto items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0E4A30] text-white text-sm font-medium hover:bg-[#0B3D27]"
                  >
                    View Job
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}