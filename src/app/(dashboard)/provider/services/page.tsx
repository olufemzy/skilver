"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Power,
  BriefcaseBusiness,
  Clock,
  MapPin,
  Monitor,
  Loader2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

type Service = {
  id: string;
  title: string;
  description: string;
  startPrice: number;
  maxPrice: number | null;
  currency: string;
  serviceType: "REMOTE" | "PHYSICAL" | "BOTH";
  deliveryDays: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: {
    id: string;
    url: string;
    altText: string | null;
  }[];
};

type ServiceForm = {
  title: string;
  description: string;
  categoryId: string;
  startPrice: string;
  maxPrice: string;
  serviceType: "REMOTE" | "PHYSICAL" | "BOTH";
  deliveryDays: string;
};

const emptyForm: ServiceForm = {
  title: "",
  description: "",
  categoryId: "",
  startPrice: "",
  maxPrice: "",
  serviceType: "BOTH",
  deliveryDays: "",
};

export default function ProviderServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] =
    useState<Service | null>(null);

  const [form, setForm] = useState<ServiceForm>(emptyForm);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [servicesResponse, categoriesResponse] =
        await Promise.all([
          fetch("/api/provider/services"),
          fetch("/api/categories"),
        ]);

      const servicesData = await servicesResponse.json();
      const categoriesData = await categoriesResponse.json();

      if (!servicesResponse.ok) {
        throw new Error(
          servicesData.error || "Failed to load services"
        );
      }

      if (!categoriesResponse.ok) {
        throw new Error(
          categoriesData.error || "Failed to load categories"
        );
      }

      setServices(servicesData.services || []);
      setCategories(categoriesData.categories || []);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load services"
      );
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingService(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEditModal(service: Service) {
    setEditingService(service);

    setForm({
      title: service.title,
      description: service.description,
      categoryId: service.category.id,
      startPrice: String(service.startPrice),
      maxPrice:
        service.maxPrice !== null
          ? String(service.maxPrice)
          : "",
      serviceType: service.serviceType,
      deliveryDays:
        service.deliveryDays !== null
          ? String(service.deliveryDays)
          : "",
    });

    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingService(null);
    setForm(emptyForm);
  }

  function updateField(
    field: keyof ServiceForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error("Enter a service title");
      return;
    }

    if (!form.description.trim()) {
      toast.error("Enter a service description");
      return;
    }

    if (!form.categoryId) {
      toast.error("Select a category");
      return;
    }

    if (!form.startPrice) {
      toast.error("Enter a starting price");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        categoryId: form.categoryId,
        startPrice: Number(form.startPrice),
        maxPrice:
          form.maxPrice.trim() === ""
            ? null
            : Number(form.maxPrice),
        currency: "NGN",
        serviceType: form.serviceType,
        deliveryDays:
          form.deliveryDays.trim() === ""
            ? null
            : Number(form.deliveryDays),
      };

      const response = await fetch(
        editingService
          ? `/api/provider/services/${editingService.id}`
          : "/api/provider/services",
        {
          method: editingService ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Failed to ${
              editingService ? "update" : "create"
            } service`
        );
      }

      toast.success(
        editingService
          ? "Service updated successfully"
          : "Service created successfully"
      );

      closeModal();
      await loadServices();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  async function loadServices() {
    try {
      const response = await fetch(
        "/api/provider/services"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load services"
        );
      }

      setServices(data.services || []);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to refresh services"
      );
    }
  }

  async function toggleService(service: Service) {
    const action = service.isActive
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${service.title}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/provider/services/${service.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: !service.isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Failed to ${action} service`
        );
      }

      toast.success(
        service.isActive
          ? "Service deactivated"
          : "Service activated"
      );

      await loadServices();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${action} service`
      );
    }
  }

  function formatPrice(service: Service) {
    const start = Number(service.startPrice);

    const minimum = start.toLocaleString("en-NG");

    if (service.maxPrice !== null) {
      const maximum = Number(
        service.maxPrice
      ).toLocaleString("en-NG");

      return `₦${minimum} – ₦${maximum}`;
    }

    return `From ₦${minimum}`;
  }

  function getServiceTypeLabel(
    serviceType: Service["serviceType"]
  ) {
    if (serviceType === "REMOTE") {
      return "Remote";
    }

    if (serviceType === "PHYSICAL") {
      return "Physical";
    }

    return "Remote & Physical";
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-gray-900">
            My Services
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Create and manage the services you offer on
            SkilVer.
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Add Service
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card-base p-5">
          <div className="w-9 h-9 rounded-xl bg-green-50 text-green-700 flex items-center justify-center mb-3">
            <BriefcaseBusiness size={18} />
          </div>

          <p className="text-2xl font-display text-gray-900">
            {services.length}
          </p>

          <p className="text-xs text-gray-500 mt-0.5">
            Total Services
          </p>
        </div>

        <div className="card-base p-5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
            <Power size={18} />
          </div>

          <p className="text-2xl font-display text-gray-900">
            {
              services.filter(
                (service) => service.isActive
              ).length
            }
          </p>

          <p className="text-xs text-gray-500 mt-0.5">
            Active Services
          </p>
        </div>

        <div className="card-base p-5 col-span-2 lg:col-span-1">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
            <BriefcaseBusiness size={18} />
          </div>

          <p className="text-2xl font-display text-gray-900">
            {
              new Set(
                services.map(
                  (service) => service.category.id
                )
              ).size
            }
          </p>

          <p className="text-xs text-gray-500 mt-0.5">
            Categories Used
          </p>
        </div>
      </div>

      {/* Services */}
      {loading ? (
        <div className="card-base p-12 flex flex-col items-center justify-center text-gray-400">
          <Loader2
            size={30}
            className="animate-spin mb-3"
          />

          <p className="text-sm">
            Loading your services...
          </p>
        </div>
      ) : services.length === 0 ? (
        <div className="card-base p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-green-50 text-primary-900 flex items-center justify-center mx-auto mb-4">
            <BriefcaseBusiness size={26} />
          </div>

          <h2 className="font-semibold text-gray-900">
            You have no services yet
          </h2>

          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            Create your first service to start showing
            potential customers what you can offer.
          </p>

          <Button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 mt-5"
          >
            <Plus size={18} />
            Create Your First Service
          </Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-5">
          {services.map((service) => (
            <div
              key={service.id}
              className={`card-base p-5 ${
                !service.isActive
                  ? "opacity-70"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        service.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {service.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>

                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                      {service.category.name}
                    </span>
                  </div>

                  <h2 className="font-semibold text-gray-900 text-lg">
                    {service.title}
                  </h2>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      openEditModal(service)
                    }
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-primary-900 hover:bg-green-50 transition-colors"
                    title="Edit service"
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      toggleService(service)
                    }
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      service.isActive
                        ? "text-red-500 hover:bg-red-50"
                        : "text-green-600 hover:bg-green-50"
                    }`}
                    title={
                      service.isActive
                        ? "Deactivate service"
                        : "Activate service"
                    }
                  >
                    <Power size={17} />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-3 line-clamp-3">
                {service.description}
              </p>

              <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">
                    Price
                  </p>

                  <p className="text-sm font-semibold text-primary-900 mt-1">
                    {formatPrice(service)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Service Type
                  </p>

                  <div className="flex items-center gap-1.5 mt-1 text-sm font-medium text-gray-700">
                    {service.serviceType ===
                    "PHYSICAL" ? (
                      <MapPin size={15} />
                    ) : service.serviceType ===
                      "REMOTE" ? (
                      <Monitor size={15} />
                    ) : (
                      <BriefcaseBusiness
                        size={15}
                      />
                    )}

                    {getServiceTypeLabel(
                      service.serviceType
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Delivery
                  </p>

                  <div className="flex items-center gap-1.5 mt-1 text-sm font-medium text-gray-700">
                    <Clock size={15} />

                    {service.deliveryDays
                      ? `${service.deliveryDays} day${
                          service.deliveryDays ===
                          1
                            ? ""
                            : "s"
                        }`
                      : "Flexible"}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Images
                  </p>

                  <p className="text-sm font-medium text-gray-700 mt-1">
                    {service.images.length}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeModal}
          />

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl text-gray-900">
                  {editingService
                    ? "Edit Service"
                    : "Create Service"}
                </h2>

                <p className="text-xs text-gray-500 mt-0.5">
                  {editingService
                    ? "Update your service details."
                    : "Tell customers what you offer."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >
              <Input
                label="Service Title"
                value={form.title}
                onChange={(event) =>
                  updateField(
                    "title",
                    event.target.value
                  )
                }
                placeholder="e.g. I will build a responsive React website"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Describe what the customer will receive..."
                  rows={5}
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-primary-900 focus:ring-2 focus:ring-primary-900/10 resize-none"
                />

                <p className="text-xs text-gray-400 mt-1">
                  Minimum 20 characters.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category
                </label>

                <select
                  value={form.categoryId}
                  onChange={(event) =>
                    updateField(
                      "categoryId",
                      event.target.value
                    )
                  }
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 bg-white outline-none focus:border-primary-900 focus:ring-2 focus:ring-primary-900/10"
                >
                  <option value="">
                    Select a category
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Starting Price (₦)"
                  type="number"
                  min="0"
                  value={form.startPrice}
                  onChange={(event) =>
                    updateField(
                      "startPrice",
                      event.target.value
                    )
                  }
                  placeholder="e.g. 50000"
                  required
                />

                <Input
                  label="Maximum Price (₦)"
                  type="number"
                  min="0"
                  value={form.maxPrice}
                  onChange={(event) =>
                    updateField(
                      "maxPrice",
                      event.target.value
                    )
                  }
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Service Type
                </label>

                <select
                  value={form.serviceType}
                  onChange={(event) =>
                    updateField(
                      "serviceType",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 bg-white outline-none focus:border-primary-900 focus:ring-2 focus:ring-primary-900/10"
                >
                  <option value="BOTH">
                    Remote & Physical
                  </option>

                  <option value="REMOTE">
                    Remote Only
                  </option>

                  <option value="PHYSICAL">
                    Physical Only
                  </option>
                </select>
              </div>

              <Input
                label="Delivery Time (Days)"
                type="number"
                min="1"
                value={form.deliveryDays}
                onChange={(event) =>
                  updateField(
                    "deliveryDays",
                    event.target.value
                  )
                }
                placeholder="e.g. 5"
              />

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                  <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                  Cancel
                  </button>

                <Button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2"
                >
                  {saving && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "Saving..."
                    : editingService
                    ? "Update Service"
                    : "Create Service"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}