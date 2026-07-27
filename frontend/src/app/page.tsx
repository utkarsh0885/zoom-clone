"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Video, Calendar, PlusSquare, Loader2, CalendarX2, History, CheckCircle2, MonitorUp } from "lucide-react";
import { SectionHeader } from "@/ui/SectionHeader";
import { Modal } from "@/ui/Modal";
import { Input } from "@/ui/Input";
import { Button } from "@/ui/Button";
import { meetingsService } from "@/services/api";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Meeting } from "@/types/meeting";
import { MeetingCard } from "@/ui/MeetingCard";
import { Skeleton, SkeletonHero, SkeletonActionTile, SkeletonMeetingCard } from "@/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useAuth } from "@/context/AuthContext";
import { DashboardLayout } from "@/layout/Navbar";
import { getInviteLink } from "@/lib/utils";

const joinSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  meetingUrlOrId: z.string().min(1, "Meeting ID is required").trim(),
});

const scheduleSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  description: z.string().optional(),
  date: z.date().refine((date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }, "Date cannot be in the past"),
  time: z.string().min(1, "Time is required"),
  duration: z.string().min(1, "Duration is required"),
});

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [time, setTime] = React.useState<Date | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = React.useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = React.useState(false);
  
  const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState(false);
  const [createdMeeting, setCreatedMeeting] = React.useState<Meeting | null>(null);
  
  const [upcomingMeetings, setUpcomingMeetings] = React.useState<Meeting[]>([]);
  const [isLoadingMeetings, setIsLoadingMeetings] = React.useState(true);
  
  const [recentMeetings, setRecentMeetings] = React.useState<Meeting[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = React.useState(true);

  const { 
    register: registerJoin, 
    handleSubmit: handleJoinSubmitForm, 
    formState: { errors: joinErrors, isSubmitting: isJoinSubmitting }, 
    reset: resetJoin 
  } = useForm<z.infer<typeof joinSchema>>({
    resolver: zodResolver(joinSchema),
    defaultValues: { name: "Guest User", meetingUrlOrId: "" }
  });

  const {
    register: registerSchedule,
    handleSubmit: handleScheduleSubmitForm,
    formState: { errors: scheduleErrors, isSubmitting: isScheduleSubmitting },
    reset: resetSchedule,
    setValue,
    watch,
  } = useForm<z.infer<typeof scheduleSchema>>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { title: "My Meeting", duration: "30" }
  });

  const selectedDate = watch("date");

  const fetchUpcoming = async () => {
    try {
      setIsLoadingMeetings(true);
      const data = await meetingsService.getUpcomingMeetings();
      setUpcomingMeetings(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Fetch upcoming error:", e);
      setUpcomingMeetings([]);
    } finally {
      setIsLoadingMeetings(false);
    }
  };

  const fetchRecent = async () => {
    try {
      setIsLoadingRecent(true);
      const data = await meetingsService.getRecentMeetings();
      setRecentMeetings(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Fetch recent error:", e);
      setRecentMeetings([]);
    } finally {
      setIsLoadingRecent(false);
    }
  };

  React.useEffect(() => {
    fetchUpcoming();
    fetchRecent();
  }, [user]);

  React.useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (user) {
      resetJoin({ name: user.full_name, meetingUrlOrId: "" });
    } else {
      resetJoin({ name: "Guest User", meetingUrlOrId: "" });
    }
  }, [user, resetJoin]);

  const handleNewMeeting = async () => {
    try {
      setIsCreating(true);
      const meeting = await meetingsService.createInstantMeeting();
      toast.success("Meeting created!");
      if (typeof window !== "undefined") {
        localStorage.setItem(`host_of_${meeting.meeting_id}`, "true");
        localStorage.setItem(`meeting_display_name_${meeting.meeting_id}`, meeting.host_name);
      }
      setCreatedMeeting(meeting);
      setIsSuccessModalOpen(true);
    } catch (error) { console.error(error);
      toast.error("Failed to create meeting");
    } finally {
      setIsCreating(false);
    }
  };

  const extractMeetingId = (input: string) => {
    if (!input.startsWith('http://') && !input.startsWith('https://')) {
      return input;
    }
    try {
      const url = new URL(input);
      const parts = url.pathname.split('/');
      return parts[parts.length - 1];
    } catch (e) {
      console.error(e);
      return input;
    }
  };

  const handleJoinSubmit = async (data: z.infer<typeof joinSchema>) => {
    try {
      const meetingId = extractMeetingId(data.meetingUrlOrId);
      await meetingsService.joinMeeting(meetingId, data.name);
      toast.success("Joining meeting...");
      setIsJoinModalOpen(false);
      resetJoin();
      router.push(`/meeting/${meetingId}`);
    } catch (error) { console.error(error);
      toast.error("Meeting not found or invalid ID");
    }
  };

  const handleScheduleSubmit = async (data: z.infer<typeof scheduleSchema>) => {
    try {
      const [hours, minutes] = data.time.split(':');
      const scheduledDate = new Date(data.date);
      scheduledDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      
      const meeting = await meetingsService.scheduleMeeting({
        title: data.title,
        description: data.description,
        host_name: user ? user.full_name : "Guest User",
        duration: parseInt(data.duration, 10),
        scheduled_for: scheduledDate.toISOString(),
      });
      
      toast.success("Meeting scheduled successfully");
      if (typeof window !== "undefined") {
        localStorage.setItem(`host_of_${meeting.meeting_id}`, "true");
        localStorage.setItem(`meeting_display_name_${meeting.meeting_id}`, meeting.host_name);
      }
      setIsScheduleModalOpen(false);
      resetSchedule();
      fetchUpcoming(); 
      setCreatedMeeting(meeting);
      setIsSuccessModalOpen(true);
      
      // Smooth scroll to upcoming meetings
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (error) { console.error(error);
      console.error("Schedule meeting error:", error);
      toast.error("Failed to schedule meeting");
    }
  };

  const currentTime = time?.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
    hour12: true,
  }) || "--:--";

  const currentDate = time?.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }) || "Loading date...";



  return (
    <DashboardLayout>
      <div className="max-w-[680px] mx-auto px-4 md:px-6 pt-8 md:pt-12 pb-8 space-y-6">
        
        {/* ── Clock — bare centered text like Zoom ── */}
        {time === null ? (
          <SkeletonHero />
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="text-center py-4"
          >
            <h1 className="text-[44px] md:text-[52px] font-semibold tracking-tight text-zoom-text tabular-nums leading-none" suppressHydrationWarning>
              {currentTime}
            </h1>
            <p className="text-[13px] text-zoom-text-muted mt-2 font-normal" suppressHydrationWarning>{currentDate}</p>
          </motion.div>
        )}

        {/* ── Action Buttons — Zoom circle row ── */}
        {time === null ? (
          <div className="flex items-center justify-center gap-6 sm:gap-8">
            <SkeletonActionTile />
            <SkeletonActionTile />
            <SkeletonActionTile />
            <SkeletonActionTile />
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="flex items-center justify-center gap-6 sm:gap-8"
          >
            <ActionTile
              icon={isCreating ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Video className="w-5 h-5 text-white" strokeWidth={2} />}
              title="New meeting"
              color="bg-zoom-orange"
              onClick={handleNewMeeting}
              disabled={isCreating}
            />
            <ActionTile
              icon={<PlusSquare className="w-5 h-5 text-white" strokeWidth={2} />}
              title="Join"
              color="bg-zoom-blue"
              onClick={() => setIsJoinModalOpen(true)}
            />
            <ActionTile
              icon={<Calendar className="w-5 h-5 text-white" strokeWidth={2} />}
              title="Schedule"
              color="bg-zoom-purple"
              onClick={() => setIsScheduleModalOpen(true)}
            />
            <ActionTile
              icon={<MonitorUp className="w-5 h-5 text-white" strokeWidth={2} />}
              title="Share screen"
              color="bg-zoom-green"
              onClick={() => toast.info("Screen sharing is available in a meeting")}
            />
          </motion.div>
        )}

        {/* ── Upcoming Meetings ── */}
        <section id="meetings">
          <SectionHeader title="Upcoming Meetings" />
          
          {isLoadingMeetings ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <motion.div key={`skel-up-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <SkeletonMeetingCard />
                </motion.div>
              ))}
            </div>
          ) : upcomingMeetings.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <CalendarX2 className="w-12 h-12 text-zoom-text-dim mb-3" strokeWidth={1} />
              <p className="text-[13px] text-zoom-text-muted">No meetings scheduled.</p>
              <button onClick={() => setIsScheduleModalOpen(true)} className="text-[13px] text-zoom-blue hover:text-zoom-blue-light mt-1.5 font-medium cursor-pointer transition-colors">+ Schedule a meeting</button>
            </motion.div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {upcomingMeetings.map((meeting) => (
                  <motion.div 
                    key={meeting.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    layout
                  >
                    <MeetingCard meeting={meeting} onRefresh={() => { fetchUpcoming(); fetchRecent(); }} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* ── Recent Meetings ── */}
        <section>
          <SectionHeader title="Recent Meetings" />
          
          {isLoadingRecent ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <motion.div key={`skel-rec-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <SkeletonMeetingCard />
                </motion.div>
              ))}
            </div>
          ) : recentMeetings.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <History className="w-12 h-12 text-zoom-text-dim mb-3" strokeWidth={1} />
              <p className="text-[13px] text-zoom-text-muted">No recent meetings.</p>
            </motion.div>
          ) : (
            <div className="space-y-2 pb-8">
              <AnimatePresence>
                {recentMeetings.map((meeting) => (
                  <motion.div 
                    key={meeting.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    layout
                  >
                    <MeetingCard meeting={meeting} isRecent onRefresh={() => { fetchUpcoming(); fetchRecent(); }} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Join Modal */}
        <Modal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} title="Join Meeting" description="Enter the meeting ID or personal link name">
          {isJoinSubmitting && (
            <div className="space-y-4 mt-4" aria-hidden="true">
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <Skeleton className="h-10 w-full sm:w-20" />
                <Skeleton className="h-10 w-full sm:w-20" />
              </div>
            </div>
          )}
          <form onSubmit={handleJoinSubmitForm(handleJoinSubmit)} className={`space-y-4 mt-4 ${isJoinSubmitting ? 'hidden' : 'block'}`}>
            <div>
              <label className="text-sm font-medium text-zoom-text-muted block mb-1.5">Meeting ID or Link</label>
              <Input {...registerJoin("meetingUrlOrId")} placeholder="e.g. 123-456-789 or https://..." />
              {joinErrors.meetingUrlOrId && <p className="text-sm text-zoom-red mt-1">{joinErrors.meetingUrlOrId.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-zoom-text-muted block mb-1.5">Your Name</label>
              <Input {...registerJoin("name")} placeholder="Enter your display name" />
              {joinErrors.name && <p className="text-sm text-zoom-red mt-1">{joinErrors.name.message}</p>}
            </div>
            <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-zoom-dark-border">
              <Button type="button" variant="ghost" onClick={() => setIsJoinModalOpen(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button type="submit" disabled={isJoinSubmitting} className="w-full sm:w-auto">
                {isJoinSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Join
              </Button>
            </div>
          </form>
        </Modal>

        {/* Schedule Modal */}
        <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} title="Schedule Meeting" description="Set up a new Zoom meeting" className="max-w-2xl">
          {isScheduleSubmitting && (
            <div className="space-y-4 mt-4" aria-hidden="true">
              <div>
                <Skeleton className="h-4 w-12 mb-1" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Skeleton className="h-4 w-10 mb-1" />
                  <Skeleton className="h-[300px] w-full rounded-xl" />
                </div>
                <div className="space-y-4">
                  <div>
                    <Skeleton className="h-4 w-12 mb-1" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>
              <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t mt-4 border-zoom-dark-border">
                <Skeleton className="h-10 w-full sm:w-20" />
                <Skeleton className="h-10 w-full sm:w-20" />
              </div>
            </div>
          )}
          <form onSubmit={handleScheduleSubmitForm(handleScheduleSubmit)} className={`space-y-5 mt-4 ${isScheduleSubmitting ? 'hidden' : 'block'}`}>
            <div>
              <label className="text-sm font-medium text-zoom-text-muted block mb-1.5">Topic</label>
              <Input {...registerSchedule("title")} placeholder="My Meeting" />
              {scheduleErrors.title && <p className="text-sm text-zoom-red mt-1">{scheduleErrors.title.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-zoom-text-muted block mb-1.5">Description (Optional)</label>
              <Input {...registerSchedule("description")} placeholder="Agenda, notes, etc." />
            </div>
            
            {/* Two-column: Calendar | Time + Duration */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-6">
              {/* Left: Calendar */}
              <div>
                <label className="text-sm font-medium text-zoom-text-muted block mb-1.5">Date</label>
                <div className="border border-zoom-dark-border rounded-xl p-3 bg-zoom-dark-elevated">
                  <DayPicker 
                    mode="single" 
                    selected={selectedDate} 
                    onSelect={(date) => setValue("date", date as Date)}
                    disabled={{ before: new Date() }}
                  />
                </div>
                {scheduleErrors.date && <p className="text-sm text-zoom-red mt-1">{scheduleErrors.date.message}</p>}
              </div>
              
              {/* Right: Time + Duration */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-zoom-text-muted block mb-1.5">Time</label>
                  <Input type="time" {...registerSchedule("time")} className="w-full block" />
                  {scheduleErrors.time && <p className="text-sm text-zoom-red mt-1">{scheduleErrors.time.message}</p>}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-zoom-text-muted block mb-1.5">Duration</label>
                  <select 
                    {...registerSchedule("duration")} 
                    className="flex h-10 w-full rounded-zoom-btn border border-zoom-dark-border bg-zoom-dark-elevated px-3 py-2 text-sm text-zoom-text focus:outline-none focus:ring-2 focus:ring-zoom-blue disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                  >
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="45">45 Minutes</option>
                    <option value="60">1 Hour</option>
                    <option value="90">1 Hour 30 Minutes</option>
                    <option value="120">2 Hours</option>
                  </select>
                  {scheduleErrors.duration && <p className="text-sm text-zoom-red mt-1">{scheduleErrors.duration.message}</p>}
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-zoom-dark-border">
              <Button type="button" variant="ghost" onClick={() => setIsScheduleModalOpen(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button type="submit" disabled={isScheduleSubmitting} className="w-full sm:w-auto">
                {isScheduleSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save
              </Button>
            </div>
          </form>
        </Modal>

        {/* Success Modal */}
        <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)}>
          {createdMeeting && (
            <div className="flex flex-col items-center text-center">
              <div className="bg-green-500/10 p-4 rounded-full mb-4 border border-green-500/20">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-semibold text-zoom-text mb-6">Meeting Scheduled Successfully</h2>
              
              <div className="bg-zoom-dark-elevated rounded-lg p-5 w-full text-left space-y-3 border border-zoom-dark-border">
                <div className="flex justify-between items-center text-sm gap-2">
                  <span className="text-zoom-text-muted font-medium shrink-0">Topic</span>
                  <span className="text-zoom-text font-medium line-clamp-2 text-right break-words">{createdMeeting.title}</span>
                </div>
                <div className="flex justify-between items-center text-sm gap-2">
                  <span className="text-zoom-text-muted font-medium shrink-0">Host</span>
                  <span className="text-zoom-text font-medium truncate">{createdMeeting.host_name}</span>
                </div>
                <div className="flex justify-between items-start sm:items-center text-sm flex-col sm:flex-row gap-1 sm:gap-2">
                  <span className="text-zoom-text-muted font-medium shrink-0">Date & Time</span>
                  <span className="text-zoom-text font-medium text-left sm:text-right">
                    {new Date(createdMeeting.scheduled_for || createdMeeting.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(createdMeeting.scheduled_for || createdMeeting.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {createdMeeting.duration && (
                  <div className="flex justify-between items-center text-sm gap-2">
                    <span className="text-zoom-text-muted font-medium shrink-0">Duration</span>
                    <span className="text-zoom-text font-medium">{createdMeeting.duration} Minutes</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm gap-2">
                  <span className="text-zoom-text-muted font-medium shrink-0">Meeting ID</span>
                  <span className="text-zoom-text font-mono font-medium truncate">{createdMeeting.meeting_id}</span>
                </div>
                <div className="flex justify-between items-center text-sm overflow-hidden gap-2">
                  <span className="text-zoom-text-muted font-medium shrink-0">Invite Link</span>
                  <span className="text-zoom-blue text-xs font-mono truncate" title={getInviteLink(createdMeeting.meeting_id)}>
                    {getInviteLink(createdMeeting.meeting_id)}
                  </span>
                </div>
              </div>

              <div className="w-full flex flex-col gap-3 pt-6 mt-2">
                <Button 
                  className="w-full" 
                  onClick={() => {
                    setIsSuccessModalOpen(false);
                    router.push(`/meeting/${createdMeeting.meeting_id}`);
                  }}
                >
                  Join Meeting
                </Button>
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <div className="flex gap-2 w-full">
                    <Button 
                      type="button"
                      variant="outline" 
                      className="flex-1 px-2"
                      onClick={() => {
                        navigator.clipboard.writeText(createdMeeting.meeting_id);
                        toast.success("Meeting ID copied to clipboard");
                      }}
                    >
                      Copy ID
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      className="flex-1 px-2"
                      onClick={() => {
                        navigator.clipboard.writeText(getInviteLink(createdMeeting.meeting_id));
                        toast.success("Invite Link copied to clipboard");
                      }}
                    >
                      Copy Link
                    </Button>
                  </div>
                  <Button 
                    type="button"
                    variant="ghost" 
                    className="w-full sm:w-auto px-6 shrink-0" 
                    onClick={() => setIsSuccessModalOpen(false)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>

      </div>
    </DashboardLayout>
  );
}

interface ActionTileProps { icon: React.ReactNode; title: string; color: string; onClick: () => void; disabled?: boolean; }
function ActionTile({ icon, title, color, onClick, disabled }: ActionTileProps) {
  return (
    <button
      className={`group flex flex-col items-center justify-center gap-2 cursor-pointer ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center transition-transform duration-150 group-hover:scale-105`}>
        {icon}
      </div>
      <span className="text-[11px] font-normal text-zoom-text-muted">{title}</span>
    </button>
  );
}
