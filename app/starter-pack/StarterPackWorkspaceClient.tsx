"use client";

import Link from 'next/link';
import StarterPackClient from './StarterPackClient';

export default function StarterPackWorkspace({ email }: { email?: string | null }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-20 px-6 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to the Starter Pack</h1>
        {email && <p className="mb-6 text-sm text-gray-600">Signed in as <strong>{email}</strong></p>}

        <p className="mb-8">You now have access to the Starter Pack workspace. Use the materials below to begin.</p>

        <div className="space-y-6">
          <div className="p-6 border rounded-md">
            <h2 className="text-2xl font-semibold mb-2">Module 1 — Reflection Prompts</h2>
            <p className="text-sm text-gray-700 mb-3">A guided set of questions to help you name what's most important.</p>
            <Link href="#begin" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-md">Begin Starter Pack</Link>
          </div>

          <div className="p-6 border rounded-md">
            <h2 className="text-2xl font-semibold mb-2">Module 2 — Purpose Statement Framework</h2>
            <p className="text-sm text-gray-700">A short template and examples to craft a clear purpose statement.</p>
          </div>

          <div className="p-6 border rounded-md">
            <h2 className="text-2xl font-semibold mb-2">Module 3 — Simple Systems Map</h2>
            <p className="text-sm text-gray-700">Visualize supports and drains so you can design for what sustains you.</p>
          </div>
        </div>

        {/* Render the interactive workbook here */}
        <div id="begin" className="mt-12">
          <StarterPackClient />
        </div>

        <p className="mt-12 text-sm text-gray-600">If you have trouble accessing the Starter Pack, contact support.</p>
      </div>
    </div>
  );
}
