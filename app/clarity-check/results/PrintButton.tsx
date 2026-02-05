'use client';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-6 py-3 bg-warmCharcoal text-white font-marcellus rounded-lg hover:bg-warmCharcoal/90 transition-colors"
    >
      Print / Save as PDF
    </button>
  );
}
