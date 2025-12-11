import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
import Navigation from "../components/Navigation";
import PageTitle from "../components/PageTitle";
import Card from "../components/Card";
import Button from "../components/Button";
import SectionHeading from "../components/SectionHeading";

export default async function SystemsPage() {
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
            
            <PageTitle subtitle="Build the structures that carry your purpose. Organize, automate, and streamline your flow.">
              Systems
            </PageTitle>

            <Card accent="gold" className="mb-10">
              <p className="text-xs font-medium tracking-[0.2em] text-white/55 uppercase mb-2">
                SYSTEMS PHILOSOPHY
              </p>
              <p className="text-sm text-white/75 leading-relaxed">
                Systems turn your purpose into momentum. These tools help you organize every part
                of your flow so your energy stays aligned, efficient, and powerful.
              </p>
            </Card>

            <SectionHeading level="h2" className="mb-6">
              Systems Tools
            </SectionHeading>

            <div className="grid md:grid-cols-2 gap-5 mb-12">
              <Card hover>
                <h3 className="font-marcellus text-lg text-offWhite mb-2">Workflow Builder</h3>
                <p className="text-sm text-white/65 mb-4 leading-relaxed">
                  Create simple, repeatable workflows that keep your operations smooth and confident.
                </p>
                <Button variant="ghost" size="sm">
                  Open Workflow Builder →
                </Button>
              </Card>

              <Card hover>
                <h3 className="font-marcellus text-lg text-offWhite mb-2">Content Engine</h3>
                <p className="text-sm text-white/65 mb-4 leading-relaxed">
                  Plan, organize, and document your content ideas with aligned strategy.
                </p>
                <Button variant="ghost" size="sm">
                  Launch Content Engine →
                </Button>
              </Card>

              <Card hover>
                <h3 className="font-marcellus text-lg text-offWhite mb-2">Offer Architecture</h3>
                <p className="text-sm text-white/65 mb-4 leading-relaxed">
                  Structure your offers, pricing, and delivery so everything feels clean and scalable.
                </p>
                <Button variant="ghost" size="sm">
                  Build Your Offers →
                </Button>
              </Card>

              <Card hover>
                <h3 className="font-marcellus text-lg text-offWhite mb-2">Task Orchestration</h3>
                <p className="text-sm text-white/65 mb-4 leading-relaxed">
                  Organize priorities, commitments, and daily tasks with clarity and ease.
                </p>
                <Button variant="ghost" size="sm">
                  Start Organizing →
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
