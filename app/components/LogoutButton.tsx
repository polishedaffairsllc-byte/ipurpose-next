"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
    >
      Logout
    </button>
  );
}
