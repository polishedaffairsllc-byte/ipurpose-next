import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
import AccountSettingsClient from "./AccountSettingsClient";
import Footer from "../components/Footer";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;
  let userId: string | null = null;
  let userEmail: string | undefined;

  if (session) {
    try {
      const decodedClaims = await firebaseAdmin.auth().verifySessionCookie(session, true);
      userId = decodedClaims.uid;
      const user = await firebaseAdmin.auth().getUser(userId);
      userEmail = user.email;
    } catch {
      userId = null;
    }
  }

  // Dev fallback to avoid redirects when session cookie is missing locally
  if (!userId && process.env.NODE_ENV !== "production") {
    userId = process.env.DEV_FOUNDER_UID || "dev-local-user";
    userEmail = "user@ipurpose.dev";
  }

  if (!userId) return redirect("/login");

  return (
    <>
      <div className="container max-w-5xl mx-auto px-6 md:px-10 py-8 md:py-12">
        <AccountSettingsClient userEmail={userEmail} />
      </div>
      <Footer />
    </>
  );
}
