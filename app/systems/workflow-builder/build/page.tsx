import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import Card from "../../../components/Card";
import SectionHeading from "../../../components/SectionHeading";
import Button from "../../../components/Button";
import Link from "next/link";
import BuildWorkflowForm from "./BuildWorkflowForm";

export const dynamic = "force-dynamic";

export default async function WorkflowBuildPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;
  if (!session) return redirect("/login");

  const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
  const db = firebaseAdmin.firestore();
  const userDoc = await db.collection("users").doc(decoded.uid).get();
  if (!userDoc.exists || userDoc.data()?.entitlement?.status !== "active") {
    return redirect("/enrollment-required");
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="relative h-[26vh] flex items-center justify-center overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-lavenderViolet/12 via-white to-salmonPeach/10" />
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.35em] text-indigoDeep/70 uppercase mb-3">Workflow Builder</p>
          <h1 className="heading-hero mb-2 text-warmCharcoal drop-shadow-2xl">Start the 30-Minute Build</h1>
          <p className="text-sm md:text-base text-warmCharcoal/75 font-marcellus">Create your first workflow, save it, and unlock the deepen path.</p>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-6 md:px-10 pb-12 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <SectionHeading level="h2" className="!mb-0">Create First Workflow</SectionHeading>
          <Link href="/systems/workflows" className="text-indigoDeep text-sm">← Back to Workflow Builder</Link>
        </div>

        <Card className="p-6 shadow-soft-md">
          <BuildWorkflowForm userId={decoded.uid} />
        </Card>
      </div>
    </div>
  );
}
