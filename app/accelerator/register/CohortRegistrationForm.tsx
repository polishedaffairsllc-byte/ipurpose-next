"use client";

import React, { useState, useCallback } from "react";
import IPInput from "@/app/components/IPInput";
import IPButton from "@/app/components/IPButton";

// ─── Types ─────────────────────────────────────────────────────────────────
interface FormData {
  // Step 1 — Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Step 2 — Birth Details & Demographics
  birthdate: string;
  birthTime: string;
  birthTimeUnknown: boolean;
  birthCity: string;
  birthState: string;
  genderIdentity: string;
  genderCustom: string;
  ethnicity: string[];

  // Step 3 — Life Context
  lifeStage: string;
  intentionStatement: string;
  referralSource: string;
  preferredCallTime: string;
}

interface Props {
  uid: string;
  prefillEmail: string;
  prefillName: string;
  cohortId: string;
  cohortLabel: string;
}

const STEPS = [
  { label: "Personal", icon: "I" },
  { label: "Birth & Identity", icon: "II" },
  { label: "Life Context", icon: "III" },
  { label: "Confirm", icon: "IV" },
];

const GENDER_OPTIONS = [
  "Woman",
  "Man",
  "Non-binary",
  "Genderqueer",
  "Agender",
  "Two-Spirit",
  "Prefer to self-describe",
  "Prefer not to say",
];

const ETHNICITY_OPTIONS = [
  "Black or African American",
  "Hispanic or Latino/a/x",
  "White or European American",
  "Asian or Asian American",
  "Native American or Alaska Native",
  "Native Hawaiian or Pacific Islander",
  "Middle Eastern or North African",
  "Multiracial",
  "Prefer not to say",
];

const LIFE_STAGE_OPTIONS = [
  "Student",
  "Early career (0–5 years)",
  "Mid-career (5–15 years)",
  "Career pivot / transition",
  "Entrepreneur / Founder",
  "Executive / Leadership",
  "Retired / Encore career",
  "Full-time parent / caregiver",
  "Other",
];

const REFERRAL_OPTIONS = [
  "Instagram",
  "Facebook",
  "LinkedIn",
  "TikTok",
  "Friend or colleague",
  "Podcast",
  "Google search",
  "Event or workshop",
  "Other",
];

