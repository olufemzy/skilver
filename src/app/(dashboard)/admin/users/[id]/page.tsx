import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  UserRound,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Briefcase,
  Star,
  Wallet,
} from "lucide-react";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import AdminUserActions from "@/components/admin/AdminUserActions";

interface AdminUserPageProps {
  params: {
    id: string;
  };
}

export default async function AdminUserPage({
  params,
}: AdminUserPageProps) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: {
      id: params.id,
    },
    include: {
      providerProfile: {
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
        },
      },
      customerProfile: true,
    },
  });

  if (!user) {
    notFound();
  }

  const status = user.isSuspended
    ? "Suspended"
    : user.isActive
      ? "Active"
      : "Inactive";

  const statusClasses = user.isSuspended
    ? "bg-red-50 text-red-700 border-red-200"
    : user.isActive
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-gray-100 text-gray-600 border-gray-200";

  const accountType =
    user.accountType === "STUDENT"
      ? "Student / Provider"
      : user.accountType === "CUSTOMER"
        ? "Customer"
        : "Admin";

  const isCurrentUser = user.id === session.user.id;
  const isAdmin = user.accountType === "ADMIN";

  return (
    <div className="space-y-8">
      {/* Back */}
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary-900"
        >
          <ArrowLeft size={16} />
          Back to users
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-900">
            <UserRound size={30} />
          </div>

          <div>
            <h1 className="font-display text-2xl text-gray-900">
              {user.name}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {user.email}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                {accountType}
              </span>

              {isCurrentUser && (
                <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-900">
                  Current Account
                </span>
              )}
            </div>
          </div>
        </div>

        <span
          className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClasses}`}
        >
          {status}
        </span>
      </div>

      {/* Basic information */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-base p-6">
          <h2 className="mb-5 font-semibold text-gray-900">
            Account Information
          </h2>

          <div className="space-y-4">
            <InfoRow
              icon={<UserRound size={17} />}
              label="Account Type"
              value={accountType}
            />

            <InfoRow
              icon={<Mail size={17} />}
              label="Email"
              value={user.email}
            />

            <InfoRow
              icon={<Phone size={17} />}
              label="Phone"
              value={user.phone || "Not provided"}
            />

            <InfoRow
              icon={<MapPin size={17} />}
              label="Location"
              value={user.location || "Not provided"}
            />

            <InfoRow
              icon={<Calendar size={17} />}
              label="Joined"
              value={user.createdAt.toLocaleDateString()}
            />

            <InfoRow
              icon={<ShieldCheck size={17} />}
              label="Email Verification"
              value={
                user.emailVerified
                  ? "Verified"
                  : "Not verified"
              }
            />
          </div>
        </div>

        {/* Provider profile */}
        {user.providerProfile && (
          <div className="card-base p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                Provider Information
              </h2>

              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                {user.providerProfile.verificationStatus}
              </span>
            </div>

            <div className="space-y-4">
              <InfoRow
                label="University"
                value={
                  user.providerProfile.university ||
                  "Not provided"
                }
              />

              <InfoRow
                label="Faculty"
                value={
                  user.providerProfile.faculty ||
                  "Not provided"
                }
              />

              <InfoRow
                label="Department"
                value={
                  user.providerProfile.department ||
                  "Not provided"
                }
              />

              <InfoRow
                label="Level"
                value={
                  user.providerProfile.level ||
                  "Not provided"
                }
              />

              <InfoRow
                label="Graduation Year"
                value={
                  user.providerProfile.graduationYear
                    ? String(
                        user.providerProfile.graduationYear
                      )
                    : "Not provided"
                }
              />

              <InfoRow
                label="Matric ID"
                value={
                  user.providerProfile.matricId ||
                  "Not provided"
                }
              />
            </div>
          </div>
        )}

        {/* Customer profile */}
        {user.customerProfile && (
          <div className="card-base p-6">
            <h2 className="mb-5 font-semibold text-gray-900">
              Customer Information
            </h2>

            <div className="space-y-4">
              <InfoRow
                label="Customer Type"
                value={user.customerProfile.customerType}
              />

              <InfoRow
                label="Business Name"
                value={
                  user.customerProfile.businessName ||
                  "Not provided"
                }
              />

              <InfoRow
                label="Industry"
                value={
                  user.customerProfile.industry ||
                  "Not provided"
                }
              />

              <InfoRow
                label="Total Spent"
                value={`₦${user.customerProfile.totalSpent.toLocaleString()}`}
              />

              <InfoRow
                label="Jobs Posted"
                value={String(
                  user.customerProfile.jobsPosted
                )}
              />
            </div>
          </div>
        )}

        {/* Provider statistics */}
        {user.providerProfile && (
          <div className="card-base p-6">
            <h2 className="mb-5 font-semibold text-gray-900">
              Provider Statistics
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={<Briefcase size={17} />}
                label="Jobs Completed"
                value={String(
                  user.providerProfile.jobsCompleted
                )}
              />

              <StatCard
                icon={<Star size={17} />}
                label="Average Rating"
                value={user.providerProfile.averageRating.toFixed(
                  1
                )}
              />

              <StatCard
                icon={<Wallet size={17} />}
                label="Total Earnings"
                value={`₦${user.providerProfile.totalEarnings.toLocaleString()}`}
              />

              <StatCard
                icon={<ShieldCheck size={17} />}
                label="Completion Rate"
                value={`${user.providerProfile.completionRate}%`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Provider skills */}
      {user.providerProfile &&
        user.providerProfile.skills.length > 0 && (
          <div className="card-base p-6">
            <h2 className="mb-4 font-semibold text-gray-900">
              Skills
            </h2>

            <div className="flex flex-wrap gap-2">
              {user.providerProfile.skills.map(
                (providerSkill) => (
                  <span
                    key={providerSkill.skillId}
                    className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700"
                  >
                    {providerSkill.skill.name}
                  </span>
                )
              )}
            </div>
          </div>
        )}

      {/* Account actions */}
      <div className="card-base p-6">
        <div className="mb-5">
          <h2 className="font-semibold text-gray-900">
            Account Management
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage this user's account status.
          </p>
        </div>

        <AdminUserActions
          userId={user.id}
          isActive={user.isActive}
          isSuspended={user.isSuspended}
          isCurrentUser={isCurrentUser}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      {icon && (
        <div className="mt-0.5 text-gray-400">
          {icon}
        </div>
      )}

      <div className="min-w-0">
        <p className="text-xs text-gray-500">
          {label}
        </p>

        <p className="mt-0.5 break-words text-sm font-medium text-gray-900">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-gray-500">
        {icon}
        <span className="text-xs">
          {label}
        </span>
      </div>

      <p className="text-lg font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}