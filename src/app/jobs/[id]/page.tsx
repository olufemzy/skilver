"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  MapPin,
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
  attachments: unknown;
  createdAt: string;
  updatedAt: string;

  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  };

  customer: {
    id: string;
    user: {
      id: string;
      name: string;
      avatarUrl: string | null;
      location: string | null;
      createdAt: string;
    };
  };

  service: {
    id: string;
    title: string;
    startPrice: number;
    maxPrice: number | null;
    serviceType: string;
    provider: {
      id: string;
      user: {
        id: string;
        name: string;
        avatarUrl: string | null;
      };
    };
  } | null;

  skills: {
    id: string;
    skill: {
      id: string;
      name: string;
      slug: string;
    };
  }[];

  applications: {
    id: string;
    providerId: string;
    price: number;
    deliveryDays: number;
    status: string;
    createdAt: string;
    provider: {
      id: string;
      averageRating: number;
      totalReviews: number;
      jobsCompleted: number;
      user: {
        id: string;
        name: string;
        avatarUrl: string | null;
        location: string | null;
      };
    };
  }[];

  contract: {
    id: string;
    agreedPrice: number;
    currency: string;
    startDate: string;
    deadline: string | null;
    status: string;
    submittedAt: string | null;
    completedAt: string | null;
  } | null;

  _count: {
    applications: number;
  };

  currentUser: {
    id: string;
    role: string;
    isOwner: boolean;
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
  if (!date) return "Not specified";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(new Date(date));
}