// ─── Component ─────────────────────────────────────────────────────────────
export default function CohortRegistrationForm({
  uid,
  prefillEmail,
  prefillName,
  cohortId,
  cohortLabel,
}: Props) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const nameParts = prefillName.split(" ");
  const [form, setForm] = useState<FormData>({
    firstName: nameParts[0] ?? "",
    lastName: nameParts.slice(1).join(" ") ?? "",
    email: prefillEmail,
    phone: "",
    birthdate: "",
    birthTime: "",
    birthTimeUnknown: false,
    birthCity: "",
    birthState: "",
    genderIdentity: "",
    genderCustom: "",
    ethnicity: [],
    lifeStage: "",
    intentionStatement: "",
    referralSource: "",
    preferredCallTime: "",
  });

  const update = useCallback(
    (field: keyof FormData, value: string | boolean | string[]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setError("");
    },
    []
  );

  const toggleEthnicity = (val: string) => {
    setForm((prev) => {
      const current = prev.ethnicity;
      return {
        ...prev,
        ethnicity: current.includes(val)
          ? current.filter((v) => v !== val)
          : [...current, val],
      };
    });
  };

  // ── Validation ──
  const validateStep = (): boolean => {
    if (step === 0) {
      if (!form.firstName.trim() || !form.lastName.trim()) {
        setError("Please enter your first and last name.");
        return false;
      }
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
        setError("Please enter a valid email address.");
        return false;
      }
    }
    if (step === 1) {
      if (!form.birthdate) {
        setError("Please enter your birthdate.");
        return false;
      }
      if (!form.birthTime && !form.birthTimeUnknown) {
        setError('Please enter your birth time or select "I don\'t know."');
        return false;
      }
    }
    if (step === 2) {
      if (!form.lifeStage) {
        setError("Please select your current life stage.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, 3));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  // ── Submit ──
  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/accelerator/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, uid, cohortId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Registration failed.");
      }
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success state ──
  if (success) {
    return (
      <div
        className="rounded-2xl p-10 sm:p-14 text-center"
        style={{
          background: "linear-gradient(135deg, rgba(156,136,255,0.08), rgba(230,200,124,0.08))",
          border: "1px solid rgba(156,136,255,0.15)",
        }}
      >
        <div className="text-5xl mb-6">✦</div>
        <h2
          className="font-italiana text-warmCharcoal mb-3"
          style={{ fontSize: "clamp(24px, 4vw, 36px)" }}
        >
          You Are Registered
        </h2>
        <p className="font-marcellus text-warmCharcoal/60 text-base mb-2">
          Welcome to the {cohortLabel}, {form.firstName}.
        </p>
        <p className="font-marcellus text-warmCharcoal/40 text-sm mb-8">
          We&apos;ll send a confirmation and next steps to{" "}
          <span className="text-lavenderViolet">{form.email}</span>.
        </p>
        <a
          href="/accelerator"
          className="inline-block px-8 py-3 rounded-full font-marcellus text-white text-sm hover:opacity-90 transition-opacity"
          style={{
            background: "linear-gradient(to right, #9C88FF, rgba(156,136,255,0.6))",
          }}
        >
          Enter the Accelerator →
        </a>
      </div>
    );
  }

  // ── Render ──
  return (
    <div>
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-10">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.label}>
            {i > 0 && (
              <div
                className="h-px flex-1 max-w-[40px]"
                style={{
                  background:
                    i <= step
                      ? "linear-gradient(to right, #9C88FF, rgba(156,136,255,0.4))"
                      : "rgba(75,78,109,0.15)",
                }}
              />
            )}
            <button
              onClick={() => {
                if (i < step) setStep(i);
              }}
              className="flex flex-col items-center gap-1 group"
              style={{ cursor: i < step ? "pointer" : "default" }}
              type="button"
            >
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-italiana transition-all duration-300"
                style={{
                  background:
                    i === step
                      ? "linear-gradient(135deg, #9C88FF, #7B68EE)"
                      : i < step
                      ? "linear-gradient(135deg, rgba(156,136,255,0.25), rgba(156,136,255,0.1))"
                      : "rgba(75,78,109,0.06)",
                  color: i === step ? "#fff" : i < step ? "#9C88FF" : "#A3A3A3",
                  border:
                    i === step
                      ? "2px solid rgba(156,136,255,0.4)"
                      : i < step
                      ? "1px solid rgba(156,136,255,0.2)"
                      : "1px solid rgba(75,78,109,0.1)",
                }}
              >
                {i < step ? "✓" : s.icon}
              </div>
              <span
                className="text-[10px] sm:text-xs font-marcellus hidden sm:block"
                style={{
                  color: i === step ? "#9C88FF" : i < step ? "#9C88FF" : "#A3A3A3",
                }}
              >
                {s.label}
              </span>
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Form Card */}
      <div
        className="rounded-2xl p-6 sm:p-10"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(156,136,255,0.1)",
          boxShadow: "0 8px 40px rgba(156,136,255,0.06)",
        }}
      >
        {/* Error Banner */}
        {error && (
          <div
            className="rounded-xl px-4 py-3 mb-6 text-sm font-marcellus"
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.15)",
              color: "#DC2626",
            }}
          >
            {error}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            STEP 1 — Personal Information
        ════════════════════════════════════════════════════════════════════ */}
        {step === 0 && (
          <div className="space-y-6 animate-fadeIn">
            <StepHeader
              numeral="I"
              title="Personal Information"
              description="Let us know who you are."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <IPInput
                label="First Name"
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                placeholder="Your first name"
                required
              />
              <IPInput
                label="Last Name"
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                placeholder="Your last name"
                required
              />
            </div>

            <IPInput
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@example.com"
              required
            />

            <IPInput
              label="Phone (optional)"
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="(555) 555-1234"
            />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            STEP 2 — Birth Details & Demographics
        ════════════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <StepHeader
              numeral="II"
              title="Birth Details & Identity"
              description="Your birth data helps us personalize your purpose mapping experience."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <IPInput
                label="Birthdate"
                type="date"
                value={form.birthdate}
                onChange={(e) => update("birthdate", e.target.value)}
                required
              />
              <div>
                <IPInput
                  label="Birth Time"
                  type="time"
                  value={form.birthTime}
                  onChange={(e) => update("birthTime", e.target.value)}
                  disabled={form.birthTimeUnknown}
                  className={form.birthTimeUnknown ? "opacity-40" : ""}
                />
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.birthTimeUnknown}
                    onChange={(e) => {
                      update("birthTimeUnknown", e.target.checked);
                      if (e.target.checked) update("birthTime", "");
                    }}
                    className="w-4 h-4 rounded border-ip-border accent-lavenderViolet"
                  />
                  <span className="text-xs font-marcellus text-warmCharcoal/50">
                    I don&apos;t know my birth time
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <IPInput
                label="Birth City"
                value={form.birthCity}
                onChange={(e) => update("birthCity", e.target.value)}
                placeholder="City"
              />
              <IPInput
                label="Birth State / Region"
                value={form.birthState}
                onChange={(e) => update("birthState", e.target.value)}
                placeholder="State or region"
              />
            </div>

            <SelectField
              label="Gender Identity"
              value={form.genderIdentity}
              onChange={(v) => update("genderIdentity", v)}
              options={GENDER_OPTIONS}
              placeholder="Select…"
            />

            {form.genderIdentity === "Prefer to self-describe" && (
              <IPInput
                label="How do you identify?"
                value={form.genderCustom}
                onChange={(e) => update("genderCustom", e.target.value)}
                placeholder="Your identity"
              />
            )}

            <div className="space-y-2">
              <label className="block text-xs font-marcellus uppercase tracking-[0.14em] text-ip-muted">
                Ethnicity / Race (optional — select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {ETHNICITY_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleEthnicity(opt)}
                    className="px-3 py-1.5 rounded-full text-xs font-marcellus transition-all duration-200"
                    style={{
                      background: form.ethnicity.includes(opt)
                        ? "linear-gradient(135deg, #9C88FF, rgba(156,136,255,0.7))"
                        : "rgba(75,78,109,0.04)",
                      color: form.ethnicity.includes(opt) ? "#fff" : "#737373",
                      border: form.ethnicity.includes(opt)
                        ? "1px solid rgba(156,136,255,0.3)"
                        : "1px solid rgba(75,78,109,0.1)",
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            STEP 3 — Life Context
        ════════════════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <StepHeader
              numeral="III"
              title="Life Context"
              description="Help us understand where you are on your journey."
            />

            <SelectField
              label="Current Life Stage"
              value={form.lifeStage}
              onChange={(v) => update("lifeStage", v)}
              options={LIFE_STAGE_OPTIONS}
              placeholder="Select your stage…"
            />

            <div className="space-y-1">
              <label className="block text-xs font-marcellus uppercase tracking-[0.14em] text-ip-muted">
                Intention Statement (optional)
              </label>
              <textarea
                value={form.intentionStatement}
                onChange={(e) => update("intentionStatement", e.target.value)}
                placeholder="What are you hoping to discover, heal, or build during this program?"
                rows={4}
                className="w-full rounded-brand border border-ip-border bg-ip-input px-4 py-3 text-ip-heading placeholder-ip-muted shadow-sm focus:outline-none focus:ring-2 focus:ring-ip-lavender text-sm font-marcellus resize-none"
              />
            </div>

            <SelectField
              label="How did you hear about us?"
              value={form.referralSource}
              onChange={(v) => update("referralSource", v)}
              options={REFERRAL_OPTIONS}
              placeholder="Select…"
            />

            <SelectField
              label="Preferred Live Call Time"
              value={form.preferredCallTime}
              onChange={(v) => update("preferredCallTime", v)}
              options={["11:00 AM ET (Fridays)", "7:00 PM ET (Fridays)", "Either works"]}
              placeholder="Select a time…"
            />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            STEP 4 — Confirmation
        ════════════════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <StepHeader
              numeral="IV"
              title="Review & Confirm"
              description="Please review your information before submitting."
            />

            <div className="space-y-4">
              <ConfirmRow label="Name" value={`${form.firstName} ${form.lastName}`} />
              <ConfirmRow label="Email" value={form.email} />
              {form.phone && <ConfirmRow label="Phone" value={form.phone} />}

              <div
                className="h-px w-full"
                style={{ background: "linear-gradient(to right, transparent, rgba(156,136,255,0.15), transparent)" }}
              />

              <ConfirmRow label="Birthdate" value={formatDate(form.birthdate)} />
              <ConfirmRow
                label="Birth Time"
                value={form.birthTimeUnknown ? "Unknown" : formatTime(form.birthTime)}
              />
              {(form.birthCity || form.birthState) && (
                <ConfirmRow
                  label="Birth Location"
                  value={[form.birthCity, form.birthState].filter(Boolean).join(", ")}
                />
              )}
              {form.genderIdentity && (
                <ConfirmRow
                  label="Gender Identity"
                  value={
                    form.genderIdentity === "Prefer to self-describe"
                      ? form.genderCustom || "Self-described"
                      : form.genderIdentity
                  }
                />
              )}
              {form.ethnicity.length > 0 && (
                <ConfirmRow label="Ethnicity" value={form.ethnicity.join(", ")} />
              )}

              <div
                className="h-px w-full"
                style={{ background: "linear-gradient(to right, transparent, rgba(156,136,255,0.15), transparent)" }}
              />

              <ConfirmRow label="Life Stage" value={form.lifeStage} />
              {form.intentionStatement && (
                <ConfirmRow label="Intention" value={form.intentionStatement} />
              )}
              {form.referralSource && <ConfirmRow label="Referral" value={form.referralSource} />}
              {form.preferredCallTime && (
                <ConfirmRow label="Preferred Call" value={form.preferredCallTime} />
              )}
            </div>

            <div
              className="rounded-xl p-4 mt-4"
              style={{
                background: "rgba(156,136,255,0.04)",
                border: "1px solid rgba(156,136,255,0.1)",
              }}
            >
              <p className="text-xs font-marcellus text-warmCharcoal/50 leading-relaxed">
                By submitting, you confirm that the information above is accurate and consent to
                iPurpose using this data to personalize your accelerator experience. Your demographic
                information is kept confidential and will never be shared externally.
              </p>
            </div>
          </div>
        )}

        {/* ── Navigation Buttons ── */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-ip-border/30">
          {step > 0 ? (
            <button
              onClick={prevStep}
              type="button"
              className="text-sm font-marcellus text-warmCharcoal/50 hover:text-warmCharcoal transition-colors"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <IPButton variant="primary" onClick={nextStep} type="button">
              Continue →
            </IPButton>
          ) : (
            <IPButton
              variant="champagne"
              onClick={handleSubmit}
              type="button"
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Complete Registration ✦"}
            </IPButton>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-Components ────────────────────────────────────────────────────────

function StepHeader({
  numeral,
  title,
  description,
}: {
  numeral: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-3 mb-1">
        <span
          className="font-italiana text-lavenderViolet/60"
          style={{ fontSize: "14px", letterSpacing: "0.15em" }}
        >
          §{numeral}
        </span>
        <h2
          className="font-italiana text-warmCharcoal"
          style={{ fontSize: "clamp(20px, 3vw, 28px)" }}
        >
          {title}
        </h2>
      </div>
      <p className="text-sm font-marcellus text-warmCharcoal/45">{description}</p>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-marcellus uppercase tracking-[0.14em] text-ip-muted">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-brand border border-ip-border bg-ip-input px-4 py-2.5 text-ip-heading shadow-sm focus:outline-none focus:ring-2 focus:ring-ip-lavender text-sm appearance-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23A3A3A3' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
          backgroundPosition: "right 12px center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "20px 20px",
          paddingRight: "40px",
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
      <span className="text-xs font-marcellus uppercase tracking-[0.12em] text-warmCharcoal/35 sm:w-32 shrink-0">
        {label}
      </span>
      <span className="text-sm font-marcellus text-warmCharcoal/80">{value}</span>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(time: string): string {
  if (!time) return "—";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}
