"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("/dashboard error boundary:", {
      message: error?.message,
      digest: error?.digest,
    });
  }, [error]);

  return (
    <div style={{ padding: 24, color: "red" }}>
      <h2>Dashboard crashed</h2>
      <p>We hit an error while rendering your dashboard.</p>
      <pre>{error?.message}</pre>
      {error?.digest ? <div>Digest: {error.digest}</div> : null}
      <button
        style={{ marginTop: 12, padding: "8px 12px" }}
        onClick={() => reset()}
      >
        Retry
      </button>
    </div>
  );
}
