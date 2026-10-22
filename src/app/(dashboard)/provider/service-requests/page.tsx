import ServiceRequestHistory from "@/components/provider/ServiceRequestHistory";

export default function ServiceRequestHistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-gray-900 mb-1">
          Service Request History
        </h1>

        <p className="text-sm text-gray-500">
          View the service requests you've accepted or declined.
        </p>
      </div>

      <ServiceRequestHistory />
    </div>
  );
}