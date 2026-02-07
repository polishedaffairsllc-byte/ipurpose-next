"use client";

import { useEffect, useState } from "react";
import Button from "@/app/components/Button";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navigation from "@/app/components/Navigation";
import { IntegrationSummaryModal } from "@/app/components/IntegrationSummaryModal";

type LabStatus = "not_started" | "in_progress" | "complete";

type LabData = { text?: string };

type LabResponses = {
  identity: {
    selfPerceptionMap: string;
    selfConceptMap: string;
    selfNarrativeMap: string;
  };
  meaning: {
    valueStructure: string;
    coherenceStructure: string;
    directionStructure: string;
  };
  agency: {
    awarenessPatterns: string;
    decisionPatterns: string;
    actionPatterns: string;
  };
};

type JournalEntry = {
  id: string;
  type: string;
  content: string;
  createdAt?: any;
};

type IntegrationData = {
  coreTruth: string;
  primaryDirection: string;
  internalShift: string;
  sevenDayPlan: string[];
};

const emptyIntegration: IntegrationData = {
  coreTruth: "",
  primaryDirection: "",
  internalShift: "",
  sevenDayPlan: ["", "", "", "", "", "", ""],
};

async function startCheckout() {
  try {
    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product: "accelerator" }),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const json = await res.json();
    const url = json?.url;
    if (url) {
      window.location.href = url;
    } else {
      throw new Error("Checkout URL missing");
    }
  } catch (err) {
    console.error("Checkout error", err);
    // As a fallback, send to enrollment-required
    window.location.href = "/enrollment-required";
  }
}

