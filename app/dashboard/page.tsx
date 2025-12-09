import NavBar from "../components/NavBar";
import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
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
          <section className="dashboard-hero">
            <div>
              <h1 style={{ fontFamily: "Italiana, serif", margin: 0 }}>Welcome, {name}</h1>
              <h2 style={{ fontFamily: "Marcellus, serif", marginTop: 6 }}>Your iPurpose Portal</h2>
              <p style={{ marginTop: 12 }}>Daily affirmation: "I create space for what matters."</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a className="tile" href="/ai">AI Mentor</a>
              <a className="tile" href="/soul">Soul</a>
              <a className="tile" href="/systems">Systems</a>
              <a className="tile" href="/settings">Settings</a>

              <form action="/api/auth/logout" method="post" style={{ margin: 0 }}>
                <button className="tile" type="submit" style={{ background: "transparent", border: "none", textAlign: "left", padding: 12 }}>Logout</button>
              </form>
            </div>
          </section>

          <div className="tile-grid">
            <div className="tile">
              <div className="title">Quick Links</div>
              <div className="desc">AI • Soul • Systems • Settings</div>
            </div>

            <div className="tile">
              <div className="title">Mood</div>
              <div className="desc">Maybe your daily affirmation or mood tile</div>
            </div>

            <div className="tile">
              <div className="title">Actions</div>
              <div className="desc">Shortcuts for your most used tools</div>
            </div>
          </div>
        </main>
      </>
    );
  } catch {
    return redirect("/login");
  }
}
