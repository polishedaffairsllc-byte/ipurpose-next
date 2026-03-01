"use client";

import React, { useState } from "react";
import jsPDF from "jspdf";

interface CompletionProps {
  userName: string;
  values: Record<string, string>;
  completionDate: Date;
}

export default function StarterPackCompletion({ userName, values, completionDate }: CompletionProps) {
  const [downloading, setDownloading] = useState(false);

  const generateReflectionSheet = async () => {
    setDownloading(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Header
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("iPurpose™ Starter Pack", margin, yPosition);
      yPosition += 12;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Clarity Framework Reflection Sheet`, margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Date: ${completionDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Name: ${userName}`, margin, yPosition);
      yPosition += 12;

      // Purpose Statement - Highlighted
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text("Your Purpose Statement", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50);
      const purposeStatement = values["purpose_statement"] || "(Not completed)";
      const purposeLines = doc.splitTextToSize(purposeStatement, contentWidth - 4);
      doc.text(purposeLines, margin + 2, yPosition);
      yPosition += purposeLines.length * 6 + 8;

      // Core Values - Highlighted
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text("Core Values", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80);
      const valuesChosen = values["coreValues_three"] || "(Not completed)";
      const valuesLines = doc.splitTextToSize(`Selected Values: ${valuesChosen}`, contentWidth);
      doc.text(valuesLines, margin, yPosition);
      yPosition += valuesLines.length * 5 + 8;

      // Key Insights
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text("Key Insights", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80);

      const insights = [
        { label: "Alignment Statement", value: values["selfDiscovery_statement"] },
        { label: "Grounding Statement", value: values["grounding_statement"] },
        { label: "Most Surprising Discovery", value: values["integration_surprise"] },
        { label: "Next Brave Step", value: values["integration_bravestep"] },
      ];

      insights.forEach((insight) => {
        if (insight.value && yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = margin;
        }

        doc.setFont("helvetica", "bold");
        doc.setTextColor(100);
        doc.text(`${insight.label}:`, margin, yPosition);
        yPosition += 5;

        doc.setFont("helvetica", "normal");
        doc.setTextColor(50);
        const insightLines = doc.splitTextToSize(insight.value, contentWidth - 4);
        doc.text(insightLines, margin + 2, yPosition);
        yPosition += insightLines.length * 5 + 6;
      });

      // Footer
      yPosition = pageHeight - 20;
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("iPurpose™ — Clarity, Connection, Purpose", margin, yPosition);

      // Save
      doc.save(`iPurpose-StarterPack-${userName}-${completionDate.getFullYear()}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  const formattedDate = completionDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-8 shadow-2xl">
        <div className="relative">
          {/* Certificate-Style Header */}
          <div
            className="relative px-6 sm:px-8 py-12 sm:py-16 text-center overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(156,136,255,0.1) 0%, rgba(230,200,124,0.1) 100%)",
              borderBottom: "3px solid #9C88FF",
            }}
          >
            <div className="absolute top-0 left-0 right-0 flex justify-center text-6xl opacity-10">✨</div>

            <h2 style={{ fontSize: "clamp(28px, 6vw, 48px)", fontFamily: "Italiana, serif", color: "#2A2A2A", marginBottom: "8px" }}>
              You've Completed the
            </h2>
            <h1 style={{ fontSize: "clamp(32px, 8vw, 56px)", fontFamily: "Italiana, serif", color: "#9C88FF", fontWeight: "bold", marginBottom: "16px" }}>
              iPurpose Starter Pack
            </h1>

            <div className="flex items-center justify-center gap-3 mb-6">
              <div style={{ height: "2px", flex: 1, maxWidth: "80px", background: "#E6C87C" }}></div>
              <span style={{ fontFamily: "Marcellus, serif", color: "rgba(42,42,42,0.6)", fontSize: "14px", letterSpacing: "0.1em" }}>
                CLARITY FRAMEWORK
              </span>
              <div style={{ height: "2px", flex: 1, maxWidth: "80px", background: "#E6C87C" }}></div>
            </div>

            <p style={{ fontFamily: "Marcellus, serif", color: "rgba(42,42,42,0.7)", fontSize: "16px" }}>
              {formattedDate}
            </p>
          </div>

          {/* Content */}
          <div className="px-6 sm:px-8 py-10 sm:py-12 space-y-8">
            {/* Congratulations Message */}
            <div className="text-center space-y-3">
              <p style={{ fontSize: "48px", marginBottom: "8px" }}>🎉</p>
              <p style={{ fontFamily: "Marcellus, serif", fontSize: "24px", color: "#2A2A2A", fontWeight: "600" }}>
                Congratulations, {userName}!
              </p>
              <p style={{ fontFamily: "Marcellus, serif", fontSize: "16px", color: "rgba(42,42,42,0.7)", maxWidth: "500px", margin: "0 auto" }}>
                You've completed a comprehensive journey of self-discovery. The insights you've gathered are the foundation for all meaningful work.
              </p>
            </div>

            {/* Summary Recap */}
            <div style={{ background: "rgba(156,136,255,0.05)", borderLeft: "4px solid #9C88FF", padding: "16px", borderRadius: "8px" }}>
              <p style={{ fontFamily: "Marcellus, serif", fontSize: "14px", fontWeight: "600", color: "#9C88FF", marginBottom: "8px", textTransform: "uppercase" }}>
                Your Clarity Summary
              </p>
              <div className="space-y-3">
                {values["purpose_statement"] && (
                  <div>
                    <p style={{ fontFamily: "Marcellus, serif", fontSize: "12px", color: "rgba(42,42,42,0.6)", marginBottom: "4px" }}>
                      Purpose Statement
                    </p>
                    <p style={{ fontFamily: "Marcellus, serif", fontSize: "14px", color: "#2A2A2A", fontStyle: "italic" }}>
                      "{values["purpose_statement"]}"
                    </p>
                  </div>
                )}

                {values["coreValues_three"] && (
                  <div>
                    <p style={{ fontFamily: "Marcellus, serif", fontSize: "12px", color: "rgba(42,42,42,0.6)", marginBottom: "4px" }}>
                      Core Values
                    </p>
                    <p style={{ fontFamily: "Marcellus, serif", fontSize: "14px", color: "#2A2A2A" }}>
                      {values["coreValues_three"]}
                    </p>
                  </div>
                )}

                {values["selfDiscovery_statement"] && (
                  <div>
                    <p style={{ fontFamily: "Marcellus, serif", fontSize: "12px", color: "rgba(42,42,42,0.6)", marginBottom: "4px" }}>
                      Alignment Statement
                    </p>
                    <p style={{ fontFamily: "Marcellus, serif", fontSize: "14px", color: "#2A2A2A", fontStyle: "italic" }}>
                      "{values["selfDiscovery_statement"]}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Download Button */}
            <div className="flex justify-center">
              <button
                onClick={generateReflectionSheet}
                disabled={downloading}
                style={{
                  padding: "12px 32px",
                  borderRadius: "9999px",
                  fontFamily: "Marcellus, serif",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "white",
                  background: "#9C88FF",
                  border: "none",
                  cursor: downloading ? "wait" : "pointer",
                  transition: "all 0.2s ease",
                  opacity: downloading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!downloading) (e.target as HTMLButtonElement).style.background = "#8A77E8";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.background = "#9C88FF";
                }}
              >
                {downloading ? "Generating..." : "📥 Download Reflection Sheet"}
              </button>
            </div>

            {/* Next Steps */}
            <div className="space-y-6 pt-4 border-t border-rgba(42,42,42,0.1)">
              <div>
                <p style={{ fontFamily: "Marcellus, serif", fontSize: "18px", fontWeight: "600", color: "#2A2A2A", marginBottom: "12px" }}>
                  What's Next?
                </p>
                <p style={{ fontFamily: "Marcellus, serif", fontSize: "14px", color: "rgba(42,42,42,0.7)", marginBottom: "16px" }}>
                  Your Starter Pack is complete. Choose your next step based on where you are in your journey:
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {/* Option 1: Clarity Check */}
                <div style={{ padding: "16px", border: "2px solid #9C88FF", borderRadius: "12px", textAlign: "center" }}>
                  <p style={{ fontSize: "32px", marginBottom: "8px" }}>🔍</p>
                  <p style={{ fontFamily: "Marcellus, serif", fontSize: "14px", fontWeight: "600", color: "#2A2A2A", marginBottom: "8px" }}>
                    Deepen Your Clarity
                  </p>
                  <p style={{ fontFamily: "Marcellus, serif", fontSize: "12px", color: "rgba(42,42,42,0.6)", marginBottom: "12px" }}>
                    Take the Clarity Check assessment to understand your core archetype and soul patterns.
                  </p>
                  <a
                    href="/clarity-check"
                    style={{
                      display: "inline-block",
                      padding: "8px 16px",
                      borderRadius: "9999px",
                      fontFamily: "Marcellus, serif",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#9C88FF",
                      border: "1px solid #9C88FF",
                      textDecoration: "none",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLAnchorElement).style.background = "#9C88FF";
                      (e.target as HTMLAnchorElement).style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLAnchorElement).style.background = "transparent";
                      (e.target as HTMLAnchorElement).style.color = "#9C88FF";
                    }}
                  >
                    Begin Assessment
                  </a>
                </div>

                {/* Option 2: AI Blueprint */}
                <div style={{ padding: "16px", border: "2px solid #E6C87C", borderRadius: "12px", textAlign: "center" }}>
                  <p style={{ fontSize: "32px", marginBottom: "8px" }}>🤖</p>
                  <p style={{ fontFamily: "Marcellus, serif", fontSize: "14px", fontWeight: "600", color: "#2A2A2A", marginBottom: "8px" }}>
                    Build with AI Blueprint
                  </p>
                  <p style={{ fontFamily: "Marcellus, serif", fontSize: "12px", color: "rgba(42,42,42,0.6)", marginBottom: "12px" }}>
                    Use AI tools to translate your clarity into concrete systems and plans.
                  </p>
                  <a
                    href="/ai-blueprint"
                    style={{
                      display: "inline-block",
                      padding: "8px 16px",
                      borderRadius: "9999px",
                      fontFamily: "Marcellus, serif",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#E6C87C",
                      border: "1px solid #E6C87C",
                      textDecoration: "none",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLAnchorElement).style.background = "#E6C87C";
                      (e.target as HTMLAnchorElement).style.color = "#2A2A2A";
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLAnchorElement).style.background = "transparent";
                      (e.target as HTMLAnchorElement).style.color = "#E6C87C";
                    }}
                  >
                    Explore Blueprint
                  </a>
                </div>

                {/* Option 3: Accelerator */}
                <div style={{ padding: "16px", border: "2px solid #FCC4B7", borderRadius: "12px", textAlign: "center" }}>
                  <p style={{ fontSize: "32px", marginBottom: "8px" }}>🚀</p>
                  <p style={{ fontFamily: "Marcellus, serif", fontSize: "14px", fontWeight: "600", color: "#2A2A2A", marginBottom: "8px" }}>
                    Launch with Accelerator
                  </p>
                  <p style={{ fontFamily: "Marcellus, serif", fontSize: "12px", color: "rgba(42,42,42,0.6)", marginBottom: "12px" }}>
                    Join our 6-week cohort to transform clarity into action with community support.
                  </p>
                  <a
                    href="/program"
                    style={{
                      display: "inline-block",
                      padding: "8px 16px",
                      borderRadius: "9999px",
                      fontFamily: "Marcellus, serif",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#FCC4B7",
                      border: "1px solid #FCC4B7",
                      textDecoration: "none",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLAnchorElement).style.background = "#FCC4B7";
                      (e.target as HTMLAnchorElement).style.color = "#2A2A2A";
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLAnchorElement).style.background = "transparent";
                      (e.target as HTMLAnchorElement).style.color = "#FCC4B7";
                    }}
                  >
                    View Programs
                  </a>
                </div>
              </div>
            </div>

            {/* Certificate of Completion - Diploma Style */}
            <div
              style={{
                padding: "40px 32px",
                border: "3px solid #4B4E6D",
                borderRadius: "2px",
                textAlign: "center",
                background: "linear-gradient(135deg, rgba(75,78,109,0.08) 0%, rgba(156,136,255,0.04) 100%)",
                position: "relative",
                boxShadow: "0 8px 32px rgba(75,78,109,0.15)",
              }}
            >
              {/* Decorative top border */}
              <div style={{ position: "absolute", top: "12px", left: "20px", right: "20px", height: "1px", background: "#E6C87C" }}></div>
              <div style={{ position: "absolute", top: "16px", left: "20px", right: "20px", height: "1px", background: "#9C88FF", opacity: 0.5 }}></div>

              {/* Ornamental corner flourishes */}
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  left: "20px",
                  fontSize: "24px",
                  color: "#E6C87C",
                  opacity: 0.6,
                }}
              >
                ❖
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "20px",
                  fontSize: "24px",
                  color: "#E6C87C",
                  opacity: 0.6,
                }}
              >
                ❖
              </div>

              {/* Main Content */}
              <p style={{ fontFamily: "Italiana, serif", fontSize: "16px", letterSpacing: "0.08em", color: "#4B4E6D", marginBottom: "24px", marginTop: "12px", textTransform: "uppercase", fontStyle: "italic" }}>
                ✧ Certificate of Completion ✧
              </p>

              <p style={{ fontFamily: "Marcellus, serif", fontSize: "13px", color: "rgba(42,42,42,0.6)", marginBottom: "20px", letterSpacing: "0.05em" }}>
                Be It Known That
              </p>

              <p style={{ fontFamily: "Italiana, serif", fontSize: "32px", color: "#2A2A2A", fontWeight: "bold", marginBottom: "6px", letterSpacing: "0.02em" }}>
                {userName}
              </p>

              <div style={{ margin: "16px 0", height: "1px", background: "linear-gradient(to right, transparent, #4B4E6D, transparent)" }}></div>

              <p style={{ fontFamily: "Marcellus, serif", fontSize: "12px", color: "rgba(42,42,42,0.65)", marginBottom: "8px", letterSpacing: "0.05em" }}>
                has demonstrated dedication to self-discovery and successfully completed
              </p>

              <p style={{ fontFamily: "Italiana, serif", fontSize: "20px", color: "#9C88FF", fontWeight: "bold", marginBottom: "6px", letterSpacing: "0.02em" }}>
                The iPurpose™ Starter Pack
              </p>

              <p style={{ fontFamily: "Marcellus, serif", fontSize: "11px", color: "rgba(42,42,42,0.6)", marginBottom: "20px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Clarity Framework
              </p>

              <div style={{ margin: "16px 0", height: "1px", background: "linear-gradient(to right, transparent, #E6C87C, transparent)" }}></div>

              <p style={{ fontFamily: "Marcellus, serif", fontSize: "11px", color: "rgba(42,42,42,0.5)", marginBottom: "4px", letterSpacing: "0.05em" }}>
                Awarded this day,
              </p>

              <p style={{ fontFamily: "Marcellus, serif", fontSize: "13px", color: "#4B4E6D", fontWeight: "600", marginBottom: "20px" }}>
                {completionDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>

              {/* Decorative seal */}
              <div
                style={{
                  display: "inline-block",
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  border: "2px solid #9C88FF",
                  backgroundColor: "rgba(156,136,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  fontSize: "32px",
                }}
              >
                ✨
              </div>

              {/* Decorative bottom border */}
              <div style={{ position: "absolute", bottom: "16px", left: "20px", right: "20px", height: "1px", background: "#9C88FF", opacity: 0.5 }}></div>
              <div style={{ position: "absolute", bottom: "12px", left: "20px", right: "20px", height: "1px", background: "#E6C87C" }}></div>

              {/* Ornamental corner flourishes bottom */}
              <div
                style={{
                  position: "absolute",
                  bottom: "12px",
                  left: "20px",
                  fontSize: "24px",
                  color: "#E6C87C",
                  opacity: 0.6,
                }}
              >
                ❖
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: "12px",
                  right: "20px",
                  fontSize: "24px",
                  color: "#E6C87C",
                  opacity: 0.6,
                }}
              >
                ❖
              </div>

              <p style={{ fontFamily: "Italiana, serif", fontSize: "14px", color: "#4B4E6D", marginTop: "12px", fontStyle: "italic", letterSpacing: "0.03em" }}>
                iPurpose™ · Clarity, Connection, Purpose
              </p>
            </div>>
                iPurpose™ Starter Pack
              </p>
              <p style={{ fontFamily: "Marcellus, serif", fontSize: "12px", color: "rgba(42,42,42,0.6)" }}>
                Clarity Framework
              </p>
              <p style={{ fontFamily: "Marcellus, serif", fontSize: "12px", color: "rgba(42,42,42,0.6)", marginTop: "8px" }}>
                {formattedDate}
              </p>
              <div style={{ marginTop: "16px", height: "1px", background: "rgba(75,78,109,0.3)" }}></div>
              <p style={{ fontFamily: "Italiana, serif", fontSize: "16px", color: "#4B4E6D", marginTop: "12px", fontStyle: "italic" }}>
                iPurpose™ · Clarity, Connection, Purpose
              </p>
            </div>
          </div>

          {/* Close Button */}
          <div className="px-6 sm:px-8 py-6 border-t border-gray-200 flex justify-center">
            <a
              href="/dashboard"
              style={{
                padding: "10px 24px",
                borderRadius: "9999px",
                fontFamily: "Marcellus, serif",
                fontSize: "14px",
                fontWeight: "600",
                color: "#2A2A2A",
                background: "rgba(42,42,42,0.1)",
                border: "none",
                cursor: "pointer",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLAnchorElement).style.background = "rgba(42,42,42,0.15)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLAnchorElement).style.background = "rgba(42,42,42,0.1)";
              }}
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
