import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
import PageTitle from "../components/PageTitle";
import Card from "../components/Card";
import Button from "../components/Button";
import SectionHeading from "../components/SectionHeading";
import Input from "../components/IPInput";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;
  if (!session) return redirect("/login");

  try {
    const decodedClaims = await firebaseAdmin.auth().verifySessionCookie(session, true);

    // Check entitlement
    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection("users").doc(decodedClaims.uid).get();

    if (!userDoc.exists || userDoc.data()?.entitlement?.status !== "active") {
      return redirect("/enrollment-required");
    }

    return (
      <div className="container max-w-5xl mx-auto px-6 md:px-10 py-8 md:py-12">
        
        <PageTitle subtitle="Personalize your experience and manage your account preferences.">
          Settings
        </PageTitle>

        {/* Profile Settings */}
        <div className="mb-16">
          <SectionHeading level="h2" className="mb-6">
            Profile Settings
          </SectionHeading>
          <Card accent="lavender">
            <h3 className="font-marcellus text-xl text-warmCharcoal mb-6">Your Profile</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-warmCharcoal mb-2 font-montserrat">
                  Display Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  defaultValue="Soul Leader"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-warmCharcoal mb-2 font-montserrat">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  defaultValue="soul@ipurpose.com"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-warmCharcoal mb-2 font-montserrat">
                  Bio
                </label>
                <textarea
                  rows={4}
                  placeholder="Share a bit about your purpose and journey..."
                  className="w-full px-4 py-3 border border-warmCharcoal/15 rounded-lg text-sm text-warmCharcoal placeholder:text-warmCharcoal/40 font-montserrat focus:outline-none focus:ring-2 focus:ring-lavenderViolet/30 focus:border-lavenderViolet transition-all"
                  defaultValue="Purpose-driven entrepreneur helping others align their work with their soul."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="primary">
                  Save Changes
                </Button>
                <Button variant="ghost">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Preferences */}
        <div className="mb-16">
          <SectionHeading level="h2" className="mb-6">
            Preferences
          </SectionHeading>
          <div className="grid md:grid-cols-2 gap-6">
            <Card accent="salmon">
              <h3 className="font-marcellus text-lg text-warmCharcoal mb-4">Notifications</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded border-warmCharcoal/25 text-salmonPeach focus:ring-salmonPeach/30 cursor-pointer"
                  />
                  <span className="text-sm text-warmCharcoal/75 font-montserrat group-hover:text-warmCharcoal transition-colors">
                    Daily reflection reminders
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded border-warmCharcoal/25 text-salmonPeach focus:ring-salmonPeach/30 cursor-pointer"
                  />
                  <span className="text-sm text-warmCharcoal/75 font-montserrat group-hover:text-warmCharcoal transition-colors">
                    Weekly insights summary
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-warmCharcoal/25 text-salmonPeach focus:ring-salmonPeach/30 cursor-pointer"
                  />
                  <span className="text-sm text-warmCharcoal/75 font-montserrat group-hover:text-warmCharcoal transition-colors">
                    Product updates & features
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded border-warmCharcoal/25 text-salmonPeach focus:ring-salmonPeach/30 cursor-pointer"
                  />
                  <span className="text-sm text-warmCharcoal/75 font-montserrat group-hover:text-warmCharcoal transition-colors">
                    Alignment milestones
                  </span>
                </label>
              </div>
            </Card>

            <Card accent="gold">
              <h3 className="font-marcellus text-lg text-warmCharcoal mb-4">Display & Theme</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-warmCharcoal mb-2 font-montserrat">
                    Theme Mode
                  </label>
                  <select className="w-full px-4 py-3 border border-warmCharcoal/15 rounded-lg text-sm text-warmCharcoal font-montserrat focus:outline-none focus:ring-2 focus:ring-softGold/30 focus:border-softGold transition-all">
                    <option>Light</option>
                    <option>Dark (Coming Soon)</option>
                    <option>Auto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-warmCharcoal mb-2 font-montserrat">
                    Accent Color
                  </label>
                  <div className="flex gap-3">
                    <button className="w-10 h-10 rounded-lg bg-lavenderViolet ring-2 ring-lavenderViolet/50 ring-offset-2 transition-all hover:scale-105" />
                    <button className="w-10 h-10 rounded-lg bg-salmonPeach hover:ring-2 hover:ring-salmonPeach/50 hover:ring-offset-2 transition-all hover:scale-105" />
                    <button className="w-10 h-10 rounded-lg bg-softGold hover:ring-2 hover:ring-softGold/50 hover:ring-offset-2 transition-all hover:scale-105" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Integrations */}
        <div className="mb-16">
          <SectionHeading level="h2" className="mb-6">
            Integrations
          </SectionHeading>
          <Card>
            <h3 className="font-marcellus text-lg text-warmCharcoal mb-4">Connected Services</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-warmCharcoal/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <p className="font-medium text-sm text-warmCharcoal font-montserrat">Google Calendar</p>
                    <p className="text-xs text-warmCharcoal/50 font-montserrat">Sync your scheduling</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Connect
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-warmCharcoal/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✉️</span>
                  <div>
                    <p className="font-medium text-sm text-warmCharcoal font-montserrat">Email Marketing</p>
                    <p className="text-xs text-warmCharcoal/50 font-montserrat">ConvertKit, Mailchimp, etc.</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Connect
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-warmCharcoal/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💳</span>
                  <div>
                    <p className="font-medium text-sm text-warmCharcoal font-montserrat">Payment Processor</p>
                    <p className="text-xs text-warmCharcoal/50 font-montserrat">Stripe, PayPal, etc.</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Connect
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Account Management */}
        <div>
          <SectionHeading level="h2" className="mb-6">
            Account Management
          </SectionHeading>
          <Card accent="salmon">
            <h3 className="font-marcellus text-lg text-warmCharcoal mb-4">Danger Zone</h3>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-warmCharcoal mb-1 font-montserrat">
                    Export Your Data
                  </p>
                  <p className="text-xs text-warmCharcoal/60 font-montserrat">
                    Download all your reflections, insights, and settings
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  Export
                </Button>
              </div>

              <div className="h-px bg-warmCharcoal/10"></div>

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-warmCharcoal mb-1 font-montserrat">
                    Delete Account
                  </p>
                  <p className="text-xs text-warmCharcoal/60 font-montserrat">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>

      </div>
    );
  } catch (e) {
    return redirect("/login");
  }
}
