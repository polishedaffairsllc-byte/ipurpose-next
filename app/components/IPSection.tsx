"use client";

import React from "react";

export default function IPSection({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-16">
      {children}
    </section>
  );
}
