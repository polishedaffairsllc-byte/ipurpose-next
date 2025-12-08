import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // In Next.js 16, cookies() returns a Promise, so we must await it
    const cookieStore = await cookies();

    // Remove the Firebase session cookie
    cookieStore.set("FirebaseSession", "", {
      path: "/",              // make sure it deletes across entire site
      expires: new Date(0),   // expire immediately
    });

    return NextResponse.json({
      success: true,
      message: "Logged out",
    });
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 }
    );
  }
}
