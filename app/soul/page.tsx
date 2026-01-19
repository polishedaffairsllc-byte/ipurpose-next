import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
import PageTitle from "../components/PageTitle";
import Card from "../components/Card";
import Button from "../components/Button";
import SectionHeading from "../components/SectionHeading";
import ArchetypeSelector from "../components/ArchetypeSelector";
import DailyCheckIn from "../components/DailyCheckIn";
import PracticeCard, { type Practice } from "../components/PracticeCard";

const PRACTICES: Practice[] = [
  {
    id: "morning-reflection",
    title: "Morning Reflection",
    description: "Start your day with intention. Reflect on your energy, priorities, and alignment.",
    duration: 5,
    icon: "📝",
    instructions: [
      "Find a quiet space. Sit for one minute without doing anything.",
      "Ask yourself: What do I want to feel today?",
      "What's one thing that would make today meaningful?",
      "Set an intention and close with three deep breaths."
    ]
  },
  {
    id: "evening-integration",
    title: "Evening Integration",
    description: "Close your day with gratitude. Review what aligned and what didn't.",
    duration: 10,
    icon: "🌙",
    instructions: [
      "Reflect on your day. What moments felt aligned?",
      "What didn't? Look with curiosity, not judgment.",
      "Write one thing you learned about yourself today.",
      "End with gratitude for one person or thing."
    ]
  },
  {
    id: "value-mapping",
    title: "Value Mapping",
    description: "Identify and clarify the core values that guide your decisions and direction.",
    duration: 20,
    icon: "💭",
    instructions: [
      "List 10 things that matter most to you (no judgment).",
      "Circle the top 3-5.",
      "For each, write why it matters in one sentence.",
      "Notice any patterns or contradictions.",
      "Define your top 3 values in your own words."
    ]
  },
  {
    id: "purpose-articulation",
    title: "Purpose Articulation",
    description: "Craft a clear, powerful statement of your aligned purpose and mission.",
    duration: 30,
    icon: "🎯",
    instructions: [
      "Review your values from the Value Mapping practice.",
      "Complete this sentence: 'I exist to...'",
      "Write 3-5 versions. They don't need to be perfect.",
      "Choose the one that makes your body relax.",
      "Test it: Does this guide my decisions?"
    ]
  }
];

async function getUserArchetype(userId: string) {
  try {
    const db = firebaseAdmin.firestore();
    const doc = await db.collection("users").doc(userId).get();
    const data = doc.data();
    return {
      primary: data?.archetypePrimary || null,
      secondary: data?.archetypeSecondary || null
    };
  } catch {
    return { primary: null, secondary: null };
  }
}

async function hasCheckedInToday(userId: string) {
  try {
    const db = firebaseAdmin.firestore();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const snapshot = await db
      .collection("users")
      .doc(userId)
      .collection("checkIns")
      .where("createdAt", ">=", today)
      .where("type", "==", "daily")
      .limit(1)
      .get();
    
    return !snapshot.empty;
  } catch {
    return false;
  }
}

export default async function SoulPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;
  if (!session) return redirect("/login");

  try {
    const decodedClaims = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const userId = decodedClaims.uid;

    // Check entitlement
    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists || userDoc.data()?.entitlement?.status !== "active") {
      return redirect("/enrollment-required");
    }
    
    const archetype = await getUserArchetype(userId);
    const hasCheckedIn = await hasCheckedInToday(userId);

    return (
      <div className="relative">
        {/* Hero Section */}
        <div className="relative h-[56vh] flex items-center justify-center overflow-hidden mb-10">
          <img
            src="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1920&q=80"
            alt="Soul journey"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="relative z-10 text-center px-4 max-w-4xl">
            <h1 className="heading-hero mb-4 text-warmCharcoal drop-shadow-2xl">Soul Alignment</h1>
            <p className="text-xl md:text-2xl text-warmCharcoal/80 font-marcellus drop-shadow-lg">
              Self-understanding over self-judgment. Your inner work is the foundation.
            </p>
          </div>
        </div>

        <div className="container max-w-6xl mx-auto px-6 md:px-10 py-6 md:py-8 space-y-10">

        {/* Philosophy Card */}
        <div className="ipurpose-glow-container mb-12">
          <Card accent="lavender" className="relative">
            <p className="text-xs font-medium tracking-widest text-warmCharcoal/55 uppercase mb-3 font-marcellus">
              YOUR SOUL → SYSTEMS → AI™ FOUNDATION
            </p>
            <p className="text-lg text-warmCharcoal/75 leading-relaxed font-marcellus">
              Soul work creates the foundation for everything. When you're aligned internally,
              your systems flow naturally and your AI tools amplify what truly matters.
            </p>
          </Card>
        </div>

        {/* Archetype Section */}
        <div className="mb-12">
          {!archetype.primary ? (
            <ArchetypeSelector />
          ) : (
            <Card accent="lavender" className="mb-8">
              <p className="text-xs font-medium tracking-widest text-warmCharcoal/45 uppercase mb-4 font-marcellus">
                Your Archetype
              </p>
              <div className="space-y-3">
                <p className="font-marcellus text-warmCharcoal text-lg">
                  {archetype.primary === 'visionary' && '✨ Visionary'}
                  {archetype.primary === 'builder' && '🎯 Builder'}
                  {archetype.primary === 'healer' && '💫 Healer'}
                  {archetype.secondary && ` + ${archetype.secondary === 'visionary' ? '✨ Visionary' : archetype.secondary === 'builder' ? '🎯 Builder' : '💫 Healer'}`}
                </p>
                <p className="text-sm text-warmCharcoal/70 font-marcellus">
                  Your archetype helps you understand your strengths and where you tend to judge yourself.
                </p>
              </div>
            </Card>
          )}

          {/* Daily Check-in */}
          {!hasCheckedIn && <DailyCheckIn />}

          <SectionHeading level="h2" className="mb-6">
            Daily Soul Practices
          </SectionHeading>
          <div className="grid md:grid-cols-2 gap-6">
            {PRACTICES.map(practice => (
              <PracticeCard
                key={practice.id}
                practice={practice}
              />
            ))}
          </div>
        </div>

        </div>
      </div>
    );
  } catch (e) {
    return redirect("/login");
  }
}
