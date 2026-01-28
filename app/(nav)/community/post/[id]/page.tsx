"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Post = {
  id: string;
  spaceKey: string;
  title: string | null;
  body: string;
  userId: string;
  createdAt?: string | null;
};

type Comment = {
  id: string;
  body: string;
  userId: string;
  createdAt?: string | null;
};

export default function CommunityPostPage() {
  const params = useParams();
  const postId = typeof params?.id === "string" ? params.id : "";
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [meUid, setMeUid] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [posting, setPosting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readErrorMessage = async (res: Response) => {
    try {
      const json = await res.json();
      return json?.error?.message ?? "Request failed";
    } catch {
      return await res.text();
    }
  };

  const loadThread = async (cursor?: string | null) => {
    if (!postId) return;
    const isPaging = Boolean(cursor);
    if (isPaging) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "20" });
      if (cursor) params.set("cursor", cursor);
      const commentsRes = await fetch(`/api/community/posts/${postId}/comments?${params.toString()}`);
      if (!commentsRes.ok) throw new Error(await readErrorMessage(commentsRes));
      const commentsJson = await commentsRes.json();
      const nextItems = commentsJson?.data?.comments ?? [];
      setPost(commentsJson?.data?.post ?? null);
      setComments((prev) => (isPaging ? [...nextItems, ...prev] : nextItems));
      setNextCursor(commentsJson?.data?.nextCursor ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load post");
    } finally {
      if (isPaging) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) return;
        const json = await res.json();
        setMeUid(json?.data?.userId ?? null);
      } catch {
        setMeUid(null);
      }
    };
    loadMe();
    loadThread();
  }, [postId]);

  useEffect(() => {
    if (post) {
      setEditTitle(post.title ?? "");
      setEditBody(post.body ?? "");
    }
  }, [post]);

  const submitComment = async () => {
    if (!body.trim() || !postId) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) throw new Error(await readErrorMessage(res));
      setBody("");
      await loadThread();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to comment");
    } finally {
      setPosting(false);
    }
  };

  const saveEdit = async () => {
    if (!postId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/community/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle.trim() || null, body: editBody }),
      });
      if (!res.ok) throw new Error(await readErrorMessage(res));
      setEditing(false);
      await loadThread();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update post");
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async () => {
    if (!postId) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/community/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: true }),
      });
      if (!res.ok) throw new Error(await readErrorMessage(res));
      setPost(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-3xl mx-auto px-6 md:px-10 py-10">
        <p className="text-sm text-warmCharcoal/60">Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container max-w-3xl mx-auto px-6 md:px-10 py-10">
        <p className="text-sm text-warmCharcoal/60">Post not found.</p>
      </div>
    );
  }

  const isOwner = meUid && post.userId && meUid === post.userId;

  return (
    <div className="container max-w-3xl mx-auto px-6 md:px-10 py-10">
      <div className="rounded-2xl border border-ip-border bg-white/80 p-6">
        {editing ? (
          <div className="space-y-3">
            <input
              className="w-full px-4 py-3 border border-ip-border rounded-xl text-sm text-warmCharcoal"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Title (optional)"
            />
            <textarea
              rows={5}
              className="w-full px-4 py-3 border border-ip-border rounded-xl text-sm text-warmCharcoal"
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              placeholder="Update your reflection"
            />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={saveEdit}
                disabled={saving}
                className="px-4 py-2 rounded-full bg-ip-accent text-white text-sm"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 rounded-full border border-ip-border text-sm text-warmCharcoal"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-semibold text-warmCharcoal">{post.title || "Reflection"}</h1>
              {isOwner ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(true)}
                    className="px-3 py-1 rounded-full border border-ip-border text-xs text-warmCharcoal"
                  >
                    Edit
                  </button>
                  <button
                    onClick={deletePost}
                    disabled={deleting}
                    className="px-3 py-1 rounded-full border border-red-200 text-xs text-red-600"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              ) : null}
            </div>
            <p className="mt-4 text-sm text-warmCharcoal/80 whitespace-pre-wrap">{post.body}</p>
          </>
        )}
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </div>

      <div className="mt-6 rounded-2xl border border-ip-border bg-ip-surface/60 p-5">
        <textarea
          rows={4}
          className="w-full px-4 py-3 border border-ip-border rounded-xl text-sm text-warmCharcoal"
          placeholder="Leave a supportive comment"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button
          onClick={submitComment}
          disabled={posting}
          className="mt-3 px-4 py-2 rounded-full bg-ip-accent text-white text-sm"
        >
          {posting ? "Posting..." : "Comment"}
        </button>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </div>

      <div className="mt-6 space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="rounded-2xl border border-ip-border bg-white/80 p-5">
            <p className="text-sm text-warmCharcoal/80 whitespace-pre-wrap">{comment.body}</p>
          </div>
        ))}
      </div>
      {nextCursor ? (
        <div className="mt-6">
          <button
            onClick={() => loadThread(nextCursor)}
            disabled={loadingMore}
            className="px-4 py-2 rounded-full border border-ip-border text-sm text-warmCharcoal"
          >
            {loadingMore ? "Loading..." : "Load earlier comments"}
          </button>
        </div>
      ) : null}
    </div>
  );
}