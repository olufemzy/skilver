import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Star,
  Briefcase,
  MessageCircle,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import prisma from "@/lib/prisma";

export default async function ProviderProfilePage({
  params,
}: {
  params: { id: string };
}) {
  /*
   * Fetch the provider directly from Neon
   * through Prisma.
   */
  const provider = await prisma.providerProfile.findUnique({
    where: {
      id: params.id,
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          location: true,
        },
      },

      skills: {
        include: {
          skill: {
            select: {
              name: true,
            },
          },
        },
      },

      services: {
        where: {
          isActive: true,
        },

        orderBy: {
          startPrice: "asc",
        },

        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  /*
   * Provider does not exist.
   */
  if (!provider) {
    notFound();
  }

  /*
   * Only show active, non-suspended users.
   */
  if (!provider.user) {
    notFound();
  }

  const skills = provider.skills.map(
    (providerSkill) => providerSkill.skill.name
  );

  const services = provider.services;

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <div className="container-app py-10">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* =========================
              SIDEBAR
          ========================= */}

          <div className="space-y-5">

            <div className="card-base p-6 text-center">

              {/* Profile Image */}

              {provider.user.avatarUrl ? (
                <Image
                  src={provider.user.avatarUrl}
                  alt={provider.user.name}
                  width={120}
                  height={120}
                  className="w-28 h-28 rounded-3xl mx-auto mb-4 object-cover"
                />
              ) : (
                <div className="w-28 h-28 bg-primary-900 rounded-3xl flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                  {provider.user.name[0]?.toUpperCase()}
                </div>
              )}

              {/* Name */}

              <h1 className="font-display text-2xl text-gray-900 mb-1">
                {provider.user.name}
              </h1>

              {/* Provider Type / Department */}

              <p className="text-sm text-gray-500 mb-3">
                {provider.department ||
                  provider.faculty ||
                  "Skilled Service Provider"}
              </p>

              {/* Verification */}

              {provider.verificationStatus ===
                "VERIFIED" && (
                <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium mb-4">
                  <span>✓</span>
                  Verified Provider
                </div>
              )}

              {/* Location */}

              {provider.user.location && (
                <div className="flex items-center justify-center gap-1.5 text-gray-500 text-sm mb-4">
                  <MapPin size={14} />
                  {provider.user.location}
                </div>
              )}

              {/* University */}

              {(provider.university ||
                provider.department ||
                provider.level) && (
                <div className="text-sm text-gray-600 mb-4">

                  {provider.university && (
                    <p className="font-medium">
                      {provider.university}
                    </p>
                  )}

                  {(provider.department ||
                    provider.level) && (
                    <p className="text-gray-400">
                      {provider.department || ""}
                      {provider.department &&
                      provider.level
                        ? " — "
                        : ""}
                      {provider.level || ""}
                    </p>
                  )}

                </div>
              )}

              {/* Statistics */}

              <div className="grid grid-cols-3 gap-3 py-4 border-t border-gray-100">

                <div className="text-center">
                  <p className="font-display text-xl text-gray-900">
                    {provider.jobsCompleted}
                  </p>

                  <p className="text-xs text-gray-400">
                    Jobs
                  </p>
                </div>

                <div className="text-center border-x border-gray-100">
                  <p className="font-display text-xl text-gray-900">
                    {Number(
                      provider.averageRating
                    ).toFixed(1)}
                  </p>

                  <p className="text-xs text-gray-400">
                    Rating
                  </p>
                </div>

                <div className="text-center">
                  <p className="font-display text-xl text-gray-900">
                    {provider.totalReviews}
                  </p>

                  <p className="text-xs text-gray-400">
                    Reviews
                  </p>
                </div>

              </div>

              {/* Availability */}

              <div
                className={`w-full py-2 px-4 rounded-xl text-sm font-medium ${
                  provider.isAvailable
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {provider.isAvailable
                  ? "● Available for work"
                  : "○ Not available"}
              </div>

              {/* Actions */}

              <div className="mt-4 space-y-2">

                <Link
                  href={`/messages?with=${provider.user.id}`}
                  className="btn-secondary w-full flex items-center justify-center gap-2 text-sm py-2.5"
                >
                  <MessageCircle size={15} />
                  Message
                </Link>

                <Link
                  href={`/hire/${provider.id}`}
                  className="btn-primary w-full block text-center text-sm py-2.5"
                >
                  Hire{" "}
                  {provider.user.name.split(" ")[0]}
                </Link>

              </div>

            </div>

            {/* =========================
                SKILLS
            ========================= */}

            {skills.length > 0 && (
              <div className="card-base p-5">

                <h2 className="font-semibold text-gray-900 text-sm mb-3">
                  Skills
                </h2>

                <div className="flex flex-wrap gap-2">

                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs bg-primary-50 text-primary-900 px-3 py-1.5 rounded-full font-medium"
                    >
                      {skill}
                    </span>
                  ))}

                </div>

              </div>
            )}

          </div>

          {/* =========================
              MAIN CONTENT
          ========================= */}

          <div className="lg:col-span-2 space-y-6">

            {/* About */}

            <div className="card-base p-6">

              <h2 className="font-semibold text-gray-900 mb-3">
                About
              </h2>

              {/* <p className="text-gray-600 text-sm leading-relaxed">
                {provider.bio ||
                  `${provider.user.name} is a skilled service provider on SkilVer offering services to customers through the marketplace.`}
              </p> */}
              <p className="text-gray-600 text-sm leading-relaxed">
                {provider.bio || "This provider has not added a bio yet."}
              </p>

            </div>


            {/* Service Information */}

            <div className="card-base p-6">

              <h2 className="font-semibold text-gray-900 mb-4">
                Services
              </h2>

              {services.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">
                    This provider has not added any
                    active services yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">

                  {services.map((service) => (
                    <Link
                      key={service.id}
                      href={`/services/${service.id}`}
                      className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="min-w-0">

                        <p className="font-medium text-sm text-gray-900">
                          {service.title}
                        </p>

                        <p className="text-xs text-gray-500 mt-0.5">
                          {service.category.name}
                          {" • "}
                          {service.serviceType === "REMOTE"
                            ? "Remote service"
                            : service.serviceType === "PHYSICAL"
                            ? "Physical service"
                            : "Remote & Physical"}
                        </p>

                        {service.deliveryDays && (
                          <p className="text-xs text-gray-400 mt-1">
                            Delivery: {service.deliveryDays} day
                            {service.deliveryDays !== 1 ? "s" : ""}
                          </p>
                        )}

                      </div>

                      <div className="text-right flex-shrink-0">

                        <p className="text-sm font-semibold text-primary-900">
                          From ₦
                          {Number(service.startPrice).toLocaleString()}
                        </p>

                        {service.maxPrice !== null &&
                          service.maxPrice !== undefined && (
                            <p className="text-xs text-gray-400">
                              Up to ₦
                              {Number(service.maxPrice).toLocaleString()}
                            </p>
                          )}

                      </div>
                    </Link>
                  ))}

                </div>
              )}

            </div>


            {/* Skills / Expertise */}

            {skills.length > 0 && (
              <div className="card-base p-6">

                <h2 className="font-semibold text-gray-900 mb-4">
                  Expertise
                </h2>

                <div className="grid sm:grid-cols-2 gap-3">

                  {skills.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                    >

                      <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-900 flex items-center justify-center">
                        <Briefcase size={15} />
                      </div>

                      <span className="text-sm text-gray-700">
                        {skill}
                      </span>

                    </div>
                  ))}

                </div>

              </div>
            )}

            {/* Reviews */}

            <div className="card-base p-6">

              <div className="flex items-center gap-3 mb-5">

                <h2 className="font-semibold text-gray-900">
                  Reviews
                </h2>

                <div className="flex items-center gap-1.5">

                  <Star
                    size={14}
                    fill="#F59E0B"
                    className="text-amber-400"
                  />

                  <span className="font-semibold text-sm">
                    {Number(
                      provider.averageRating
                    ).toFixed(1)}
                  </span>

                  <span className="text-gray-400 text-sm">
                    ({provider.totalReviews} reviews)
                  </span>

                </div>

              </div>

              {/* Temporary review message */}

              <div className="text-center py-8">

                <Star
                  size={28}
                  className="mx-auto mb-3 text-gray-300"
                />

                <p className="text-sm text-gray-500">
                  Reviews will appear here when
                  customer reviews are connected.
                </p>

              </div>

            </div>

          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
