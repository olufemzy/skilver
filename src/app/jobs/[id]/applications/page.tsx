"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  MapPin,
  User,
  XCircle,
} from "lucide-react";

type Skill = {
  id: string;
  name: string;
};

type Provider = {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    location: string | null;
  };
  skills: {
    skill: Skill;
  }[];
};

type Application = {
  id: string;
  proposal: string;
  price: number;
  currency: string;
  deliveryDays: number;
  experience: string | null;
  portfolioLinks: string[];
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
  createdAt: string;
  provider: Provider;
};

type Job = {
  id: string;
  title: string;
};

export default function JobApplicationsPage() {
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!jobId) return;

    const loadApplications = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/jobs/${jobId}/applications`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load applications"
          );
        }

        setJob(data.job);
        setApplications(data.applications || []);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load applications"
        );
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [jobId]);

  const formatPrice = (
    price: number,
    currency: string
  ) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const getStatusStyles = (
    status: Application["status"]
  ) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-50 text-green-700 border-green-200";

      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";

      case "WITHDRAWN":
        return "bg-gray-100 text-gray-600 border-gray-200";

      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-3 text-gray-600">
              <Loader2
                size={22}
                className="animate-spin"
              />
              <span>Loading applications...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link
            href={`/jobs/${jobId}`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0E4A30] mb-6"
          >
            <ArrowLeft size={17} />
            Back to Job
          </Link>

          <div className="bg-white border border-red-200 rounded-2xl p-8 text-center">
            <XCircle
              size={42}
              className="mx-auto text-red-500 mb-4"
            />

            <h1 className="text-xl font-semibold text-gray-900">
              Unable to load applications
            </h1>

            <p className="text-gray-600 mt-2">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <Link
          href={`/jobs/${jobId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#0E4A30] transition mb-6"
        >
          <ArrowLeft size={17} />
          Back to Job
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-[#0E4A30] font-medium mb-2">
                <BriefcaseBusiness size={16} />
                Job Applications
              </div>

              <h1 className="text-2xl font-bold text-gray-900">
                {job?.title || "Applications"}
              </h1>

              <p className="text-gray-600 mt-2">
                Review providers who applied for this job.
              </p>
            </div>

            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E4A30]/5 text-[#0E4A30] font-semibold">
              <FileText size={18} />
              {applications.length}{" "}
              {applications.length === 1
                ? "Application"
                : "Applications"}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {applications.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FileText
                size={25}
                className="text-gray-500"
              />
            </div>

            <h2 className="text-lg font-semibold text-gray-900">
              No applications yet
            </h2>

            <p className="text-gray-600 mt-2 max-w-md mx-auto">
              Providers have not applied to this job yet.
              Check back later as more providers discover
              your job.
            </p>

            <Link
              href={`/jobs/${jobId}`}
              className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl bg-[#0E4A30] text-white font-medium hover:bg-[#0b3d27] transition"
            >
              <ArrowLeft size={16} />
              Back to Job
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {applications.map((application) => (
              <div
                key={application.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
              >
                {/* Application Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      {application.provider.user
                        .avatarUrl ? (
                        <img
                          src={
                            application.provider.user
                              .avatarUrl
                          }
                          alt={
                            application.provider.user
                              .name
                          }
                          className="w-14 h-14 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-[#0E4A30]/10 text-[#0E4A30] flex items-center justify-center font-bold text-lg">
                          {application.provider.user.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {application.provider.user.name}
                        </h2>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                          {application.provider.user
                            .location && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={14} />
                              {
                                application.provider.user
                                  .location
                              }
                            </span>
                          )}

                          <span className="inline-flex items-center gap-1">
                            <Clock size={14} />
                            Applied{" "}
                            {formatDate(
                              application.createdAt
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center self-start px-3 py-1.5 rounded-full border text-xs font-semibold ${getStatusStyles(
                        application.status
                      )}`}
                    >
                      {application.status}
                    </span>
                  </div>
                </div>

                {/* Main Content */}
                <div className="p-6">
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Proposal */}
                    <div className="lg:col-span-2">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        Proposal
                      </h3>

                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <p className="text-sm leading-6 text-gray-700 whitespace-pre-line">
                          {application.proposal}
                        </p>
                      </div>

                      {/* Experience */}
                      {application.experience && (
                        <div className="mt-5">
                          <h3 className="text-sm font-semibold text-gray-900 mb-3">
                            Experience
                          </h3>

                          <p className="text-sm leading-6 text-gray-600">
                            {application.experience}
                          </p>
                        </div>
                      )}

                      {/* Portfolio */}
                      {application.portfolioLinks &&
                        application.portfolioLinks
                          .length > 0 && (
                          <div className="mt-5">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">
                              Portfolio
                            </h3>

                            <div className="space-y-2">
                              {application.portfolioLinks.map(
                                (link, index) => (
                                  <a
                                    key={`${link}-${index}`}
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#0E4A30]/30 hover:bg-gray-50 transition"
                                  >
                                    <span className="text-sm text-[#0E4A30] truncate">
                                      {link}
                                    </span>

                                    <ExternalLink
                                      size={16}
                                      className="shrink-0 text-gray-400"
                                    />
                                  </a>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Application Summary */}
                    <div>
                      <div className="rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                          <h3 className="text-sm font-semibold text-gray-900">
                            Application Details
                          </h3>
                        </div>

                        <div className="divide-y divide-gray-100">
                          <div className="p-4">
                            <p className="text-xs text-gray-500 mb-1">
                              Proposed Price
                            </p>

                            <p className="text-lg font-bold text-[#0E4A30]">
                              {formatPrice(
                                application.price,
                                application.currency
                              )}
                            </p>
                          </div>

                          <div className="p-4">
                            <p className="text-xs text-gray-500 mb-1">
                              Delivery Time
                            </p>

                            <p className="text-sm font-semibold text-gray-900">
                              {application.deliveryDays}{" "}
                              {application.deliveryDays ===
                              1
                                ? "day"
                                : "days"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="mt-5">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                          Skills
                        </h3>

                        {application.provider.skills
                          .length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {application.provider.skills.map(
                              ({ skill }) => (
                                <span
                                  key={skill.id}
                                  className="px-2.5 py-1 rounded-lg bg-[#0E4A30]/5 text-[#0E4A30] text-xs font-medium"
                                >
                                  {skill.name}
                                </span>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            No skills listed.
                          </p>
                        )}
                      </div>

                      {/* Provider Profile */}
                      <Link
                        href={`/providers/${application.provider.id}`}
                        className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                      >
                        <User size={16} />
                        View Provider Profile
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Current Status */}
                {application.status === "PENDING" && (
                  <div className="px-6 py-4 bg-amber-50 border-t border-amber-100">
                    <div className="flex items-center gap-2 text-sm text-amber-800">
                      <Clock size={16} />
                      <span>
                        This application is waiting for
                        your review.
                      </span>
                    </div>
                  </div>
                )}

                {application.status === "ACCEPTED" && (
                  <div className="px-6 py-4 bg-green-50 border-t border-green-100">
                    <div className="flex items-center gap-2 text-sm text-green-800">
                      <CheckCircle size={16} />
                      <span>
                        This provider has been selected
                        for the job.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
