import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import Card from "../../../components/Card";
import SectionHeading from "../../../components/SectionHeading";
import Button from "../../../components/Button";
import { isFounder } from "@/lib/isFounder";

export const dynamic = "force-dynamic";

export default async function WorkflowDeepenPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;
  if (!session) return redirect("/login");

  const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
  const db = firebaseAdmin.firestore();
  const userDoc = await db.collection("users").doc(decoded.uid).get();
  const userData = userDoc.data() ?? {};
  const founderBypass = isFounder(decoded, userData);
  if (!founderBypass && (!userDoc.exists || userData?.entitlement?.status !== "active")) {
    return redirect("/enrollment-required");
  }

  const workflowSnapshot = await db.collection("workflowSystems").where("uid", "==", decoded.uid).get();
  const hasWorkflows = !workflowSnapshot.empty || Boolean(userData?.systems?.workflowBuilderHasSystem);
  if (!hasWorkflows) {
    return redirect("/systems/workflows?locked=1");
  }

  const workflows = workflowSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="relative h-[24vh] flex items-center justify-center overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-lavenderViolet/12 via-white to-salmonPeach/10" />
        <div className="relative z-10 text-center px-4 max-w-3xl space-y-2">
          <p className="text-xs font-semibold tracking-[0.35em] text-indigoDeep/70 uppercase">Workflow Builder</p>
          <h1 className="heading-hero text-warmCharcoal drop-shadow-2xl">Deepen & Scale This System</h1>
          <p className="text-sm md:text-base text-warmCharcoal/75 font-marcellus">Coming next: frameworks, SOPs, handoffs, automation.</p>
        </div>
      </div>

      <div className="container max-w-5xl mx-auto px-6 md:px-10 pb-12 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <SectionHeading level="h2" className="!mb-0">Your Workflows</SectionHeading>
          <Button variant="ghost" size="sm" href="/systems/workflows">← Back to Workflow Builder</Button>
        </div>

        <Card className="p-6 shadow-soft-md space-y-4">
          {workflows.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {workflows.map((wf) => {
                const updated = (wf.updatedAt as any)?.toDate?.()?.toISOString?.() || (wf.updatedAt as any)?.toISOString?.() || "";
                return (
                  <div key={wf.id} className="rounded-xl border border-warmCharcoal/10 bg-white/90 p-4">
                    <p className="text-sm font-semibold text-warmCharcoal">{wf.name || "Untitled workflow"}</p>
                    <p className="text-xs text-warmCharcoal/60">{updated ? `Last updated: ${updated}` : "Saved"}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-warmCharcoal/70">Saved workflows will show here once created.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
