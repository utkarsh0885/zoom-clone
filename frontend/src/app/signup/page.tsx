"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, UserCheck, Video } from "lucide-react";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { authService } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import axios from "axios";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage("Full Name must be at least 2 characters");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Email is required");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await authService.signup({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
      });
      login(data.access_token, data.user);
      toast.success("Account created successfully!");
      router.push("/");
    } catch (err: unknown) {
      console.error("Signup error:", err);
      let msg = "Registration failed. Please try again.";
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        msg = err.response.data.detail;
      }
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zoom-dark-bg relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/3 -right-32 w-80 h-80 bg-zoom-blue/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -left-32 w-80 h-80 bg-zoom-purple/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-zoom-blue flex items-center justify-center shadow-md shadow-zoom-blue/20 mb-3">
            <Video className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-semibold text-zoom-text">Create Account</h1>
          <p className="text-[12px] text-zoom-text-muted mt-1">
            Sign up for a free Zoom account
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-zoom-card bg-zoom-dark-surface border border-zoom-dark-border p-5 shadow-xl shadow-black/20">
          <form onSubmit={handleSubmit} className="space-y-3">
            {errorMessage && (
              <div className="p-2.5 text-xs text-red-400 bg-zoom-red/10 rounded border border-zoom-red/20">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-zoom-text-muted mb-1" htmlFor="fullName">
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isSubmitting}
                className="w-full h-9 text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zoom-text-muted mb-1" htmlFor="email">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="w-full h-9 text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zoom-text-muted mb-1" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full h-9 text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zoom-text-muted mb-1" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full h-9 text-xs"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-9 font-medium text-[13px] mt-2.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zoom-dark-border" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="bg-zoom-dark-surface px-2.5 text-zoom-text-dim font-medium">or</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full h-9 flex items-center justify-center gap-1.5 text-[12px]"
            >
              <UserCheck className="h-3.5 w-3.5 text-zoom-text-muted" />
              Continue as Guest
            </Button>

            <p className="text-center text-[11px] text-zoom-text-muted pt-1">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-zoom-blue hover:text-zoom-blue-light transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
