import { NextResponse } from "next/server";
import { deleteAccountData, isRecentAuthentication } from "@/lib/accountDeletion";
import { getRequestBearerAuth } from "@/lib/firebase/requestAuth";
import { firebaseAdmin } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function DELETE() {
  const bearerAuth = await getRequestBearerAuth();
  if (!bearerAuth.attempted || !bearerAuth.uid) {
    return NextResponse.json(
      { error: bearerAuth.error || "A valid mobile sign-in is required" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!isRecentAuthentication(bearerAuth.authTime)) {
    return NextResponse.json(
      {
        code: "RECENT_AUTHENTICATION_REQUIRED",
        error: "For your security, re-enter your password and try again.",
      },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const authUser = await firebaseAdmin.auth().getUser(bearerAuth.uid);
    await deleteAccountData(bearerAuth.uid, authUser.email);
    await firebaseAdmin.auth().deleteUser(bearerAuth.uid);

    return NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Account deletion failed:", error);
    return NextResponse.json(
      { error: "We could not finish deleting your account. Your account remains signed in; please try again." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
