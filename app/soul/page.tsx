import { redirect } from "next/navigation";
import { checkEntitlement } from "@/lib/entitlementCheck";
import PageTitle from "../components/PageTitle";
import Footer from "../components/Footer";
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
      "Test it gently: Does this guide my decisions?"
    ]
  }
];

type CheckinStats = {
  last7Count: number;
  latestCheckin: {
    alignmentScore?: number;
    emotions?: string[];
  } | null;
};

function getSuggestedPracticeId(checkin: CheckinStats['latestCheckin']) {
  if (!checkin) return null;

  const emotions = checkin.emotions || [];
  const alignment = checkin.alignmentScore ?? 5;

  // Mirror the same rules we surface in the check-in confirmation.
  if (alignment <= 4 || emotions.includes('Tired') || emotions.includes('Anxious')) {
    return 'evening-integration'; // Rest
  }
  if (alignment <= 6 || emotions.includes('Uncertain')) {
    return 'morning-reflection'; // Structure
  }
  if (alignment >= 7 || emotions.includes('Inspired') || emotions.includes('Energized')) {
    return 'purpose-articulation'; // Expression
  }
  return 'value-mapping'; // Reflection
}

async function getUserArchetype(userId: string) {
  try {
    const { firebaseAdmin } = await import("@/lib/firebaseAdmin");
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
    const { firebaseAdmin } = await import("@/lib/firebaseAdmin");
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

async function getCheckinStats(userId: string): Promise<CheckinStats> {
  try {
    const { firebaseAdmin } = await import("@/lib/firebaseAdmin");
    const db = firebaseAdmin.firestore();
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const last7Snapshot = await db
      .collection("users")
      .doc(userId)
      .collection("checkIns")
      .orderBy("createdAt", "desc")
      .where("createdAt", ">=", sevenDaysAgo)
      .get();

    const latestSnapshot = await db
      .collection("users")
      .doc(userId)
      .collection("checkIns")
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

    const latestDoc = latestSnapshot.docs.find((doc) => doc.data()?.type === "daily");
    const latestData = latestDoc?.data();

    const last7Count = last7Snapshot.docs.filter((doc) => doc.data()?.type === "daily").length;

    return {
      last7Count,
      latestCheckin: latestDoc
        ? {
            alignmentScore: latestData?.alignmentScore ?? undefined,
            emotions: latestData?.emotions ?? undefined
          }
        : null
    };
  } catch {
    return { last7Count: 0, latestCheckin: null };
  }
}

export default async function SoulPage() {
  const entitlement = await checkEntitlement();

  if (!entitlement.uid) return redirect("/login");
  if (!entitlement.isEntitled) return redirect("/enrollment-required");

  const userId = entitlement.uid;

  try {
    const { firebaseAdmin } = await import("@/lib/firebaseAdmin");
    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data() ?? {};
    
    const archetype = await getUserArchetype(userId);
    const hasCheckedIn = await hasCheckedInToday(userId);
    const checkinStats = await getCheckinStats(userId);
    const suggestedPracticeId = getSuggestedPracticeId(checkinStats.latestCheckin);

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
            <div className="inline-block bg-black/25 backdrop-blur-sm rounded-2xl px-8 py-4">
              <p className="text-warmCharcoal/80 font-marcellus drop-shadow-lg" style={{ fontSize: '55px' }}>
                Self-understanding over self-judgment. Your inner work is the foundation.
              </p>
            </div>
          </div>
        </div>

        <div className="container max-w-6xl mx-auto px-6 md:px-10 py-6 md:py-8 space-y-10">

        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6 mb-6">
          <Card accent="salmon" className="flex flex-col justify-between">
            <div className="space-y-3">
              <p className="font-medium tracking-widest text-warmCharcoal/55 uppercase font-marcellus" style={{ fontSize: '40px' }}>Orientation framing</p>
              <h2 className="font-marcellus text-warmCharcoal leading-tight" style={{ fontSize: '40px' }}>No need to hustle through this page.</h2>
              <p className="text-warmCharcoal/75 font-marcellus" style={{ fontSize: '40px' }}>
                Start where your body says yes today. If you feel foggy, begin with a quick check-in. If you feel clear, go straight to a practice.
              </p>
              <p className="text-warmCharcoal/60 font-marcellus" style={{ fontSize: '40px' }}>There's nothing to complete here — just notice how you feel in your body.</p>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <Button href="#alignment-check">60-second check-in</Button>
              <Button variant="secondary" href="#orientation">Choose a practice</Button>
            </div>
          </Card>

          <Card accent="lavender" className="relative">
            <p className="font-medium tracking-widest text-warmCharcoal/55 uppercase mb-3 font-marcellus" style={{ fontSize: '40px' }}>
              YOUR SOUL → SYSTEMS → AI™ FOUNDATION
            </p>
            <p className="text-warmCharcoal/75 leading-relaxed font-marcellus" style={{ fontSize: '40px' }}>
              Soul work creates the foundation for everything you build. When you're aligned internally,
              your systems flow naturally and your AI tools amplify what truly matters.
            </p>
          </Card>
        </div>

        {/* Archetype Section */}
        <div id="orientation" className="mb-12">
          {!archetype.primary ? (
            <ArchetypeSelector />
          ) : (
            <Card accent="lavender" className="mb-8">
              <p className="font-medium tracking-widest text-warmCharcoal/45 uppercase mb-4 font-marcellus" style={{ fontSize: '40px' }}>
                Your Archetype
              </p>
              <div className="space-y-3">
                <p className="font-marcellus text-warmCharcoal" style={{ fontSize: '40px' }}>
                  {archetype.primary === 'visionary' && '✨ Visionary'}
                  {archetype.primary === 'builder' && '🎯 Builder'}
                  {archetype.primary === 'healer' && '💫 Healer'}
                  {archetype.secondary && ` + ${archetype.secondary === 'visionary' ? '✨ Visionary' : archetype.secondary === 'builder' ? '🎯 Builder' : '💫 Healer'}`}
                </p>
                <p className="text-warmCharcoal/70 font-marcellus" style={{ fontSize: '40px' }}>
                  Your archetype helps you understand your strengths and where you tend to judge yourself.
                </p>
              </div>
            </Card>
          )}

          {/* Daily Check-in */}
            <div id="alignment-check">
              {!hasCheckedIn ? (
                <DailyCheckIn checkinsLast7={checkinStats.last7Count} />
              ) : (
                <Card accent="salmon" className="mb-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="font-medium tracking-widest text-warmCharcoal/55 uppercase mb-2 font-marcellus" style={{ fontSize: '40px' }}>Check-in</p>
                      <p className="font-marcellus text-warmCharcoal" style={{ fontSize: '40px' }}>You're set for today.</p>
                      <p className="text-warmCharcoal/70 font-marcellus" style={{ fontSize: '40px' }}>You've checked in {checkinStats.last7Count} of the last 7 days. If you want to add more, start a practice below.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button href="#practices">Go to practices</Button>
                      <Button variant="ghost" href="#orientation">Adjust orientation</Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>

          <div id="practices">
            <SectionHeading level="h2" className="mb-6">
              Daily Soul Practices
            </SectionHeading>
            <p className="text-warmCharcoal/70 font-marcellus" style={{ fontSize: '40px' }}>Start with the suggested one based on today's check-in.</p>
            <p className="text-warmCharcoal/60 font-marcellus mb-4" style={{ fontSize: '40px' }}>Suggested based on your check-in and current alignment.</p>
            <div className="grid md:grid-cols-2 gap-6">
              {PRACTICES.map(practice => (
                <PracticeCard
                  key={practice.id}
                  practice={practice}
                  suggested={practice.id === suggestedPracticeId}
                  defaultOpen={practice.id === suggestedPracticeId}
                />
              ))}
            </div>

            <Card accent="lavender" className="mt-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="font-medium tracking-widest text-warmCharcoal/55 uppercase mb-2 font-marcellus" style={{ fontSize: '40px' }}>Forward bridge</p>
                  <p className="font-marcellus text-warmCharcoal" style={{ fontSize: '40px' }}>Choose your next move and capture what you learned.</p>
                  <p className="text-warmCharcoal/70 font-marcellus" style={{ fontSize: '40px' }}>Your awareness here is saved to your Soul record. Over time, these patterns shape your Insights and future guidance.</p>
                  <p className="text-warmCharcoal/70 font-marcellus" style={{ fontSize: '40px' }}>When you're ready, hop into Inner Compass to map your next aligned action, open Labs to build, or end the session with a quick micro-brief.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button href="/inner-compass">Inner Compass</Button>
                  <Button variant="secondary" href="/labs">Open Labs</Button>
                  <Button variant="ghost" href="/dashboard">End session</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Footer />
        </div>
      </div>
    );
  } catch (e) {
    return redirect("/login");
  }
}
