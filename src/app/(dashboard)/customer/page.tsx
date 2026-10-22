  import { getServerSession } from "next-auth";
  import { redirect } from "next/navigation";
  import Link from "next/link";
  import {
    Briefcase,
    DollarSign,
    FileText,
    Clock,
    ArrowRight,
    Plus,
    CheckCircle,
  } from "lucide-react";

  import { authOptions } from "@/lib/auth";
  import prisma from "@/lib/prisma";
  import { formatCurrency } from "@/lib/utils";
  import Button from "@/components/ui/Button";

  export const dynamic = "force-dynamic";

  export default async function CustomerDashboard() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      redirect("/login");
    }

    // Find the customer profile belonging to the logged-in user.
    const customer = await prisma.customerProfile.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!customer) {
      return (
        <div className="card-base p-8 text-center">
          <h1 className="text-xl font-semibold text-gray-900">
            Customer profile not found
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Your customer profile could not be found. Please contact
            support if this problem continues.
          </p>
        </div>
      );
    }

    // Load dashboard information from the database.
    const [
      jobsPosted,
      openJobs,
      applicationsReceived,
      activeProjects,
      completedContracts,
      recentJobs,
    ] = await Promise.all([
      prisma.job.count({
        where: {
          customerId: customer.id,
        },
      }),

      prisma.job.count({
        where: {
          customerId: customer.id,
          status: "OPEN",
          OR: [
            {
              serviceRequestStatus: null,
            },
            {
              serviceRequestStatus: "PENDING",
            },
          ],
        },
      }),

      prisma.application.count({
        where: {
          job: {
            is: {
              customerId: customer.id,
            },
          },
        },
      }),

      prisma.contract.count({
        where: {
          customerId: customer.id,
          status: "IN_PROGRESS",
        },
      }),

      prisma.contract.aggregate({
        where: {
          customerId: customer.id,
          status: "COMPLETED",
        },
        _sum: {
          agreedPrice: true,
        },
      }),

      prisma.job.findMany({
        where: {
          customerId: customer.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          title: true,
          budget: true,
          currency: true,
          status: true,
          serviceId: true,
          serviceRequestStatus: true,
          createdAt: true,
          category: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
      }),
    ]);

    const totalSpent = Number(
      completedContracts._sum.agreedPrice ?? 0
    );

    const stats = [
      {
        label: "Jobs Posted",
        value: jobsPosted.toLocaleString(),
        icon: Briefcase,
        color: "bg-blue-50 text-blue-700",
        description: "Total jobs you have created",
      },
      {
        label: "Open Jobs",
        value: openJobs.toLocaleString(),
        icon: Clock,
        color: "bg-amber-50 text-amber-700",
        description: "Jobs accepting applications",
      },
      {
        label: "Applications Received",
        value: applicationsReceived.toLocaleString(),
        icon: FileText,
        color: "bg-purple-50 text-purple-700",
        description: "Proposals received across your jobs",
      },
      {
        label: "Active Projects",
        value: activeProjects.toLocaleString(),
        icon: CheckCircle,
        color: "bg-green-50 text-green-700",
        description: "Projects currently in progress",
      },
    ];

    const getStatusStyles = (status: string) => {
      switch (status) {
        case "OPEN":
          return "bg-green-50 text-green-700";

        case "IN_PROGRESS":
          return "bg-blue-50 text-blue-700";

        case "COMPLETED":
          return "bg-emerald-50 text-emerald-700";

        case "SUBMITTED":
          return "bg-purple-50 text-purple-700";

        case "REVISION_REQUESTED":
          return "bg-amber-50 text-amber-700";

        case "CANCELLED":
        case "DISPUTED":
          return "bg-red-50 text-red-700";

        default:
          return "bg-gray-100 text-gray-600";
      }
    };

    const formatDate = (date: Date) =>
      new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);

    return (
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#0E4A30] mb-2">
              CUSTOMER DASHBOARD
            </p>

            <h1 className="font-display text-2xl sm:text-3xl text-gray-900 mb-2">
              Welcome back,{" "}
              {session.user.name?.split(" ")[0] || "Customer"}
            </h1>

            <p className="text-gray-500 text-sm">
              Manage your jobs, review proposals, and keep track of
              your projects.
            </p>
          </div>

          <Link href="/customer/post-job">
            <Button>
              <span className="inline-flex items-center gap-2">
                <Plus size={17} />
                Post a Job
              </span>
            </Button>
          </Link>
        </div>

        {/* Dashboard Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="card-base p-5"
              >
                <div
                  className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-4`}
                >
                  <Icon size={19} />
                </div>

                <p className="text-2xl font-display font-semibold text-gray-900">
                  {stat.value}
                </p>

                <p className="text-sm font-medium text-gray-800 mt-1">
                  {stat.label}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Total Spending */}
        <div className="card-base p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0E4A30]/10 text-[#0E4A30] flex items-center justify-center">
              <DollarSign size={23} />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Total Spent on Completed Contracts
              </p>

              <p className="text-2xl font-display font-semibold text-gray-900 mt-1">
                {formatCurrency(totalSpent)}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-500 max-w-xs">
            Calculated from contracts marked as completed. This is
            not a live payment balance.
          </p>
        </div>

        {/* Recent Jobs */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="font-semibold text-lg text-gray-900">
                Recent Jobs
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Your five most recently posted jobs.
              </p>
            </div>

            <Link
              href="/customer/jobs"
              className="inline-flex items-center gap-2 text-sm text-[#0E4A30] font-semibold hover:underline"
            >
              View all jobs
              <ArrowRight size={16} />
            </Link>
          </div>

          {recentJobs.length > 0 ? (
            <div className="card-base overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="border-b border-gray-100 bg-gray-50">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">
                        Job Title
                      </th>

                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">
                        Category
                      </th>

                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">
                        Applications
                      </th>

                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">
                        Status
                      </th>

                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">
                        Budget
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-50">
                    {recentJobs.map((job) => (
                      <tr
                        key={job.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="font-medium text-sm text-gray-900 hover:text-[#0E4A30]"
                          >
                            {job.title}
                          </Link>

                          <p className="text-xs text-gray-400 mt-1">
                            Posted {formatDate(job.createdAt)}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-500">
                          {job.category?.name || "Uncategorized"}
                        </td>

                        <td className="px-5 py-4">
                          {job.serviceId ? (
                            <span className="text-sm text-gray-400">—</span>
                          ) : (
                            <Link
                              href={`/jobs/${job.id}/applications`}
                              className="inline-flex items-center gap-1 text-sm font-medium text-[#0E4A30] hover:underline"
                            >
                              {job._count.applications}
                              <ArrowRight size={14} />
                            </Link>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {(() => {
                            const displayStatus =
                              job.serviceRequestStatus === "DECLINED"
                                ? "DECLINED"
                                : job.serviceRequestStatus === "PENDING"
                                  ? "PENDING"
                                  : job.status;

                            const statusStyles =
                              displayStatus === "PENDING"
                                ? "bg-amber-50 text-amber-700"
                                : displayStatus === "DECLINED"
                                  ? "bg-red-50 text-red-700"
                                  : getStatusStyles(displayStatus);

                            return (
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles}`}
                              >
                                {displayStatus.replace(/_/g, " ")}
                              </span>
                            );
                          })()}

                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                          {formatCurrency(Number(job.budget))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card-base p-8 sm:p-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#0E4A30]/5 text-[#0E4A30] flex items-center justify-center mb-4">
                <Briefcase size={27} />
              </div>

              <h3 className="font-semibold text-gray-900 mb-2">
                No jobs posted yet
              </h3>

              <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                Your posted jobs will appear here. Create your first
                job to start receiving proposals from skilled providers.
              </p>

              <Link href="/customer/post-job">
                <Button>
                  <span className="inline-flex items-center gap-2">
                    <Plus size={17} />
                    Post Your First Job
                  </span>
                </Button>
              </Link>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="font-semibold text-lg text-gray-900 mb-4">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/customer/post-job"
              className="card-base p-5 flex items-center justify-between gap-4 hover:border-[#0E4A30]/30 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0E4A30]/10 text-[#0E4A30] flex items-center justify-center">
                  <Plus size={19} />
                </div>

                <div>
                  <p className="font-semibold text-sm text-gray-900">
                    Post a New Job
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Find the right talent for your project.
                  </p>
                </div>
              </div>

              <ArrowRight size={18} className="text-gray-400 shrink-0" />
            </Link>

            <Link
              href="/customer/jobs"
              className="card-base p-5 flex items-center justify-between gap-4 hover:border-[#0E4A30]/30 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Briefcase size={19} />
                </div>

                <div>
                  <p className="font-semibold text-sm text-gray-900">
                    Manage My Jobs
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Check job status and review proposals.
                  </p>
                </div>
              </div>

              <ArrowRight size={18} className="text-gray-400 shrink-0" />
            </Link>
          </div>
        </section>
      </div>
    );
  }