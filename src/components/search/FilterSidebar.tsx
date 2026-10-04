"use client";

import { useEffect, useState } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<Category[]>(
    []
  );

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  /*
   * Load categories from Neon through /api/categories
   */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);

        const response = await fetch(
          "/api/categories"
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch categories"
          );
        }

        const data = await response.json();

        setCategories(data.categories || []);
      } catch (error) {
        console.error(
          "Failed to load categories:",
          error
        );

        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  /*
   * Update a filter while preserving
   * the other existing URL parameters.
   */
  const updateFilter = (
    key: string,
    value: string
  ) => {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(
      `/browse?${params.toString()}`
    );
  };

  return (
    <div className="space-y-6">
      <div className="card-base p-5">
        <h3 className="font-semibold text-gray-900 text-sm mb-4">
          Filters
        </h3>

        <div className="space-y-5">

          {/* CATEGORY */}
          <div>
            <label className="label-base text-xs">
              Category
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer py-1.5">
              <input
                type="radio"
                name="category"
                value=""
                checked={
                  !searchParams.get("category")
                }
                onChange={() =>
                  updateFilter(
                    "category",
                    ""
                  )
                }
                className="text-primary-900"
              />

              <span className="text-sm text-gray-700">
                All Categories
              </span>
            </label>

            {loadingCategories ? (
              <p className="text-xs text-gray-400 py-2">
                Loading categories...
              </p>
            ) : categories.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">
                No categories available
              </p>
            ) : (
              categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-2.5 cursor-pointer py-1.5"
                >
                  <input
                    type="radio"
                    name="category"
                    value={category.slug}
                    checked={
                      searchParams.get(
                        "category"
                      ) === category.slug
                    }
                    onChange={() =>
                      updateFilter(
                        "category",
                        category.slug
                      )
                    }
                    className="text-primary-900"
                  />

                  <span className="text-sm text-gray-700">
                    {category.name}
                  </span>
                </label>
              ))
            )}
          </div>

          {/* VERIFICATION */}
          <div>
            <label className="label-base text-xs">
              Verification
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer py-1.5">
              <input
                type="checkbox"
                checked={
                  searchParams.get(
                    "verified"
                  ) === "true"
                }
                onChange={(e) =>
                  updateFilter(
                    "verified",
                    e.target.checked
                      ? "true"
                      : ""
                  )
                }
                className="text-primary-900"
              />

              <span className="text-sm text-gray-700">
                Verified only
              </span>
            </label>
          </div>

          {/* MINIMUM RATING */}
          <div>
            <label className="label-base text-xs">
              Minimum Rating
            </label>

            {[4, 3, 2].map((rating) => (
              <label
                key={rating}
                className="flex items-center gap-2.5 cursor-pointer py-1.5"
              >
                <input
                  type="radio"
                  name="rating"
                  value={rating}
                  checked={
                    searchParams.get(
                      "minRating"
                    ) === String(rating)
                  }
                  onChange={() =>
                    updateFilter(
                      "minRating",
                      String(rating)
                    )
                  }
                  className="text-primary-900"
                />

                <span className="text-sm text-gray-700">
                  {"⭐".repeat(rating)} & above
                </span>
              </label>
            ))}

            <label className="flex items-center gap-2.5 cursor-pointer py-1.5">
              <input
                type="radio"
                name="rating"
                value=""
                checked={
                  !searchParams.get(
                    "minRating"
                  )
                }
                onChange={() =>
                  updateFilter(
                    "minRating",
                    ""
                  )
                }
                className="text-primary-900"
              />

              <span className="text-sm text-gray-700">
                Any rating
              </span>
            </label>
          </div>

          {/* SERVICE TYPE */}
          <div>
            <label className="label-base text-xs">
              Service Type
            </label>

            {[
              {
                label: "Any",
                value: "",
              },
              {
                label: "Remote",
                value: "REMOTE",
              },
              {
                label: "Physical",
                value: "PHYSICAL",
              },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2.5 cursor-pointer py-1.5"
              >
                <input
                  type="radio"
                  name="serviceType"
                  value={option.value}
                  checked={
                    (searchParams.get(
                      "serviceType"
                    ) || "") ===
                    option.value
                  }
                  onChange={() =>
                    updateFilter(
                      "serviceType",
                      option.value
                    )
                  }
                  className="text-primary-900"
                />

                <span className="text-sm text-gray-700">
                  {option.label}
                </span>
              </label>
            ))}
          </div>

          {/* AVAILABILITY */}
          <div>
            <label className="label-base text-xs">
              Availability
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer py-1.5">
              <input
                type="checkbox"
                checked={
                  searchParams.get(
                    "available"
                  ) === "true"
                }
                onChange={(e) =>
                  updateFilter(
                    "available",
                    e.target.checked
                      ? "true"
                      : ""
                  )
                }
                className="text-primary-900"
              />

              <span className="text-sm text-gray-700">
                Available now
              </span>
            </label>
          </div>

        </div>
      </div>
    </div>
  );
}
