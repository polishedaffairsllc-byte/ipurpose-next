import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
import Navigation from "../components/Navigation";
import PageTitle from "../components/PageTitle";
import Card from "../components/Card";
import Button from "../components/Button";
import SectionHeading from "../components/SectionHeading";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;
  if (!session) return redirect("/login");

  try {
    await firebaseAdmin.auth().verifySessionCookie(session, true);

    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#2b2d4a_0,#0f1017_42%,#050509_100%)]">
          <div className="container max-w-4xl mx-auto px-6 md:px-10 py-12 md:py-16">
            
            <PageTitle subtitle="Update your personal settings, preferences, and account details.">
              Account Settings
            </PageTitle>

            <div className="grid md:grid-cols-2 gap-5 mb-12">
              <Card hover>
                <h3 className="font-marcellus text-lg text-offWhite mb-2">Profile Info</h3>
                <p className="text-sm text-white/65 mb-4 leading-relaxed">
                  Update your name, photo, and identity settings.
                </p>
                <Button variant="ghost" size="sm">
                  Edit Profile →
                </Button>
              </Card>

              <Card hover>
                <h3 className="font-marcellus text-lg text-offWhite mb-2">Security</h3>
                <p className="text-sm text-white/65 mb-4 leading-relaxed">
                  Manage your password, login methods, and session access.
                </p>
                <Button variant="ghost" size="sm">
                  Update Security →
                </Button>
              </Card>

              <Card hover>
                <h3 className="font-marcellus text-lg text-offWhite mb-2">Notifications</h3>
                <p className="text-sm text-white/65 mb-4 leading-relaxed">
                  Set preferences for email and in-app communication.
                </p>
                <Button variant="ghost" size="sm">
                  Notification Settings →
                </Button>
              </Card>

              <Card hover>
                <h3 className="font-marcellus text-lg text-offWhite mb-2">Billing</h3>
                <p className="text-sm text-white/65 mb-4 leading-relaxed">
                  View invoices, payment methods, and subscription options.
                </p>
                <Button variant="ghost" size="sm">
                  View Billing →
                </Button>
              </Card>
            </div>

          </div>
        </main>
      </>
    );
  } catch (e) {
    return redirect("/login");
  }
}
