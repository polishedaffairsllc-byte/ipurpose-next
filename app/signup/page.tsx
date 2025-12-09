"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";

import IPHeading from "@/app/components/IPHeading";
import IPCard from "@/app/components/IPCard";
import IPButton from "@/app/components/IPButton";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-ip-heading px-6">
      <IPCard>
        <IPHeading size="lg">Create Your Account</IPHeading>
        <p className="mt-2 text-ip-text">Join the iPurpose experience</p>

        <form onSubmit={handleSignup} className="mt-8 space-y-4">
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-ip-border rounded-xl px-4 py-3 text-ip-text"
            required
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-ip-border rounded-xl px-4 py-3 text-ip-text"
            required
          />

          <IPButton type="submit" className="w-full mt-4">
            Sign Up
          </IPButton>
        </form>

        <p className="text-center mt-6 text-ip-text text-sm">
          Already have an account?
          <span
            onClick={() => router.push("/login")}
            className="text-ip-indigo font-semibold ml-1 cursor-pointer"
          >
            Log In
          </span>
        </p>
      </IPCard>
    </div>
  );
}