function getStatusLabel(status: string) {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusClasses(status: string) {
  switch (status) {
    case "OPEN":
      return "bg-green-50 text-green-700 border-green-200";

    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "SUBMITTED":
      return "bg-purple-50 text-purple-700 border-purple-200";

    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";

    case "DISPUTED":
      return "bg-orange-50 text-orange-700 border-orange-200";

    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
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

export default function JobDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadJob() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/jobs/${params.id}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load job");
        }

        setJob(data.job);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load job"
        );
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading job details...</span>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <FileText className="w-6 h-6 text-red-500" />
          </div>

          <h1 className="text-xl font-semibold text-gray-900">
            Unable to load job
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {error || "This job could not be found."}
          </p>

          <Link
            href="/customer/jobs"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2.5 rounded-lg bg-[#0E4A30] text-white text-sm font-medium hover:bg-[#0B3D27]"
          >
            <ArrowLeft size={16} />
            Back to My Jobs
          </Link>
        </div>
      </div>
    );
  }

  const isCustomerOwner = job.currentUser.isOwner;
  const isProvider = job.currentUser.role === "PROVIDER";
  const isAdmin = job.currentUser.role === "ADMIN";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href={
          isCustomerOwner
            ? "/customer/jobs"
            : isProvider
              ? "/provider/jobs"
              : "/admin"
        }
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0E4A30] mb-6"
      >
        <ArrowLeft size={16} />
        Back
      </Link>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        {/* Main content */}
        <main className="space-y-6">
          {/* Job header */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span
                className={`px-3 py-1 rounded-full border text-xs font-medium ${getStatusClasses(
                  job.status
                )}`}
              >
                {getStatusLabel(job.status)}
              </span>

              <span className="px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-600">
                {job.category.name}
              </span>

              {job.service && (
                <span className="px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-xs text-orange-700">
                  Service Request
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {job.title}
            </h1>

            <p className="mt-3 text-sm text-gray-500">
              Posted {formatDate(job.createdAt)}
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 text-[#0E4A30] flex items-center justify-center">
                  <Wallet size={19} />
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Budget
                  </p>

                  <p className="font-semibold text-gray-900">
                    {formatPrice(job.budget, job.currency)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Clock size={19} />
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Deadline
                  </p>

                  <p className="font-semibold text-gray-900">
                    {formatDate(job.deadline)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Users size={19} />
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Providers Needed
                  </p>

                  <p className="font-semibold text-gray-900">
                    {job.providersNeeded}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center">
                  <BriefcaseBusiness size={19} />
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Service Type
                  </p>

                  <p className="font-semibold text-gray-900">
                    {getServiceTypeLabel(job.serviceType)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Job Description
            </h2>

            <div className="mt-4 text-sm leading-7 text-gray-600 whitespace-pre-wrap">
              {job.description}
            </div>
          </section>

          {/* Location */}
          {job.location && (
            <section className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <MapPin size={19} />
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Location
                  </p>

                  <p className="font-medium text-gray-900">
                    {job.location}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Skills */}
          {job.skills.length > 0 && (
            <section className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Required Skills
              </h2>

              <div className="flex flex-wrap gap-2 mt-4">
                {job.skills.map(({ id, skill }) => (
                  <span
                    key={id}
                    className="px-3 py-1.5 rounded-lg bg-green-50 text-[#0E4A30] border border-green-100 text-sm"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Service information */}
          {job.service && (
            <section className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Requested Service
              </h2>

              <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="font-medium text-gray-900">
                  {job.service.title}
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  Offered by{" "}
                  <span className="font-medium text-gray-700">
                    {job.service.provider.user.name}
                  </span>
                </p>

                <div className="mt-3 text-sm text-gray-600">
                  Starting price:{" "}
                  <span className="font-medium text-gray-900">
                    {formatPrice(
                      job.service.startPrice,
                      job.currency
                    )}
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* Contract */}
          {job.contract && (
            <section className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 text-[#0E4A30] flex items-center justify-center">
                  <CheckCircle2 size={19} />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">
                    Contract
                  </h2>

                  <p className="text-sm text-gray-500">
                    This job has an active contract.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mt-5">
                <div>
                  <p className="text-xs text-gray-500">
                    Agreed Price
                  </p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {formatPrice(
                      job.contract.agreedPrice,
                      job.contract.currency
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Status
                  </p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {getStatusLabel(job.contract.status)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Start Date
                  </p>
                  <p className="font-medium text-gray-900 mt-1">
                    {formatDate(job.contract.startDate)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Deadline
                  </p>
                  <p className="font-medium text-gray-900 mt-1">
                    {formatDate(job.contract.deadline)}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Customer applications */}
          {(isCustomerOwner || isAdmin) &&
            job.applications.length > 0 && (
              <section className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Applications
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      {job._count.applications} provider
                      {job._count.applications === 1
                        ? ""
                        : "s"} applied for this job.
                    </p>
                  </div>

                  <Link
                    href={`/jobs/${job.id}/applications`}
                    className="text-sm font-medium text-[#0E4A30] hover:underline"
                  >
                    Review Applications
                  </Link>
                </div>

                <div className="mt-5 space-y-3">
                  {job.applications.slice(0, 3).map((application) => (
                    <div
                      key={application.id}
                      className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-100"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {application.provider.user.name}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {application.provider.jobsCompleted} jobs
                          completed
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatPrice(
                            application.price,
                            job.currency
                          )}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {application.deliveryDays} days
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
        </main>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Main action */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 lg:sticky lg:top-6">
            {isCustomerOwner ? (
              <>
                <p className="text-sm text-gray-500">
                  Applications
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {job._count.applications}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  provider
                  {job._count.applications === 1
                    ? ""
                    : "s"} interested in this job
                </p>

                <Link
                  href={`/jobs/${job.id}/applications`}
                  className="mt-5 w-full inline-flex items-center justify-center px-4 py-3 rounded-xl bg-[#0E4A30] text-white font-medium hover:bg-[#0B3D27]"
                >
                  Review Applications
                </Link>
              </>
            ) : isProvider ? (
              <>
                <p className="text-sm font-medium text-gray-900">
                  Interested in this job?
                </p>

                <p className="text-sm text-gray-500 mt-2 leading-6">
                  Submit a proposal and tell the customer why
                  you are the right provider for this job.
                </p>

                {job.status === "OPEN" ? (
                  <Link
                    href={`/jobs/${job.id}/apply`}
                    className="mt-5 w-full inline-flex items-center justify-center px-4 py-3 rounded-xl bg-[#0E4A30] text-white font-medium hover:bg-[#0B3D27]"
                  >
                    Apply for This Job
                  </Link>
                ) : (
                  <div className="mt-5 px-4 py-3 rounded-xl bg-gray-100 text-gray-500 text-sm text-center">
                    This job is no longer accepting applications.
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500">
                  Job Status
                </p>

                <div
                  className={`mt-3 inline-flex px-3 py-1.5 rounded-full border text-sm font-medium ${getStatusClasses(
                    job.status
                  )}`}
                >
                  {getStatusLabel(job.status)}
                </div>
              </>
            )}
          </section>

          {/* Customer */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-semibold text-gray-900">
              Posted By
            </h2>

            <div className="flex items-center gap-3 mt-4">
              <div className="w-11 h-11 rounded-full bg-[#0E4A30] text-white flex items-center justify-center font-semibold">
                {job.customer.user.name
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {job.customer.user.name}
                </p>

                {job.customer.user.location && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin size={12} />
                    {job.customer.user.location}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Customer since
              </p>

              <p className="text-sm font-medium text-gray-900 mt-1">
                {formatDate(job.customer.user.createdAt)}
              </p>
            </div>
          </section>

          {/* Job summary */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-semibold text-gray-900">
              Job Summary
            </h2>

            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-500">
                  Category
                </span>
                <span className="text-sm font-medium text-gray-900 text-right">
                  {job.category.name}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-500">
                  Service Type
                </span>
                <span className="text-sm font-medium text-gray-900 text-right">
                  {getServiceTypeLabel(job.serviceType)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-500">
                  Providers Needed
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {job.providersNeeded}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-500">
                  Applications
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {job._count.applications}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-500">
                  Posted
                </span>
                <span className="text-sm font-medium text-gray-900 text-right">
                  {formatDate(job.createdAt)}
                </span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}