export default function IntegrationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromLabs = searchParams.get("from") === "labs";
  const [identity, setIdentity] = useState<LabData | null>(null);
  const [meaning, setMeaning] = useState<LabData | null>(null);
  const [agency, setAgency] = useState<LabData | null>(null);
  const [identityStatus, setIdentityStatus] = useState<LabStatus>("not_started");
  const [meaningStatus, setMeaningStatus] = useState<LabStatus>("not_started");
  const [agencyStatus, setAgencyStatus] = useState<LabStatus>("not_started");
  const [integration, setIntegration] = useState<IntegrationData>(emptyIntegration);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [userName, setUserName] = useState<string>("Friend");
  const [userArchetype, setUserArchetype] = useState<string>("");
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [labResponses, setLabResponses] = useState<LabResponses | null>(null);
  const [savedArtifact, setSavedArtifact] = useState<{ id: string; title: string } | null>(null);
  const [labsChanged, setLabsChanged] = useState(false);
  const [labFingerprint, setLabFingerprint] = useState<any>(null);
  const [userTier, setUserTier] = useState<string>("");
  const [savingToJournal, setSavingToJournal] = useState(false);
  const [savedToJournal, setSavedToJournal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function load() {
      try {
        const [identityRes, meaningRes, agencyRes, integrationRes] = await Promise.all([
          fetch("/api/labs/identity"),
          fetch("/api/labs/meaning"),
          fetch("/api/labs/agency"),
          fetch("/api/integration"),
        ]);

        // Gate: if integration API says unauth or forbidden, trigger the right next step
        if (integrationRes.status === 401) {
          router.replace("/login");
          return;
        }
        if (integrationRes.status === 403) {
          if (fromLabs) {
            await startCheckout();
          } else {
            router.replace("/labs?message=complete-labs");
          }
          return;
        }

        const [identityJson, meaningJson, agencyJson, integrationJson] = await Promise.all([
          identityRes.json(),
          meaningRes.json(),
          agencyRes.json(),
          integrationRes.json(),
        ]);

        if (!isActive) return;

        // Get lab statuses from dashboard API
        try {
          const dashboardRes = await fetch("/api/dashboard", { cache: "no-store" });
          if (dashboardRes.ok) {
            const dashboardJson = await dashboardRes.json();
            const data = dashboardJson?.data;
            if (data) {
              setIdentityStatus(data?.identityStatus ?? "not_started");
              setMeaningStatus(data?.meaningStatus ?? "not_started");
              setAgencyStatus(data?.agencyStatus ?? "not_started");
            }
          }
        } catch (err) {
          console.error("Failed to load lab statuses", err);
        }

        // Get user data (name and archetype)
        try {
          const userRes = await fetch("/api/user");
          if (userRes.ok) {
            const userJson = await userRes.json();
            const userData = userJson?.data;
            if (userData) {
              const displayName = userData.displayName || userData.email?.split("@")[0] || "Friend";
              setUserName(displayName);
              setUserArchetype(userData.archetypePrimary || "");
              setUserTier(userData.tier || "FREE");
            }
          }
        } catch (err) {
          console.error("Failed to load user data", err);
        }

        setIdentity(identityJson?.data ?? null);
        setMeaning(meaningJson?.data ?? null);
        setAgency(agencyJson?.data ?? null);

        if (integrationJson?.data) {
          setIntegration({
            coreTruth: integrationJson.data.coreTruth || "",
            primaryDirection: integrationJson.data.primaryDirection || "",
            internalShift: integrationJson.data.internalShift || "",
            sevenDayPlan: Array.isArray(integrationJson.data.sevenDayPlan)
              ? integrationJson.data.sevenDayPlan
              : ["", "", "", "", "", "", ""],
          });
          
          // Store fingerprint if it exists
          if (integrationJson.data.labFingerprint) {
            setLabFingerprint(integrationJson.data.labFingerprint);
          }
        }
      } catch {
        if (isActive) setStatus("Failed to load integration data");
      } finally {
        if (isActive) setLoading(false);
      }
    }

    load();

    return () => {
      isActive = false;
    };
  }, []);

  // Check if labs have changed since reflection was generated
  useEffect(() => {
    async function checkLabChanges() {
      if (!generated || !labFingerprint) {
        setLabsChanged(false);
        return;
      }

      try {
        const res = await fetch("/api/integration/check-changes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ savedFingerprint: labFingerprint }),
        });

        if (res.ok) {
          const json = await res.json();
          setLabsChanged(json.changed || false);
        }
      } catch (err) {
        console.error("Failed to check lab changes:", err);
      }
    }

    checkLabChanges();
  }, [generated, labFingerprint]);

  const updatePlan = (index: number, value: string) => {
    setIntegration((prev) => {
      const nextPlan = [...prev.sevenDayPlan];
      nextPlan[index] = value;
      return { ...prev, sevenDayPlan: nextPlan };
    });
  };

  const save = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/integration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...integration,
          journalEntries,
          labResponses,
          labFingerprint,
        }),
      });

      if (!res.ok) {
        const textRes = await res.text();
        throw new Error(textRes || "Failed to save");
      }

      const json = await res.json();
      if (json.artifactId && json.title) {
        setSavedArtifact({ id: json.artifactId, title: json.title });
      }
      setStatus("Integration Reflection saved successfully!");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const downloadReflection = () => {
    const todayDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const separator = "=".repeat(60);
    let content = `Integration Reflection — ${todayDate}\n`;
    content += `${userName} the ${userArchetype || "Explorer"}\n`;
    content += `\n${separator}\n\n`;

    // Journal Entries
    if (journalEntries.length > 0) {
      content += `SESSION JOURNAL — TODAY\n\n`;
      journalEntries.forEach(entry => {
        content += `${entry.type === 'affirmation' ? 'AFFIRMATION' : 'INTENTION'}:\n`;
        content += `${entry.content}\n\n`;
      });
      content += `${separator}\n\n`;
    }

    // Lab Responses
    if (labResponses) {
      content += `LAB RESPONSES\n\n`;
      
      content += `IDENTITY LAB\n`;
      if (labResponses.identity.selfPerceptionMap) {
        content += `Self-Perception Map:\n${labResponses.identity.selfPerceptionMap}\n\n`;
      }
      if (labResponses.identity.selfConceptMap) {
        content += `Self-Concept Map:\n${labResponses.identity.selfConceptMap}\n\n`;
      }
      if (labResponses.identity.selfNarrativeMap) {
        content += `Self-Narrative Map:\n${labResponses.identity.selfNarrativeMap}\n\n`;
      }

      content += `MEANING LAB\n`;
      if (labResponses.meaning.valueStructure) {
        content += `Value Structure:\n${labResponses.meaning.valueStructure}\n\n`;
      }
      if (labResponses.meaning.coherenceStructure) {
        content += `Coherence Structure:\n${labResponses.meaning.coherenceStructure}\n\n`;
      }
      if (labResponses.meaning.directionStructure) {
        content += `Direction Structure:\n${labResponses.meaning.directionStructure}\n\n`;
      }

      content += `AGENCY LAB\n`;
      if (labResponses.agency.awarenessPatterns) {
        content += `Awareness Patterns:\n${labResponses.agency.awarenessPatterns}\n\n`;
      }
      if (labResponses.agency.decisionPatterns) {
        content += `Decision Patterns:\n${labResponses.agency.decisionPatterns}\n\n`;
      }
      if (labResponses.agency.actionPatterns) {
        content += `Action Patterns:\n${labResponses.agency.actionPatterns}\n\n`;
      }
      
      content += `${separator}\n\n`;
    }

    // Emerging Themes
    content += `EMERGING THEMES\n\n`;
    content += `Core Truth (from Identity Lab):\n${integration.coreTruth}\n\n`;
    content += `Primary Direction (from Meaning Lab):\n${integration.primaryDirection}\n\n`;
    content += `Internal Shift (from Agency Lab):\n${integration.internalShift}\n\n`;
    content += `${separator}\n\n`;

    // 7-Day Plan
    content += `7-DAY ALIGNMENT PLAN\n`;
    content += `Guided by your ${userArchetype || "Explorer"} archetype\n\n`;
    integration.sevenDayPlan.forEach((day, index) => {
      content += `Day ${index + 1}: ${day}\n`;
    });

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Integration-Reflection-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveToJournal = async () => {
    setSavingToJournal(true);
    setStatus(null);
    
    try {
      const todayDate = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const title = `Integration Reflection — ${todayDate}`;

      // Build comprehensive journal content
      const separator = "-".repeat(60);
      let content = `${title}\n`;
      content += `${userName} the ${userArchetype || "Explorer"}\n\n`;
      content += `${separator}\n\n`;

      // Session Journal
      if (journalEntries.length > 0) {
        content += `SESSION JOURNAL — TODAY\n\n`;
        journalEntries.forEach(entry => {
          let entryType = 'UNKNOWN';
          if (entry.type === 'affirmation_reflection') entryType = 'AFFIRMATION';
          else if (entry.type === 'intention') entryType = 'INTENTION';
          else if (entry.type === 'soul_reflection') entryType = 'SOUL REFLECTION';
          else if (entry.type === 'free_journal') entryType = 'FREE JOURNAL';
          else entryType = entry.type.toUpperCase();
          
          content += `${entryType}:\n${entry.content}\n\n`;
        });
        content += `${separator}\n\n`;
      }

      // Lab Responses
      if (labResponses) {
        content += `LAB RESPONSES\n\n`;
        
        content += `IDENTITY LAB\n`;
        if (labResponses.identity.selfPerceptionMap) {
          content += `Self-Perception Map:\n${labResponses.identity.selfPerceptionMap}\n\n`;
        }
        if (labResponses.identity.selfConceptMap) {
          content += `Self-Concept Map:\n${labResponses.identity.selfConceptMap}\n\n`;
        }
        if (labResponses.identity.selfNarrativeMap) {
          content += `Self-Narrative Map:\n${labResponses.identity.selfNarrativeMap}\n\n`;
        }

        content += `MEANING LAB\n`;
        if (labResponses.meaning.valueStructure) {
          content += `Value Structure:\n${labResponses.meaning.valueStructure}\n\n`;
        }
        if (labResponses.meaning.coherenceStructure) {
          content += `Coherence Structure:\n${labResponses.meaning.coherenceStructure}\n\n`;
        }
        if (labResponses.meaning.directionStructure) {
          content += `Direction Structure:\n${labResponses.meaning.directionStructure}\n\n`;
        }

        content += `AGENCY LAB\n`;
        if (labResponses.agency.awarenessPatterns) {
          content += `Awareness Patterns:\n${labResponses.agency.awarenessPatterns}\n\n`;
        }
        if (labResponses.agency.decisionPatterns) {
          content += `Decision Patterns:\n${labResponses.agency.decisionPatterns}\n\n`;
        }
        if (labResponses.agency.actionPatterns) {
          content += `Action Patterns:\n${labResponses.agency.actionPatterns}\n\n`;
        }
        
        content += `${separator}\n\n`;
      }

      // Emerging Themes
      content += `EMERGING THEMES\n\n`;
      content += `Core Truth (from Identity Lab):\n${integration.coreTruth}\n\n`;
      content += `Primary Direction (from Meaning Lab):\n${integration.primaryDirection}\n\n`;
      content += `Internal Shift (from Agency Lab):\n${integration.internalShift}\n\n`;
      content += `${separator}\n\n`;

      // 7-Day Plan
      content += `7-DAY ALIGNMENT PLAN\n`;
      content += `Guided by your ${userArchetype || "Explorer"} archetype\n\n`;
      integration.sevenDayPlan.forEach((day, index) => {
        content += `Day ${index + 1}: ${day}\n`;
      });

      // Save to journal via API
      const res = await fetch("/api/integration/save-to-journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, title }),
      });

      if (!res.ok) {
        const textRes = await res.text();
        throw new Error(textRes || "Failed to save to journal");
      }

      setSavedToJournal(true);
      setStatus("Integration saved to your journal!");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed to save to journal");
    } finally {
      setSavingToJournal(false);
    }
  };

  const generateIntegration = async () => {
    setGenerating(true);
    setStatus("Generating integration reflection...");
    
    try {
      const res = await fetch("/api/integration/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const textRes = await res.text();
        throw new Error(textRes || "Failed to generate");
      }

      const json = await res.json();
      const data = json?.data;

      if (data) {
        setJournalEntries(data.journalEntries || []);
        setLabResponses(data.labResponses || null);
        
        // Store the fingerprint
        if (data.labFingerprint) {
          setLabFingerprint(data.labFingerprint);
        }
        
        // Update integration fields with generated themes
        setIntegration({
          coreTruth: data.emergingThemes?.coreTruth || "",
          primaryDirection: data.emergingThemes?.primaryDirection || "",
          internalShift: data.emergingThemes?.internalShift || "",
          sevenDayPlan: data.sevenDayPlan || ["", "", "", "", "", "", ""],
        });

        setGenerated(true);
        setLabsChanged(false); // Reset change detection after regeneration
        setStatus(null);
        setShowSummaryModal(true); // Show modal after generation
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const allLabsComplete =
    identityStatus === "complete" && meaningStatus === "complete" && agencyStatus === "complete";

  const todayDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const printReflection = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="container max-w-5xl mx-auto px-6 md:px-10 py-10">
        <p className="text-sm text-warmCharcoal/60">Loading...</p>
      </div>
    );
  }

  // Locked state: if labs are not complete, show instructional state
  if (!allLabsComplete) {
    return (
      <div className="container max-w-5xl mx-auto px-6 md:px-10 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 space-y-8">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M13 16H7V4h6v12zm-6-14a1 1 0 00-1 1v14a1 1 0 001 1h6a1 1 0 001-1V3a1 1 0 00-1-1H7z" clipRule="evenodd" />
                </svg>
                <h1 className="text-2xl font-semibold text-amber-900">Integration Locked</h1>
              </div>
              <p className="text-sm text-amber-800">
                Complete all three labs before you can synthesize your integration.
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-amber-900">Lab Completion Checklist</h2>
              <div className="space-y-2">
                {[
                  { label: "Identity Lab", status: identityStatus },
                  { label: "Meaning Lab", status: meaningStatus },
                  { label: "Agency Lab", status: agencyStatus },
                ].map((lab) => (
                  <div key={lab.label} className="flex items-center gap-3">
                    <div
                      className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        lab.status === "complete"
                          ? "bg-emerald-500 border-emerald-600"
                          : "border-amber-300 bg-amber-100"
                      }`}
                    >
                      {lab.status === "complete" && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${lab.status === "complete" ? "text-emerald-700" : "text-amber-800"}`}>
                        {lab.label}
                      </p>
                      {lab.status !== "complete" && (
                        <p className="text-xs text-amber-700">
                          {lab.status === "in_progress" ? "In progress" : "Not started"}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-white/60 rounded-lg p-4 border border-amber-200">
              <p className="text-sm text-amber-900">
                <strong>Why this matters:</strong> Integration depends on having clarity from all three labs. This ensures your synthesis is grounded in identity, meaning, and agency.
              </p>
            </div>

            {/* CTA */}
            <Link href="/labs">
              <Button className="w-full">
                Continue to Labs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <style jsx global>{`
        @media print {
          body { background: #ffffff; color: #111111; }
          .print-hide { display: none !important; }
          .print-only { display: block !important; }
          .print-block { page-break-inside: avoid; }
        }
        @media screen {
          .print-only { display: none !important; }
        }
      `}</style>

      <div className="print-hide container max-w-5xl mx-auto px-6 md:px-10 py-10">
      {/* New Header */}
      <div className="mb-8">
        <h1 className="font-semibold text-warmCharcoal" style={{ fontSize: '28px' }}>
          Integration Reflection — {todayDate}
        </h1>
        <p className="mt-3 text-warmCharcoal/80" style={{ fontSize: '18px' }}>
          {userName} the {userArchetype || "Explorer"}
        </p>
        <p className="mt-4 text-warmCharcoal/70 font-marcellus" style={{ fontSize: '18px' }}>
          This reflection brings together what emerged from your work today.
        </p>
        <div className="mt-6">
          <Button onClick={generateIntegration} variant="primary" disabled={generating}>
            {generating ? "Generating..." : (generated ? "Regenerate Reflection" : "Generate My Integration Reflection")}
          </Button>
          {status ? (
            <p className="mt-3 text-warmCharcoal/70" style={{ fontSize: '16px' }}>
              {status}
            </p>
          ) : null}
          {generated ? (
            <div className="mt-4">
              <Button onClick={() => setShowSummaryModal(true)} variant="primary">
                View Integration Reflection
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Lab Change Detection Banner - shown after generation if labs changed */}
      {generated && labsChanged && (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-5 flex items-start gap-4">
          <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="font-medium text-amber-900" style={{ fontSize: '20px' }}>
              Your lab answers have changed since this reflection was generated.
            </p>
            <p className="mt-1 text-amber-800" style={{ fontSize: '20px' }}>
              Regenerate to update with your latest responses.
            </p>
            <div className="mt-4 flex gap-3">
              <Button 
                onClick={generateIntegration} 
                variant="primary" 
                disabled={generating}
              >
                {generating ? "Regenerating..." : "Regenerate Reflection"}
              </Button>
              <Button 
                onClick={() => setLabsChanged(false)} 
                variant="secondary"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Old Lab Inputs section - hide after generation or keep for reference */}
      {!generated && (
        <div className="mt-8 grid gap-8">
          <section className="rounded-2xl border border-ip-border bg-white/80 p-6">
            <h2 className="font-semibold text-warmCharcoal" style={{ fontSize: '20px' }}>Lab Inputs</h2>
            <div className="mt-4 space-y-3 text-warmCharcoal/70" style={{ fontSize: '20px' }}>
              <div>
                <strong>Identity:</strong> {identity?.text || "Not yet completed"}
              </div>
              <div>
                <strong>Meaning:</strong> {meaning?.text || "Not yet completed"}
              </div>
              <div>
                <strong>Agency:</strong> {agency?.text || "Not yet completed"}
              </div>
            </div>
          </section>
        </div>
      )}
      </div>

      {/* Integration Summary Modal */}
      <IntegrationSummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        userName={userName}
        userArchetype={userArchetype}
        todayDate={todayDate}
        journalEntries={journalEntries}
        labResponses={labResponses}
        integration={integration}
      />
    </>
  );
}
