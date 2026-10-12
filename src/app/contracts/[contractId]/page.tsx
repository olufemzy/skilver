
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type WorkFile = {
  name: string;
  url: string;
};

type Contract = {
  id: string;
  status: string;
  agreedPrice: number;
  currency: string;
  startDate: string;
  deadline: string | null;
  completedAt: string | null;
  workFiles: WorkFile[] | null;
  workMessage: string | null;
  revisionMessage: string | null;
  submittedAt: string | null;
  job: {
    id: string;
    title: string;
    description: string;
  };
  customer: {
    userId: string;
    user: { name: string | null };
  };
  provider: {
    userId: string;
    user: { name: string | null };
  };
  currentUserRole: "CUSTOMER" | "PROVIDER";
};

export default function ContractDetailsPage() {
  const params = useParams<{ contractId: string }>();
  const contractId = params.contractId;

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [workMessage, setWorkMessage] = useState("");
  const [workFiles, setWorkFiles] = useState<WorkFile[]>([
    { name: "", url: "" },
  ]);
  const [revisionMessage, setRevisionMessage] = useState("");

  const loadContract = useCallback(async () => {
    try {
      setError("");

      const response = await fetch(
        `/api/contracts/${contractId}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load contract."
        );
      }

      setContract(data.contract);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load contract."
      );
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    void loadContract();
  }, [loadContract]);

  function updateWorkFile(
    index: number,
    field: keyof WorkFile,
    value: string
  ) {
    setWorkFiles((current) =>
      current.map((file, i) =>
        i === index ? { ...file, [field]: value } : file
      )
    );
  }

  function addWorkFile() {
    if (workFiles.length >= 20) return;

    setWorkFiles((current) => [
      ...current,
      { name: "", url: "" },
    ]);
  }

  function removeWorkFile(index: number) {
    setWorkFiles((current) =>
      current.filter((_, i) => i !== index)
    );
  }

  async function handleSubmitWork(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!workMessage.trim()) {
      setError("Please enter a message about your submitted work.");
      return;
    }

    const cleanedFiles = workFiles
      .map((file) => ({
        name: file.name.trim(),
        url: file.url.trim(),
      }))
      .filter((file) => file.name || file.url);

    const invalidFile = cleanedFiles.some((file) => {
      if (!file.name || !file.url) return true;

      try {
        const url = new URL(file.url);
        return !["http:", "https:"].includes(url.protocol);
      } catch {
        return true;
      }
    });

    if (invalidFile) {
      setError(
        "Each work link must have a name and a valid HTTP or HTTPS URL."
      );
      return;
    }

    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `/api/provider/contracts/${contractId}/submit`,
        {
          method: "POST",  
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workMessage: workMessage.trim(),
            workFiles: cleanedFiles,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to submit your work."
        );
      }

      setNotice(data.message || "Work submitted successfully.");
      setWorkMessage("");
      setWorkFiles([{ name: "", url: "" }]);

      await loadContract();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while submitting your work."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReview(
    action: "approve" | "request_revision"
  ) {
    if (
      action === "request_revision" &&
      !revisionMessage.trim()
    ) {
      setError("Please explain what needs to be revised.");
      return;
    }

    const confirmed =
      action === "approve"
        ? window.confirm(
            "Approve this work and mark the project as completed?"
          )
        : window.confirm(
            "Request revisions from the provider?"
          );

    if (!confirmed) return;

    setReviewing(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `/api/customer/contracts/${contractId}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            revisionMessage: revisionMessage.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to review this work."
        );
      }

      setNotice(data.message);
      setRevisionMessage("");

      await loadContract();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while reviewing the work."
      );
    } finally {
      setReviewing(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <p className="text-gray-600">Loading contract...</p>
      </main>
    );
  }

  if (!contract) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Contract unavailable
        </h1>
        <p className="mt-2 text-gray-600">
          {error || "The contract could not be found."}
        </p>
      </main>
    );
  }

  const isProvider = contract.currentUserRole === "PROVIDER";
  const isCustomer = contract.currentUserRole === "CUSTOMER";

  const canSubmitWork =
    isProvider &&
    ["IN_PROGRESS", "REVISION_REQUESTED"].includes(
      contract.status
    );

  const canReviewWork =
    isCustomer && contract.status === "SUBMITTED";

  const statusClasses: Record<string, string> = {
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    SUBMITTED: "bg-purple-100 text-purple-800",
    REVISION_REQUESTED: "bg-orange-100 text-orange-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-gray-100 text-gray-700",
    DISPUTED: "bg-red-100 text-red-800",
  };

  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: contract.currency || "NGN",
    maximumFractionDigits: 2,
  }).format(contract.agreedPrice);

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <header>
        <p className="text-sm font-medium text-green-800">
          Contract details
        </p>

        <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
          {contract.job.title}
        </h1>

        <div className="mt-3">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
              statusClasses[contract.status] ||
              "bg-gray-100 text-gray-700"
            }`}
          >
            {contract.status.replaceAll("_", " ")}
          </span>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          {notice}
        </div>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Project information
        </h2>

        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600">
          {contract.job.description}
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Agreed price</p>
            <p className="mt-1 font-semibold text-gray-900">
              {formattedPrice}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Start date</p>
            <p className="mt-1 font-medium text-gray-900">
              {new Date(contract.startDate).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Deadline</p>
            <p className="mt-1 font-medium text-gray-900">
              {contract.deadline
                ? new Date(contract.deadline).toLocaleDateString()
                : "No deadline set"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              {isCustomer ? "Provider" : "Customer"}
            </p>
            <p className="mt-1 font-medium text-gray-900">
              {isCustomer
                ? contract.provider.user.name || "Provider"
                : contract.customer.user.name || "Customer"}
            </p>
          </div>

          {contract.completedAt && (
            <div>
              <p className="text-sm text-gray-500">Completed on</p>
              <p className="mt-1 font-medium text-gray-900">
                {new Date(
                  contract.completedAt
                ).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </section>

      {contract.status !== "IN_PROGRESS" && (
        <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Submitted work
          </h2>

          {contract.workMessage ? (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">
              {contract.workMessage}
            </p>
          ) : (
            <p className="mt-3 text-sm text-gray-500">
              No submission message is available.
            </p>
          )}

          {contract.submittedAt && (
            <p className="mt-3 text-xs text-gray-500">
              Submitted on{" "}
              {new Date(
                contract.submittedAt
              ).toLocaleString()}
            </p>
          )}

          {Array.isArray(contract.workFiles) &&
            contract.workFiles.length > 0 && (
              <div className="mt-5">
                <h3 className="font-medium text-gray-900">
                  Work links
                </h3>

                <ul className="mt-3 space-y-2">
                  {contract.workFiles.map((file, index) => (
                    <li
                      key={`${file.url}-${index}`}
                      className="rounded-lg bg-gray-50 p-3"
                    >
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-sm font-medium text-green-800 underline"
                      >
                        {file.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </section>
      )}

      {isProvider &&
        contract.status === "REVISION_REQUESTED" &&
        contract.revisionMessage && (
          <section className="rounded-xl border border-orange-200 bg-orange-50 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-orange-900">
              Changes requested by the customer
            </h2>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-orange-900">
              {contract.revisionMessage}
            </p>

            <p className="mt-3 text-sm text-orange-800">
              Make the requested changes and submit your work again.
            </p>
          </section>
        )}

      {canSubmitWork && (
        <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {contract.status === "REVISION_REQUESTED"
              ? "Resubmit corrected work"
              : "Submit completed work"}
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Describe your work and provide links to the completed
            files. You can submit up to 20 links.
          </p>

          <form
            onSubmit={handleSubmitWork}
            className="mt-5 space-y-5"
          >
            <div>
              <label
                htmlFor="workMessage"
                className="block text-sm font-medium text-gray-700"
              >
                Work submission message
              </label>

              <textarea
                id="workMessage"
                value={workMessage}
                onChange={(event) =>
                  setWorkMessage(event.target.value)
                }
                required
                maxLength={5000}
                rows={4}
                placeholder="Describe the completed work..."
                className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-medium text-gray-800">
                  Work links
                </h3>

                <button
                  type="button"
                  onClick={addWorkFile}
                  disabled={workFiles.length >= 20}
                  className="text-sm font-medium text-green-800 hover:underline disabled:opacity-50"
                >
                  + Add link
                </button>
              </div>

              <div className="mt-3 space-y-4">
                {workFiles.map((file, index) => (
                  <div
                    key={index}
                    className="space-y-3 rounded-lg border border-gray-200 p-4"
                  >
                    <div>
                      <label
                        htmlFor={`file-name-${index}`}
                        className="block text-sm text-gray-600"
                      >
                        Link name
                      </label>

                      <input
                        id={`file-name-${index}`}
                        value={file.name}
                        onChange={(event) =>
                          updateWorkFile(
                            index,
                            "name",
                            event.target.value
                          )
                        }
                        maxLength={200}
                        placeholder="e.g. Final design"
                        className="mt-1 w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`file-url-${index}`}
                        className="block text-sm text-gray-600"
                      >
                        HTTPS or HTTP URL
                      </label>

                      <input
                        id={`file-url-${index}`}
                        type="url"
                        value={file.url}
                        onChange={(event) =>
                          updateWorkFile(
                            index,
                            "url",
                            event.target.value
                          )
                        }
                        placeholder="https://..."
                        className="mt-1 w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                      />
                    </div>

                    {workFiles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeWorkFile(index)}
                        className="text-sm text-red-700 hover:underline"
                      >
                        Remove link
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-green-800 px-5 py-3 font-medium text-white hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {submitting
                ? "Submitting..."
                : contract.status === "REVISION_REQUESTED"
                  ? "Resubmit Work"
                  : "Submit Work"}
            </button>
          </form>
        </section>
      )}

      {canReviewWork && (
        <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Review submitted work
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Check the submission and its links before approving the
            project or requesting changes.
          </p>

          <div className="mt-5">
            <label
              htmlFor="revisionMessage"
              className="block text-sm font-medium text-gray-700"
            >
              Revision instructions
            </label>

            <textarea
              id="revisionMessage"
              value={revisionMessage}
              onChange={(event) =>
                setRevisionMessage(event.target.value)
              }
              maxLength={5000}
              rows={4}
              placeholder="Explain what the provider needs to correct..."
              className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
            />

            <p className="mt-1 text-xs text-gray-500">
              Required only when requesting revisions.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleReview("approve")}
              disabled={reviewing}
              className="rounded-lg bg-green-800 px-5 py-3 text-sm font-medium text-white hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {reviewing ? "Processing..." : "Approve Work"}
            </button>

            <button
              type="button"
              onClick={() => handleReview("request_revision")}
              disabled={
                reviewing || !revisionMessage.trim()
              }
              className="rounded-lg border border-orange-500 px-5 py-3 text-sm font-medium text-orange-700 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Request Revision
            </button>
          </div>
        </section>
      )}

      {contract.status === "SUBMITTED" && isProvider && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 text-sm text-purple-800">
          Your work has been submitted. The customer can now review it.
        </div>
      )}

      {contract.status === "COMPLETED" && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          This project has been marked as completed.
        </div>
      )}
    </main>
  );
}
