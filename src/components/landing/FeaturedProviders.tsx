"use client";

import Link from "next/link";
import Image from "next/image";
import AllProviders from "../../providers.json";
import { MapPin, CheckCircle } from "lucide-react";

export default function FeaturedProviders() {
  const PROVIDERS_TO_DISPLAY = AllProviders.slice(0, 3);

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

        <div className="grid md:grid-cols-3 gap-6">
          {PROVIDERS_TO_DISPLAY.map((provider) => (
            <div
              key={provider.id}
              className="card-base p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Provider header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="relative flex-shrink-0">
                  <Image
                    src={provider.avatar}
                    alt={provider.name}
                    width={56}
                    height={56}
                    className="w-14 h-14 rounded-2xl object-cover"
                  />

                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                      {provider.name}
                    </h3>

                    <CheckCircle
                      size={14}
                      className="text-emerald-500 flex-shrink-0"
                    />
                  </div>

                  <p className="text-xs text-gray-500 truncate">
                    {provider.university}
                  </p>

                  <p className="text-xs text-gray-400">
                    {provider.department} — {provider.level}
                  </p>
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {provider.skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="text-xs bg-primary-50 text-primary-900 px-2.5 py-1 rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Location */}
              <div className="flex items-center gap-1 text-gray-400 text-sm mb-4">
                <MapPin size={13} />

                <span className="text-xs">
                  {provider.location}
                </span>
              </div>

              {/* Bottom section */}
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

        {/* Mobile browse link */}
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