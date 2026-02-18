"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import VideoBackground from "@/app/components/VideoBackground";
import StickyNote from "@/app/components/StickyNote";

type Post = {
  id: string;
  spaceKey: string;
  title: string | null;
  body: string;
  userId: string;
  createdAt?: string | null;
};

const spaces = [
  { key: "general", label: "General" },
  { key: "reflections", label: "Reflections" },
];

const guidelinesBySpace: Record<string, string[]> = {
  general: [
    "Share openly and stay kind.",
    "Offer support, not fixes.",
    "Protect privacy and consent.",
  ],
  reflections: [
    "Write from lived experience.",
    "Keep it grounded and honest.",
    "Respond with care and respect.",
  ],
};

export default function CommunityPage() {
  const router = useRouter();
  const [spaceKey, setSpaceKey] = useState("general");
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const readErrorMessage = async (res: Response) => {
    try {
      const json = await res.json();
      return json?.error?.message ?? "Request failed";
    } catch {
      return await res.text();
    }
  };

  const loadPosts = async (currentSpace = spaceKey, cursor?: string | null) => {
    const isPaging = Boolean(cursor);
    if (isPaging) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const params = new URLSearchParams({ spaceKey: currentSpace, limit: "10" });
      if (cursor) params.set("cursor", cursor);
      const res = await fetch(`/api/community/posts?${params.toString()}`);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      const items = json?.data?.items ?? [];
      setPosts(isPaging ? (prev) => [...prev, ...items] : items);
      setNextCursor(json?.data?.nextCursor ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load posts");
    } finally {
      if (isPaging) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let cancelled = false;
    const gateAndLoad = async () => {
      try {
        // Probe entitlement via API; API returns 401/403 JSON (no redirects)
        const probe = await fetch(`/api/community/posts?spaceKey=${spaceKey}&limit=1`);
        if (probe.status === 401) {
          router.replace("/login");
          return;
        }
        if (probe.status === 403) {
          router.replace("/enrollment-required");
          return;
        }
        if (!cancelled) {
          setNextCursor(null);
          await loadPosts(spaceKey);
        }
      } catch (err) {
        // If probe fails unexpectedly, route to enrollment as a safe default
        router.replace("/enrollment-required");
      }
    };

    gateAndLoad();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaceKey]);

  const submitPost = async () => {
    if (!body.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spaceKey, title: title.trim() || null, body }),
      });
      if (!res.ok) throw new Error(await readErrorMessage(res));
      setTitle("");
      setBody("");
      await loadPosts(spaceKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-6 md:px-10 py-10">
      <div className="relative h-[56vh] flex items-center justify-center overflow-hidden mb-10">
        <VideoBackground src="/videos/water-reflection.mp4" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
        <div className="absolute inset-0 w-full" style={{ backgroundColor: 'rgba(0,0,0,0.25)', top: 'auto', bottom: '1rem' }}>
          <div className="h-full flex items-center justify-center">
            <p className="font-marcellus text-display-emphasis px-8 py-4 text-center" style={{ color: '#ffffff' }}>
              A calm space for reflection and dialogue. Speak from lived experience.
            </p>
          </div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="heading-hero mb-4 text-white drop-shadow-2xl">Community</h1>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 mb-8">
        {spaces.map((space) => (
          <button
            key={space.key}
            onClick={() => setSpaceKey(space.key)}
            className={`px-4 py-2 rounded-full text-sm border ${
              spaceKey === space.key
                ? "bg-ip-accent text-white border-ip-accent"
                : "border-ip-border text-warmCharcoal/70"
            }`}
          >
            {space.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8 mb-8">
        {/* Post Creation Section */}
        <div className="rounded-2xl border border-ip-border bg-white/80 p-5 space-y-3">
          <input
            className="w-full px-4 py-3 border border-ip-border rounded-xl text-sm text-warmCharcoal"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            rows={5}
            className="w-full px-4 py-3 border border-ip-border rounded-xl text-sm text-warmCharcoal"
            placeholder="Leave a note..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <button
            onClick={submitPost}
            disabled={posting}
            className="px-4 py-2 rounded-full bg-ip-accent text-white text-sm"
          >
            {posting ? "Posting..." : "Leave a Note"}
          </button>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>

        {/* Guidelines Section */}
        <div className="rounded-2xl border border-ip-border bg-ip-surface/60 p-5">
          <h3 className="text-lg font-semibold text-warmCharcoal">Guidelines</h3>
          <ul className="mt-3 space-y-2 text-sm text-warmCharcoal/70">
            {(guidelinesBySpace[spaceKey] ?? []).map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-ip-accent flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sticky Notes Grid */}
      <div className="mb-8 relative rounded-3xl p-12 backdrop-blur-sm border-2 border-white/30 bg-gradient-to-br from-white/60 to-slate-100/40 min-h-[600px]">
        {/* Meeting icons scattered in background */}
        <div className="absolute inset-0 pointer-events-none opacity-10 text-warmCharcoal text-7xl font-bold overflow-hidden rounded-3xl">
          <div className="absolute top-8 left-8">💡</div>
          <div className="absolute top-16 right-12">✓</div>
          <div className="absolute bottom-12 left-1/4">🤝</div>
          <div className="absolute bottom-16 right-1/3">📌</div>
        </div>
        
        <p className="text-sm text-warmCharcoal/70 mb-6 text-center relative z-10">
          Click any note to view the full conversation and add your thoughts. Leave a note to share your reflection.
        </p>
        {loading ? (
          <p className="text-center text-sm text-warmCharcoal/60">Loading notes...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-sm text-warmCharcoal/60">No notes yet. Be the first to share!</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 gap-y-10 justify-items-center relative z-10">
            {posts.map((post) => (
              <StickyNote key={post.id} {...post} />
            ))}
          </div>
        )}
      </div>

      {/* Load More Button */}
      {nextCursor ? (
        <div className="flex justify-center">
          <button
            onClick={() => loadPosts(spaceKey, nextCursor)}
            disabled={loadingMore}
            className="px-4 py-2 rounded-full border border-ip-border text-sm text-warmCharcoal hover:bg-white/50"
          >
            {loadingMore ? "Loading..." : "Load more notes"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
