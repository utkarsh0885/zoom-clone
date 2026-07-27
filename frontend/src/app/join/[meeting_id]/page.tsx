"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Video, VideoOff, Shield } from "lucide-react";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { meetingsService } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Meeting } from "@/types/meeting";

export default function JoinMeetingPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  const meetingId = params?.meeting_id as string | undefined;
  
  const [meeting, setMeeting] = React.useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  const [name, setName] = React.useState("");
  const [isJoining, setIsJoining] = React.useState(false);
  const [nameError, setNameError] = React.useState<string | null>(null);

  // Set default guest name once auth loading is finished
  React.useEffect(() => {
    if (!authLoading) {
      if (user) {
        setName(user.full_name);
      } else {
        setName("Guest User");
      }
    }
  }, [user, authLoading]);

  // Fetch meeting information and automatically join if user is logged in
  React.useEffect(() => {
    async function checkMeeting() {
      if (!meetingId) return;
      try {
        setIsLoading(true);
        setError(null);
        const data = await meetingsService.getMeeting(meetingId);
        setMeeting(data);
        
        // Auto-join if user is authenticated and name is determined
        if (user) {
          const guestName = user.full_name;
          await meetingsService.joinMeeting(meetingId, guestName);
          localStorage.setItem(`meeting_display_name_${meetingId}`, guestName);
          router.replace(`/meeting/${meetingId}`);
        }
      } catch (err) {
        console.error("Join page check meeting error:", err);
        setError("Failed to connect to the meeting. It may not exist or has ended.");
      } finally {
        setIsLoading(false);
      }
    }
    
    if (meetingId && !authLoading) {
      checkMeeting();
    }
  }, [meetingId, user, authLoading, router]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(null);

    if (!name.trim()) {
      setNameError("Name is required to join");
      return;
    }
    if (name.trim().length < 2) {
      setNameError("Name must be at least 2 characters");
      return;
    }
    if (!meetingId) return;

    setIsJoining(true);
    try {
      await meetingsService.joinMeeting(meetingId, name.trim());
      localStorage.setItem(`meeting_display_name_${meetingId}`, name.trim());
      toast.success("Joining meeting...");
      router.replace(`/meeting/${meetingId}`);
    } catch (err) {
      console.error("Join meeting error:", err);
      toast.error("Failed to join meeting");
      setIsJoining(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0d0d0d] text-white">
        <Loader2 className="w-10 h-10 animate-spin text-zoom-blue" />
        <p className="text-gray-500 text-sm mt-4 font-medium">Checking meeting details...</p>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0d0d0d] text-white">
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center flex flex-col items-center gap-4 bg-[#1a1a1a] border border-white/5 p-8 rounded-2xl shadow-2xl"
        >
          <div className="rounded-full bg-zoom-red/10 p-6 text-zoom-red border border-zoom-red/10 mb-2">
            <VideoOff className="h-12 w-12" />
          </div>
          <h1 className="text-2xl font-bold">Meeting Not Found</h1>
          <p className="text-gray-500 text-sm max-w-xs">
            {error || "This meeting may have ended, been deleted, or the invitation link is invalid."}
          </p>
          <Button onClick={() => router.push("/")} className="w-full mt-4 h-10">
            Go to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0d0d0d] relative overflow-hidden text-white">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 -left-32 w-80 h-80 bg-zoom-blue/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-zoom-purple/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-zoom-blue flex items-center justify-center shadow-md shadow-zoom-blue/20 mb-3 animate-pulse">
            <Video className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-semibold text-white">Join Zoom Meeting</h1>
          <p className="text-[12px] text-gray-500 mt-1 font-mono">
            ID: {meetingId}
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-[#1a1a1a] border border-white/5 p-6 shadow-xl shadow-black/20">
          <div className="space-y-4">
            {/* Meeting metadata summary */}
            <div className="p-4 rounded-xl bg-[#0d0d0d] border border-white/5 text-sm space-y-2.5">
              <div className="flex justify-between items-start gap-2">
                <span className="text-gray-500 text-xs font-medium shrink-0">Topic</span>
                <span className="text-white font-semibold line-clamp-2 text-right">{meeting.title}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-gray-500 text-xs font-medium shrink-0">Host</span>
                <span className="text-white font-medium truncate">{meeting.host_name}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-gray-500 text-xs font-medium shrink-0">Security</span>
                <span className="text-green-400 text-xs font-medium flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  Encrypted
                </span>
              </div>
            </div>

            <form onSubmit={handleJoin} className="space-y-4">
              {nameError && (
                <div className="p-2.5 text-xs text-red-400 bg-zoom-red/10 rounded border border-zoom-red/20">
                  {nameError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1.5" htmlFor="display-name">
                  Enter your display name
                </label>
                <Input
                  id="display-name"
                  type="text"
                  placeholder="e.g. Alice Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isJoining}
                  className="w-full h-10 text-xs"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isJoining}
                className="w-full h-10 font-semibold text-[13px] mt-2"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Joining Meeting Room...
                  </>
                ) : (
                  "Join Meeting"
                )}
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-[11px]">
                <span className="bg-[#1a1a1a] px-2.5 text-gray-500 font-medium">or</span>
              </div>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-xs text-zoom-blue hover:text-zoom-blue-light transition-colors font-medium cursor-pointer"
              >
                Sign in with your Zoom account
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
