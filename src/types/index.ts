export interface ProviderSearchResult {
  id: string;
  fullName: string;
  profilePhotoUrl: string | null;
  providerType: string;
  verificationStatus: "VERIFIED" | "PENDING" | "REJECTED";
  university: string | null;
  department: string | null;
  location: string | null;
  headlineSkills: string[];
  ratingAvg: number;
  ratingCount: number;
  jobsCompletedCount: number;
  startingPrice: number | null;
  isAvailable: boolean;
}

export interface CategoryWithSkills {
  id: string;
  name: string;
  slug: string;
  skills: Skill[];
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

export const CATEGORY_GROUPS = [
  "Digital & Technology",
  "Education",
  "Professional",
  "Skilled Trades",
  "Events & Lifestyle",
] as const;

export type CategoryGroup = (typeof CATEGORY_GROUPS)[number];

export interface ServiceSearchFilters {
  q?: string;
  categorySlug?: string;
  skillId?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  verifiedOnly?: boolean;
  availableOnly?: boolean;
  locationType?: "REMOTE" | "PHYSICAL" | "BOTH";
}


// import type {
//   ProviderProfile,
//   ProviderType,
//   VerificationStatus,
//   Category,
//   Skill,
// } from "@prisma/client";

// export type {
//   Role,
//   ProviderType,
//   VerificationStatus,
//   CustomerAccountType,
//   LocationType,
//   JobStatus,
//   ApplicationStatus,
//   ContractStatus,
//   TransactionStatus,
//   NotificationType,
//   DisputeReason,
//   DisputeStatus,
// } from "@prisma/client";

// /** Card shown in search results / category listings (section 7-8). */
// export interface ProviderSearchResult {
//   id: string;
//   fullName: string;
//   profilePhotoUrl: string | null;
//   providerType: ProviderType;
//   verificationStatus: "VERIFIED" | "PENDING" | "REJECTED";
//   university: string | null;
//   department: string | null;
//   location: string | null;
//   headlineSkills: string[];
//   ratingAvg: number;
//   ratingCount: number;
//   jobsCompletedCount: number;
//   startingPrice: number | null;
//   isAvailable: boolean;
// }

// export interface CategoryWithSkills extends Category {
//   skills: Skill[];
// }

// export const CATEGORY_GROUPS = [
//   "Digital & Technology",
//   "Education",
//   "Professional",
//   "Skilled Trades",
//   "Events & Lifestyle",
// ] as const;

// export type CategoryGroup = (typeof CATEGORY_GROUPS)[number];

// /** search/filter query shape shared between the search bar and results page (section 8). */
// export interface ServiceSearchFilters {
//   q?: string;
//   categorySlug?: string;
//   skillId?: string;
//   location?: string;
//   minPrice?: number;
//   maxPrice?: number;
//   minRating?: number;
//   verifiedOnly?: boolean;
//   availableOnly?: boolean;
//   locationType?: "REMOTE" | "PHYSICAL" | "BOTH";
// }


