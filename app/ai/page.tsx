import NavBar from "../components/NavBar";
import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
import AIClient from "./AIClient";

export default async function AIPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;
  if (!session) return redirect("/login");

  try {
    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const user = await firebaseAdmin.auth().getUser(decoded.uid);
    const name = user.displayName || (user.email ? user.email.split("@")[0] : "Friend");

    return (
      <>
        <NavBar />
        <main className="container">
          <h1 style={{ fontFamily: "Italiana, serif", margin: 0 }}>iPurpose Mentor</h1>
          <div className="ai-container">
            <AIClient initialName={name} />
          </div>
        </main>
      </>
    );
  } catch (e) {
    return redirect("/login");
  }
}
