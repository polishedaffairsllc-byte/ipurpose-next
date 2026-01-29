"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
    <div className="container max-w-5xl mx-auto px-6 md:px-10 py-10">
      <h1 className="text-4xl font-semibold text-warmCharcoal">Community</h1>
      <p className="mt-3 text-sm text-warmCharcoal/70">
        A calm space for reflection and dialogue. Speak from lived experience.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
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

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.6fr,0.9fr]">
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
            placeholder="Share a reflection"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <button
            onClick={submitPost}
            disabled={posting}
            className="px-4 py-2 rounded-full bg-ip-accent text-white text-sm"
          >
            {posting ? "Posting..." : "Post"}
          </button>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="rounded-2xl border border-ip-border bg-ip-surface/60 p-5">
          <h3 className="text-lg font-semibold text-warmCharcoal">Guidelines</h3>
          <ul className="mt-3 space-y-2 text-sm text-warmCharcoal/70">
            {(guidelinesBySpace[spaceKey] ?? []).map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-ip-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {loading ? <p className="mt-6 text-sm text-warmCharcoal/60">Loading...</p> : null}
      <div className="mt-6 space-y-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/community/post/${post.id}`}
            className="block rounded-2xl border border-ip-border bg-white/80 p-5"
          >
            <h2 className="text-lg font-semibold text-warmCharcoal">{post.title || "Reflection"}</h2>
            <p className="mt-2 text-sm text-warmCharcoal/70 line-clamp-3">{post.body}</p>
          </Link>
        ))}
      </div>
      {nextCursor ? (
        <div className="mt-6">
          <button
            onClick={() => loadPosts(spaceKey, nextCursor)}
            disabled={loadingMore}
            className="px-4 py-2 rounded-full border border-ip-border text-sm text-warmCharcoal"
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
