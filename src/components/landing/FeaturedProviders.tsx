"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MapPin, CheckCircle, Loader2 } from "lucide-react";

type Provider = {
  id: string;
  userId: string;
  fullName: string;
  profilePhotoUrl: string | null;
  location: string | null;
  providerType: string;
  university: string | null;
  department: string | null;
  level: string | null;
  verificationStatus: string;
  ratingAvg: number;
  ratingCount: number;
  jobsCompletedCount: number;
  isAvailable: boolean;
  headlineSkills: string[];
  startingPrice: number | null;
};

type ProvidersResponse = {
  data: Provider[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export default function FeaturedProviders() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProviders = async () => {
      try {
        setLoading(true);

        const response = await fetch("/api/providers?page=1");

        if (!response.ok) {
          throw new Error("Failed to fetch providers");
        }

        const data: ProvidersResponse = await response.json();

        setProviders(data.data.slice(0, 3));
      } catch (error) {
        console.error(
          "Failed to load featured providers:",
          error
        );

        setProviders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProviders();
  }, []);

  return (
    <section className="section-pad bg-surface">
      <div className="container-app">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-3">
              Explore Talent
            </p>

            <h2 className="font-display text-3xl md:text-4xl text-gray-900">
              Find skilled people
            </h2>

            <p className="mt-3 text-gray-500 max-w-xl">
              Explore the kinds of students and professionals you can
              discover on SkilVer.
            </p>
          </div>

          <Link
            href="/browse"
            className="hidden md:block btn-secondary text-sm py-2 px-4"
          >
            Browse Talent
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <Loader2
              size={30}
              className="animate-spin text-primary-900"
            />
          </div>
        )}

        {!loading && providers.length === 0 && (
          <div className="text-center py-16">
            <p className="font-display text-xl text-gray-900 mb-2">
              Talent is coming soon
            </p>

            <p className="text-sm text-gray-500">
              New providers will appear here as they join SkilVer.
            </p>
          </div>
        )}

        {!loading && providers.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="card-base p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative flex-shrink-0">
                    {provider.profilePhotoUrl ? (
                      <Image
                        src={provider.profilePhotoUrl}
                        alt={provider.fullName}
                        width={56}
                        height={56}
                        className="w-14 h-14 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-primary-900 flex items-center justify-center text-white text-lg font-semibold">
                        {provider.fullName
                          ?.charAt(0)
                          .toUpperCase() || "U"}
                      </div>
                    )}

                    {provider.isAvailable && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {provider.fullName}
                      </h3>

                      {provider.verificationStatus === "VERIFIED" && (
                        <CheckCircle
                          size={14}
                          className="text-emerald-500 flex-shrink-0"
                        />
                      )}
                    </div>

                    {provider.university && (
                      <p className="text-xs text-gray-500 truncate">
                        {provider.university}
                      </p>
                    )}

                    {(provider.department || provider.level) && (
                      <p className="text-xs text-gray-400">
                        {provider.department || ""}
                        {provider.department && provider.level
                          ? " — "
                          : ""}
                        {provider.level || ""}
                      </p>
                    )}
                  </div>
                </div>

                {provider.headlineSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {provider.headlineSkills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-primary-50 text-primary-900 px-2.5 py-1 rounded-full font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {provider.location && (
                  <div className="flex items-center gap-1 text-gray-400 text-sm mb-4">
                    <MapPin size={13} />

                    <span className="text-xs">
                      {provider.location}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400">
                      Skills & services available
                    </p>

                    <p className="text-sm font-semibold text-gray-900">
                      Explore profile
                    </p>
                  </div>

                  <Link
                    href={`/providers/${provider.id}`}
                    className="bg-primary-900 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-primary-800 transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/browse"
            className="btn-secondary text-sm py-2 px-4"
          >
            Browse All Talent
          </Link>
        </div>
      </div>
    </section>
  );
}