"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  ChevronDown,
  Loader2,
  Pencil,
  Plus,
  Power,
  Search,
  X,
  XCircle,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Skill = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  isActive: boolean;
  category: Category;
};

type SkillForm = {
  name: string;
  slug: string;
  categoryId: string;
};

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("ALL");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] =
    useState(false);

  const [editingSkill, setEditingSkill] =
    useState<Skill | null>(null);

  const [formData, setFormData] = useState<SkillForm>({
    name: "",
    slug: "",
    categoryId: "",
  });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [skillsResponse, categoriesResponse] =
        await Promise.all([
          fetch("/api/admin/skills"),
          fetch("/api/admin/categories"),
        ]);

      const skillsData = await skillsResponse.json();
      const categoriesData =
        await categoriesResponse.json();

      if (!skillsResponse.ok) {
        throw new Error(
          skillsData.error || "Failed to fetch skills"
        );
      }

      if (!categoriesResponse.ok) {
        throw new Error(
          categoriesData.error ||
            "Failed to fetch categories"
        );
      }

      setSkills(skillsData.skills);
      setCategories(
        categoriesData.categories.map(
          (category: Category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
          })
        )
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load skills"
      );
    } finally {
      setLoading(false);
    }
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function handleNameChange(value: string) {
    setFormData((current) => ({
      ...current,
      name: value,
      slug: generateSlug(value),
    }));
  }

  function openAddModal() {
    setFormData({
      name: "",
      slug: "",
      categoryId: categories[0]?.id || "",
    });

    setFormError("");
    setShowAddModal(true);
  }

  function closeAddModal() {
    if (saving) return;

    setShowAddModal(false);

    setFormData({
      name: "",
      slug: "",
      categoryId: "",
    });

    setFormError("");
  }

  function openEditModal(skill: Skill) {
    setEditingSkill(skill);

    setFormData({
      name: skill.name,
      slug: skill.slug,
      categoryId: skill.categoryId,
    });

    setFormError("");
    setShowEditModal(true);
  }

  function closeEditModal() {
    if (saving) return;

    setShowEditModal(false);
    setEditingSkill(null);

    setFormData({
      name: "",
      slug: "",
      categoryId: "",
    });

    setFormError("");
  }

  async function handleCreateSkill(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setFormError("");
    setSaving(true);

    try {
      const response = await fetch(
        "/api/admin/skills",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            slug: formData.slug,
            categoryId: formData.categoryId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create skill"
        );
      }

      closeAddModal();

      await loadData();
    } catch (error) {
      console.error(error);

      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to create skill"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateSkill(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!editingSkill) return;

    setFormError("");
    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/skills/${editingSkill.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            slug: formData.slug,
            categoryId: formData.categoryId,
            isActive: editingSkill.isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update skill"
        );
      }

      closeEditModal();

      await loadData();
    } catch (error) {
      console.error(error);

      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to update skill"
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleSkillStatus(skill: Skill) {
    const newStatus = !skill.isActive;

    const confirmed = window.confirm(
      newStatus
        ? `Activate "${skill.name}"?`
        : `Deactivate "${skill.name}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/skills/${skill.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: skill.name,
            slug: skill.slug,
            categoryId: skill.categoryId,
            isActive: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update skill status"
        );
      }

      await loadData();
    } catch (error) {
      console.error(error);

      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to update skill status"
      );
    }
  }

  const filteredSkills = useMemo(() => {
    const searchTerm = search
      .trim()
      .toLowerCase();

    return skills.filter((skill) => {
      const matchesSearch =
        !searchTerm ||
        skill.name
          .toLowerCase()
          .includes(searchTerm) ||
        skill.slug
          .toLowerCase()
          .includes(searchTerm);

      const matchesCategory =
        categoryFilter === "ALL" ||
        skill.categoryId === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [skills, search, categoryFilter]);

  const activeSkills = skills.filter(
    (skill) => skill.isActive
  ).length;

  const inactiveSkills = skills.filter(
    (skill) => !skill.isActive
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading skills...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-700">
          Failed to load skills
        </h2>

        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>

        <button
          type="button"
          onClick={loadData}
          className="mt-4 rounded-lg bg-[#0E4A30] px-4 py-2 text-sm font-medium text-white hover:bg-[#0b3d27]"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Skills
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage the skills available on SkilVer.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0E4A30] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b3d27]"
        >
          <Plus className="h-4 w-4" />
          Add Skill
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Total Skills
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {skills.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Active Skills
          </p>

          <p className="mt-1 text-2xl font-bold text-green-700">
            {activeSkills}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Inactive Skills
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-500">
            {inactiveSkills}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search skills..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#0E4A30] focus:ring-2 focus:ring-[#0E4A30]/10"
            />
          </div>

          <div className="relative md:w-72">
            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-9 text-sm outline-none focus:border-[#0E4A30] focus:ring-2 focus:ring-[#0E4A30]/10"
            >
              <option value="ALL">
                All Categories
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

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Skills Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="font-semibold text-gray-900">
              All Skills
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Showing {filteredSkills.length} of{" "}
              {skills.length} skills
            </p>
          </div>
        </div>

        {filteredSkills.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-medium text-gray-700">
              No skills found
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your search or category
              filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Skill
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Category
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Slug
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredSkills.map((skill) => (
                  <tr
                    key={skill.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {skill.name}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {skill.category.name}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-500">
                        {skill.slug}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {skill.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                          <CheckCircle className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                          <XCircle className="h-3 w-3" />
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(skill)
                          }
                          title="Edit skill"
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-[#0E4A30]"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            toggleSkillStatus(skill)
                          }
                          title={
                            skill.isActive
                              ? "Deactivate skill"
                              : "Activate skill"
                          }
                          className={`rounded-lg p-2 transition ${
                            skill.isActive
                              ? "text-gray-500 hover:bg-red-50 hover:text-red-600"
                              : "text-gray-500 hover:bg-green-50 hover:text-green-600"
                          }`}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Skill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Add Skill
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Add a new skill to a category.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateSkill}
              className="space-y-5 p-6"
            >
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {formError}
                </div>
              )}

              <div>
                <label
                  htmlFor="add-skill-name"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Skill Name
                </label>

                <input
                  id="add-skill-name"
                  type="text"
                  value={formData.name}
                  onChange={(event) =>
                    handleNameChange(
                      event.target.value
                    )
                  }
                  placeholder="e.g. React Development"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#0E4A30] focus:ring-2 focus:ring-[#0E4A30]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="add-skill-slug"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Slug
                </label>

                <input
                  id="add-skill-slug"
                  type="text"
                  value={formData.slug}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      slug: event.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "-"),
                    }))
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#0E4A30] focus:ring-2 focus:ring-[#0E4A30]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="add-skill-category"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Category
                </label>

                <select
                  id="add-skill-category"
                  value={formData.categoryId}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      categoryId:
                        event.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0E4A30] focus:ring-2 focus:ring-[#0E4A30]/10"
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

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0E4A30] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0b3d27] disabled:opacity-60"
                >
                  {saving && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {saving
                    ? "Creating..."
                    : "Create Skill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Skill Modal */}
      {showEditModal && editingSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Edit Skill
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update this skill.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleUpdateSkill}
              className="space-y-5 p-6"
            >
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {formError}
                </div>
              )}

              <div>
                <label
                  htmlFor="edit-skill-name"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Skill Name
                </label>

                <input
                  id="edit-skill-name"
                  type="text"
                  value={formData.name}
                  onChange={(event) =>
                    handleNameChange(
                      event.target.value
                    )
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#0E4A30] focus:ring-2 focus:ring-[#0E4A30]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-skill-slug"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Slug
                </label>

                <input
                  id="edit-skill-slug"
                  type="text"
                  value={formData.slug}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      slug: event.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "-"),
                    }))
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#0E4A30] focus:ring-2 focus:ring-[#0E4A30]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-skill-category"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Category
                </label>

                <select
                  id="edit-skill-category"
                  value={formData.categoryId}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      categoryId:
                        event.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0E4A30] focus:ring-2 focus:ring-[#0E4A30]/10"
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

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0E4A30] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0b3d27] disabled:opacity-60"
                >
                  {saving && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}