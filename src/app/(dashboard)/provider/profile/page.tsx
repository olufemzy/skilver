"use client";

import { useEffect, useState } from "react";
import {
  User,
  GraduationCap,
  MapPin,
  Briefcase,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";

type Skill = {
  id: string;
  name: string;
  slug: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
};

type ProviderProfile = {
  user: {
    name: string;
    email: string;
    location: string | null;
    avatarUrl: string | null;
  };

  bio: string | null;
  university: string | null;
  faculty: string | null;
  department: string | null;
  level: string | null;
  matricId: string | null;
  graduationYear: number | null;

  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  verificationNote: string | null;
  verifiedAt: string | null;

  isAvailable: boolean;
};

const universities = [
  "University of Lagos",
  "Obafemi Awolowo University",
  "University of Ibadan",
  "Ahmadu Bello University",
  "University of Nigeria, Nsukka",
  "University of Benin",
  "Lagos State University",
  "Covenant University",
  "Babcock University",
  "Federal University of Technology, Akure",
  "Nnamdi Azikiwe University",
  "University of Port Harcourt",
  "Bayero University Kano",
  "Other",
];

const levels = [
  "100L",
  "200L",
  "300L",
  "400L",
  "500L",
  "Graduate",
];

export default function ProviderProfilePage() {
  const [profile, setProfile] =
    useState<ProviderProfile | null>(null);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");

  const [university, setUniversity] = useState("");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("");
  const [matricId, setMatricId] = useState("");
  const [graduationYear, setGraduationYear] = useState("");

  const [isAvailable, setIsAvailable] = useState(true);

  const [skills, setSkills] = useState<Skill[]>([]);
  const [availableSkills, setAvailableSkills] = useState<
    Skill[]
  >([]);
  const [skillSearch, setSkillSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillSaving, setSkillSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
    loadSkills();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/provider/profile",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load profile"
        );
      }

      const provider =
        data.profile as ProviderProfile;

      setProfile(provider);

      setName(provider.user.name || "");
      setLocation(provider.user.location || "");
      setBio(provider.bio || "");

      setUniversity(provider.university || "");
      setFaculty(provider.faculty || "");
      setDepartment(provider.department || "");
      setLevel(provider.level || "");
      setMatricId(provider.matricId || "");

      setGraduationYear(
        provider.graduationYear
          ? String(provider.graduationYear)
          : ""
      );

      setIsAvailable(provider.isAvailable);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadSkills() {
    try {
      setSkillsLoading(true);

      const response = await fetch(
        "/api/provider/skills",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load skills"
        );
      }

      setAvailableSkills(data.skills || []);
      setSkills(data.selectedSkills || []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load skills"
      );
    } finally {
      setSkillsLoading(false);
    }
  }

  async function saveProfile() {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch(
        "/api/provider/profile",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            location,
            bio,
            university,
            faculty,
            department,
            level,
            matricId,
            graduationYear: graduationYear
              ? Number(graduationYear)
              : null,
            isAvailable,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to save profile"
        );
      }

      setProfile(data.profile);

      setMessage(
        "Profile updated successfully."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save profile"
      );
    } finally {
      setSaving(false);
    }
  }

  async function addSkill(skillId: string) {
    try {
      setSkillSaving(true);
      setError("");
      setMessage("");

      const response = await fetch(
        "/api/provider/skills",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            skillId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to add skill"
        );
      }

      setSkills((current) => [
        ...current,
        data.providerSkill.skill,
      ]);

      setSkillSearch("");
      setMessage("Skill added successfully.");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to add skill"
      );
    } finally {
      setSkillSaving(false);
    }
  }

  async function removeSkill(skillId: string) {
    try {
      setSkillSaving(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/provider/skills?skillId=${encodeURIComponent(
          skillId
        )}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to remove skill"
        );
      }

      setSkills((current) =>
        current.filter(
          (skill) => skill.id !== skillId
        )
      );

      setMessage("Skill removed successfully.");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to remove skill"
      );
    } finally {
      setSkillSaving(false);
    }
  }

  const filteredSkills = availableSkills
    .filter((skill) =>
      skill.name
        .toLowerCase()
        .includes(skillSearch.toLowerCase())
    )
    .filter(
      (skill) =>
        !skills.some(
          (selected) => selected.id === skill.id
        )
    )
    .slice(0, 8);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2
          size={32}
          className="animate-spin text-primary-900"
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card-base p-8 text-center">
        <h2 className="font-semibold text-gray-900 mb-2">
          Unable to load profile
        </h2>

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl text-gray-900 mb-1">
          My Profile
        </h1>

        <p className="text-gray-500 text-sm">
          Keep your profile information up to date so
          customers can better understand your skills and
          experience.
        </p>
      </div>

      {/* Messages */}
      {message && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle
            size={20}
            className="text-green-600"
          />

          <p className="text-sm text-green-700">
            {message}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle
            size={20}
            className="text-red-600"
          />

          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* Personal Information */}

      <section className="card-base overflow-hidden">
        {/* Section Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-900 flex items-center justify-center">
              <User size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Personal Information
              </h2>

              <p className="text-sm text-gray-500 mt-0.5">
                Manage the basic information customers see on your profile.
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="provider-name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name
              </label>

              <input
                id="provider-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="provider-email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>

              <div className="relative">
                <input
                  id="provider-email"
                  type="email"
                  value={profile.user.email}
                  disabled
                  className="form-input bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed pr-24"
                />

                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-gray-400 bg-white border border-gray-200 px-2 py-1 rounded-md">
                  Read only
                </span>
              </div>

              <p className="text-xs text-gray-400 mt-1.5">
                Your email address cannot be changed here.
              </p>
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="provider-location"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Location
              </label>

              <div className="relative">
                <MapPin
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />

                <input
                  id="provider-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="form-input pl-10"
                  placeholder="e.g. Ibadan, Oyo State"
                />
              </div>

              <p className="text-xs text-gray-400 mt-1.5">
                This helps customers know where you are based.
              </p>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>

              <button
                type="button"
                onClick={() =>
                  setIsAvailable((current) => !current)
                }
                className={`w-full min-h-[44px] rounded-xl border px-4 py-2.5 flex items-center justify-between transition-all ${
                  isAvailable
                    ? "border-emerald-200 bg-emerald-50/70 hover:bg-emerald-50"
                    : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isAvailable
                        ? "bg-emerald-500"
                        : "bg-gray-400"
                    }`}
                  />

                  <div className="text-left">
                    <p
                      className={`text-sm font-medium ${
                        isAvailable
                          ? "text-emerald-700"
                          : "text-gray-600"
                      }`}
                    >
                      {isAvailable
                        ? "Available for work"
                        : "Currently unavailable"}
                    </p>

                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {isAvailable
                        ? "Customers can contact you for work"
                        : "Customers may see you as unavailable"}
                    </p>
                  </div>
                </div>

                {/* Toggle */}
                <span
                  className={`relative flex-shrink-0 w-10 h-5.5 rounded-full transition-colors ${
                    isAvailable
                      ? "bg-emerald-500"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform ${
                      isAvailable
                        ? "translate-x-4.5"
                        : "translate-x-0"
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="provider-bio"
                className="block text-sm font-medium text-gray-700"
              >
                About You
              </label>

              <span className="text-xs text-gray-400">
                {bio.length}/1000
              </span>
            </div>

            <textarea
              id="provider-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
              maxLength={1000}
              className="form-input resize-none leading-relaxed w-[100%] min-h-[120px] p-2"
              placeholder="Introduce yourself to potential customers. Tell them about your experience, expertise, what you offer, and why they should choose you..."
            />

            <p className="text-xs text-gray-400 mt-1.5">
              Keep your bio clear and professional. Highlight your
              experience and the value you provide.
            </p>
          </div>
        </div>
      </section>


      {/* Academic Information */}
      <section className="card-base overflow-hidden">
        {/* Section Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <GraduationCap size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Academic Information
              </h2>

              <p className="text-sm text-gray-500 mt-0.5">
                Add your educational details to help customers understand
                your background and expertise.
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
            {/* University */}
            <div>
              <label
                htmlFor="provider-university"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                University
              </label>

              <select
                id="provider-university"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="form-input p-1"
              >
                <option value="">Select university</option>

                {universities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <p className="text-xs text-gray-400 mt-1.5">
                Select the institution you currently attend or attended.
              </p>
            </div>

            {/* Faculty */}
            <div>
              <label
                htmlFor="provider-faculty"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Faculty
              </label>

              <input
                id="provider-faculty"
                type="text"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="form-input p-1"
                placeholder="e.g. Faculty of Science"
              />

              <p className="text-xs text-gray-400 mt-1.5">
                Enter your faculty or school.
              </p>
            </div>

            {/* Department */}
            <div>
              <label
                htmlFor="provider-department"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Department
              </label>

              <input
                id="provider-department"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="form-input p-1"
                placeholder="e.g. Computer Science"
              />

              <p className="text-xs text-gray-400 mt-1.5">
                Your course of study or academic department.
              </p>
            </div>

            {/* Level */}
            <div>
              <label
                htmlFor="provider-level"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Current Level
              </label>

              <select
                id="provider-level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="form-input p-1"
              >
                <option value="">Select level</option>

                {levels.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <p className="text-xs text-gray-400 mt-1.5">
                Your current academic level.
              </p>
            </div>

            {/* Matric Number */}
            <div>
              <label
                htmlFor="provider-matric"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Matric Number
              </label>

              <input
                id="provider-matric"
                type="text"
                value={matricId}
                onChange={(e) => setMatricId(e.target.value)}
                className="form-input p-1"
                placeholder="Enter your matric number"
              />

              <p className="text-xs text-gray-400 mt-1.5">
                Used as part of your student verification details.
              </p>
            </div>

            {/* Graduation Year */}
            <div>
              <label
                htmlFor="provider-graduation-year"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Graduation Year
              </label>

              <input
                id="provider-graduation-year"
                type="number"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                className="form-input p-1"
                placeholder="e.g. 2027"
                min={2000}
                max={2100}
              />

              <p className="text-xs text-gray-400 mt-1.5">
                Expected year of graduation.
              </p>
            </div>
          </div>

          {/* Academic Verification Note */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/60 border border-blue-100">
              <GraduationCap
                size={17}
                className="text-blue-600 mt-0.5 flex-shrink-0"
              />

              <div>
                <p className="text-sm font-medium text-blue-900">
                  Keep your academic information accurate
                </p>

                <p className="text-xs text-blue-700/80 mt-1 leading-relaxed">
                  Your university, department, level, matric number, and
                  graduation year may be used during student verification.
                  Make sure the information matches your official records.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


    {/* Skills */}
    <section className="card-base">
      {/* Section Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Briefcase size={19} />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">
              Skills
            </h2>

            <p className="text-sm text-gray-500 mt-0.5">
              Select the skills you can confidently offer to customers.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Selected Skills */}
        {skills.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Your Skills
                </h3>

                <p className="text-xs text-gray-400 mt-0.5">
                  These skills will appear on your public profile.
                </p>
              </div>

              <span className="text-xs font-medium text-primary-900 bg-primary-50 px-2.5 py-1 rounded-full">
                {skills.length}{" "}
                {skills.length === 1 ? "skill" : "skills"}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill.id}
                  className="inline-flex items-center gap-2 bg-primary-50 text-primary-900 border border-primary-100 px-3 py-2 rounded-xl text-sm font-medium"
                >
                  {skill.name}

                  <button
                    type="button"
                    disabled={skillSaving}
                    onClick={() => removeSkill(skill.id)}
                    className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50"
                    aria-label={`Remove ${skill.name}`}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Add Skills */}
        <div className={skills.length > 0 ? "pt-6 border-t border-gray-100" : ""}>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Add Skills
            </h3>

            <p className="text-xs text-gray-400 mt-0.5">
              Choose from the suggested skills below or search for a
              specific skill.
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              className="form-input p-1 w-full border border-gray-200 focus:border-primary-300 focus:ring-1 focus:ring-primary-300"
              placeholder="Search for a skill..."
            />

            {/* Search Results */}
            {skillSearch && (
              <div className="absolute z-20 left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                {skillsLoading ? (
                  <div className="p-4 text-sm text-gray-500">
                    Loading skills...
                  </div>
                ) : filteredSkills.length > 0 ? (
                  <div className="max-h-72 overflow-y-auto">
                    {filteredSkills.map((skill) => (
                      <button
                        key={skill.id}
                        type="button"
                        disabled={skillSaving}
                        onClick={() => {
                          addSkill(skill.id);
                          setSkillSearch("");
                        }}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center justify-between disabled:opacity-50 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {skill.name}
                          </p>

                          {skill.category && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {skill.category.name}
                            </p>
                          )}
                        </div>

                        <span className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center">
                          <Plus
                            size={16}
                            className="text-gray-500"
                          />
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-sm text-gray-500">
                    No matching skills found.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Suggested Skills */}
          {!skillSearch && !skillsLoading && (
            <div className="mt-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Suggested Skills
                </p>

                <span className="text-xs text-gray-400">
                  Click to add
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {availableSkills
                  .filter(
                    (skill) =>
                      !skills.some(
                        (selected) => selected.id === skill.id
                      )
                  )
                  .slice(0, 6)
                  .map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      disabled={skillSaving}
                      onClick={() => addSkill(skill.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-900 transition-colors disabled:opacity-50"
                    >
                      <Plus size={14} />
                      {skill.name}
                    </button>
                  ))}
              </div>

              {availableSkills.filter(
                (skill) =>
                  !skills.some(
                    (selected) => selected.id === skill.id
                  )
              ).length === 0 && (
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-500">
                  You have selected all available skills.
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {skillsLoading && (
            <div className="mt-5 flex items-center gap-2 text-sm text-gray-400">
              <span className="w-4 h-4 border-2 border-gray-200 border-t-primary-900 rounded-full animate-spin" />
              Loading available skills...
            </div>
          )}

          {/* Empty State */}
          {!skillsLoading &&
            availableSkills.length === 0 && (
              <div className="mt-5 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-sm font-medium text-gray-700">
                  No skills are available yet.
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Skills will appear here once they are added to the
                  marketplace.
                </p>
              </div>
            )}

          {/* Helper Note */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/60 border border-amber-100">
              <Briefcase
                size={17}
                className="text-amber-600 mt-0.5 flex-shrink-0"
              />

              <div>
                <p className="text-sm font-medium text-amber-900">
                  Choose skills you can actually offer
                </p>

                <p className="text-xs text-amber-700/80 mt-1 leading-relaxed">
                  Your selected skills help customers discover you and
                  understand the services you can provide. Only add skills
                  that match your actual experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>


      {/* Verification */}
      <section
        id="verification"
        className="card-base p-6"
      >
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="font-semibold text-gray-900">
              Verification
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Your verification status is managed by the
              SkilVer admin team.
            </p>
          </div>

          {profile.verificationStatus ===
            "VERIFIED" && (
            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold">
              <CheckCircle size={14} />
              Verified
            </span>
          )}

          {profile.verificationStatus ===
            "PENDING" && (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-semibold">
              <AlertCircle size={14} />
              Pending
            </span>
          )}

          {profile.verificationStatus ===
            "REJECTED" && (
            <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1.5 rounded-full text-xs font-semibold">
              <AlertCircle size={14} />
              Rejected
            </span>
          )}
        </div>

        {profile.verificationStatus ===
          "PENDING" && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800">
              Your profile is currently awaiting
              verification. Once your documents are reviewed,
              your verification status will be updated.
            </p>
          </div>
        )}

        {profile.verificationStatus ===
          "VERIFIED" && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-800">
              Your provider profile has been verified.
              Customers can see your verified status on the
              marketplace.
            </p>

            {profile.verifiedAt && (
              <p className="text-xs text-green-700 mt-1">
                Verified on{" "}
                {new Date(
                  profile.verifiedAt
                ).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {profile.verificationStatus ===
          "REJECTED" && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-800">
              Your verification was not approved. Please
              review your submitted information and contact
              the admin team if you need assistance.
            </p>

            {profile.verificationNote && (
              <p className="text-sm text-red-700 mt-2">
                <strong>Admin note:</strong>{" "}
                {profile.verificationNote}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Save */}
      <div className="flex justify-end pb-8">
        <button
          type="button"
          onClick={saveProfile}
          disabled={saving}
          className="btn-primary inline-flex items-center gap-2 px-6 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2
                size={17}
                className="animate-spin"
              />
              Saving...
            </>
          ) : (
            <>
              <Save size={17} />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}