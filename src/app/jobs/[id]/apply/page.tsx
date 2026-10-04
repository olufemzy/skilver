"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Loader2,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

type Job = {
  id: string;
  title: string;
  description: string;
  budget: number;
  currency: string;
  serviceType: string;
  deadline: string | null;
  status: string;

  category: {
    name: string;
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
  if (!date) return "No deadline";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(new Date(date));
}

export default function ApplyForJobPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [proposal, setProposal] = useState("");
  const [price, setPrice] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [experience, setExperience] = useState("");
  const [portfolioLinks, setPortfolioLinks] =
    useState("");

  useEffect(() => {
    async function loadJob() {
      try {
        const response = await fetch(
          `/api/jobs/${params.id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load job"
          );
        }

        setJob(data.job);

        /*
         * Start the proposed price with the customer's
         * budget as a convenience. The provider can
         * change it before submitting.
         */
        setPrice(String(data.job.budget));
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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!proposal.trim()) {
      toast.error("Please write a proposal.");
      return;
    }

    if (proposal.trim().length < 50) {
      toast.error(
        "Your proposal must be at least 50 characters."
      );
      return;
    }

    const numericPrice = Number(price);
    const numericDeliveryDays = Number(deliveryDays);

    if (!numericPrice || numericPrice < 500) {
      toast.error(
        "Please enter a valid price of at least ₦500."
      );
      return;
    }

    if (
      !numericDeliveryDays ||
      numericDeliveryDays < 1
    ) {
      toast.error(
        "Please enter a valid delivery time."
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `/api/jobs/${params.id}/apply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            proposal: proposal.trim(),
            price: numericPrice,
            deliveryDays: numericDeliveryDays,
            experience: experience.trim(),
            portfolioLinks: portfolioLinks
              .split("\n")
              .map((link) => link.trim())
              .filter(Boolean),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to submit application"
        );
      }

      toast.success(
        "Application submitted successfully!"
      );

      router.push(`/jobs/${params.id}`);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit application"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2
            size={20}
            className="animate-spin"
          />
          <span>Loading job...</span>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-gray-900">
          Unable to load job
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          {error || "Job not found."}
        </p>

        <Link
          href="/provider/jobs"
          className="inline-flex items-center gap-2 mt-6 px-4 py-2.5 rounded-lg bg-[#0E4A30] text-white text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to Available Jobs
        </Link>
      </div>
    );
  }

  /*
   * Safety checks on the client.
   * The API performs these checks again on the server.
   */
  if (job.currentUser.role !== "PROVIDER") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-gray-900">
          Provider access required
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Only providers can apply for jobs.
        </p>
      </div>
    );
  }

  if (job.currentUser.isOwner) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-gray-900">
          You cannot apply to your own job
        </h1>

        <Link
          href={`/jobs/${job.id}`}
          className="inline-flex items-center gap-2 mt-6 text-sm font-medium text-[#0E4A30]"
        >
          <ArrowLeft size={16} />
          Back to Job
        </Link>
      </div>
    );
  }

  if (job.status !== "OPEN") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
          <CheckCircle2
            size={25}
            className="text-gray-500"
          />
        </div>

        <h1 className="mt-4 text-xl font-semibold text-gray-900">
          Applications are closed
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          This job is no longer accepting applications.
        </p>

        <Link
          href={`/jobs/${job.id}`}
          className="inline-flex items-center gap-2 mt-6 px-4 py-2.5 rounded-lg bg-[#0E4A30] text-white text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to Job
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link
        href={`/jobs/${job.id}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0E4A30] mb-6"
      >
        <ArrowLeft size={16} />
        Back to Job
      </Link>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        {/* Application form */}
        <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <h1 className="text-xl font-bold text-gray-900">
              Apply for This Job
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Tell the customer why you are the right
              provider for this job.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-6"
          >
            {/* Proposal */}
            <div>
              <label
                htmlFor="proposal"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Your Proposal
              </label>

              <textarea
                id="proposal"
                value={proposal}
                onChange={(event) =>
                  setProposal(event.target.value)
                }
                rows={8}
                maxLength={5000}
                placeholder="Explain how you would approach this job, what you can deliver, and why the customer should choose you."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none resize-none focus:border-[#0E4A30] focus:ring-2 focus:ring-[#0E4A30]/10"
              />

              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>
                  Minimum 50 characters
                </span>

                <span>
                  {proposal.length}/5000
                </span>
              </div>
            </div>

            {/* Price + delivery */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Your Price (₦)
                </label>

                <div className="relative">
                  <Wallet
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="price"
                    type="number"
                    min="500"
                    value={price}
                    onChange={(event) =>
                      setPrice(event.target.value)
                    }
                    placeholder="50000"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#0E4A30] focus:ring-2 focus:ring-[#0E4A30]/10"
                  />
                </div>

                <p className="mt-1.5 text-xs text-gray-400">
                  Customer budget:{" "}
                  {formatPrice(
                    job.budget,
                    job.currency
                  )}
                </p>
              </div>

              <div>
                <label
                  htmlFor="deliveryDays"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Delivery Time
                </label>

                <div className="relative">
                  <CalendarDays
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="deliveryDays"
                    type="number"
                    min="1"
                    max="365"
                    value={deliveryDays}
                    onChange={(event) =>
                      setDeliveryDays(event.target.value)
                    }
                    placeholder="7"
                    className="w-full h-11 pl-10 pr-16 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#0E4A30] focus:ring-2 focus:ring-[#0E4A30]/10"
                  />

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    days
                  </span>
                </div>
              </div>
            </div>

            {/* Experience */}
            <div>
              <label
                htmlFor="experience"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Relevant Experience
                <span className="ml-1 text-gray-400 font-normal">
                  (Optional)
                </span>
              </label>

              <textarea
                id="experience"
                value={experience}
                onChange={(event) =>
                  setExperience(event.target.value)
                }
                rows={4}
                maxLength={2000}
                placeholder="Briefly describe relevant experience, previous work, or expertise related to this job."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none resize-none focus:border-[#0E4A30] focus:ring-2 focus:ring-[#0E4A30]/10"
              />
            </div>

            {/* Portfolio */}
            <div>
              <label
                htmlFor="portfolio"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Portfolio Links
                <span className="ml-1 text-gray-400 font-normal">
                  (Optional)
                </span>
              </label>

              <textarea
                id="portfolio"
                value={portfolioLinks}
                onChange={(event) =>
                  setPortfolioLinks(event.target.value)
                }
                rows={3}
                placeholder={"https://example.com\nhttps://behance.net/yourname"}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none resize-none focus:border-[#0E4A30] focus:ring-2 focus:ring-[#0E4A30]/10"
              />

              <p className="mt-1.5 text-xs text-gray-400">
                Enter one link per line.
              </p>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-xl bg-[#0E4A30] text-white font-medium hover:bg-[#0B3D27] disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <BriefcaseBusiness size={18} />
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Job summary */}
        <aside>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 lg:sticky lg:top-6">
            <p className="text-xs font-medium text-[#0E4A30] uppercase tracking-wide">
              Job you're applying for
            </p>

            <h2 className="mt-2 text-lg font-semibold text-gray-900">
              {job.title}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {job.category.name}
            </p>

            <div className="mt-5 pt-5 border-t border-gray-100 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-50 text-[#0E4A30] flex items-center justify-center">
                  <Wallet size={17} />
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Customer Budget
                  </p>

                  <p className="text-sm font-semibold text-gray-900">
                    {formatPrice(
                      job.budget,
                      job.currency
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <CalendarDays size={17} />
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Deadline
                  </p>

                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(job.deadline)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 p-4 rounded-xl bg-blue-50/60 border border-blue-100">
              <p className="text-xs text-blue-800 leading-5">
                Your proposal, price, and delivery time
                will be sent to the customer for review.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
