"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Mic, MicOff, Video, VideoOff, MonitorUp, Users, MessageSquare, 
  MoreHorizontal, Shield, Info, Search, Loader2, UserMinus, UserCheck
} from "lucide-react";
import { Button } from "@/ui/Button";
import { Avatar } from "@/ui/Avatar";
import { Modal } from "@/ui/Modal";
import { Input } from "@/ui/Input";
import { meetingsService } from "@/services/api";
import { Meeting, Participant } from "@/types/meeting";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function MeetingRoom() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params?.meeting_id as string | undefined;

  const [meeting, setMeeting] = React.useState<Meeting | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [isMicOn, setIsMicOn] = React.useState(true);
  const [isVideoOn, setIsVideoOn] = React.useState(true);

  // Host Controls State
  const [localParticipants, setLocalParticipants] = React.useState<Participant[]>([]);
  const [currentHost, setCurrentHost] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState("");

  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = React.useState(false);
  
  const [isEndMeetingModalOpen, setIsEndMeetingModalOpen] = React.useState(false);
  const [isEndingMeeting, setIsEndingMeeting] = React.useState(false);
  
  const [isRemoveParticipantModalOpen, setIsRemoveParticipantModalOpen] = React.useState(false);
  const [participantToRemove, setParticipantToRemove] = React.useState<Participant | null>(null);
  const [isRemovingParticipant, setIsRemovingParticipant] = React.useState(false);

  const [isTransferHostModalOpen, setIsTransferHostModalOpen] = React.useState(false);
  const [participantToMakeHost, setParticipantToMakeHost] = React.useState<Participant | null>(null);

  React.useEffect(() => {
    async function fetchMeeting() {
      try {
        if (!meetingId) return;
        const data = await meetingsService.getMeeting(meetingId);
        setMeeting(data);
        setLocalParticipants(data.participants || []);
        setCurrentHost(data.host_name);
      } catch (err) {
        console.error("Fetch meeting error:", err);
        setError("Failed to connect to the meeting. It may not exist.");
        toast.error("Meeting not found");
      } finally {
        setLoading(false);
      }
    }
    fetchMeeting();
  }, [meetingId]);

  const copyInviteLink = () => {
    if (meeting?.invite_link) {
      navigator.clipboard.writeText(meeting.invite_link);
      toast.success("Invite link copied to clipboard");
    }
  };

  const handleLeave = () => {
    if (currentHost === meeting?.host_name) {
      setIsEndMeetingModalOpen(true);
    } else {
      router.push("/");
    }
  };

  const confirmEndMeeting = async () => {
    if (!meetingId) return;
    setIsEndingMeeting(true);
    try {
      await meetingsService.endMeeting(meetingId);
      toast.success("Meeting ended for everyone");
      router.push("/");
    } catch (err) {
      console.error("Failed to end meeting:", err);
      toast.error("Failed to end meeting");
      setIsEndingMeeting(false);
    }
  };

  const handleMuteAll = () => {
    toast.success("All participants muted");
  };

  const handleStopAllVideo = () => {
    toast.success("All cameras stopped");
  };

  const handleRemoveClick = (participant: Participant) => {
    setParticipantToRemove(participant);
    setIsRemoveParticipantModalOpen(true);
  };

  const confirmRemoveParticipant = async () => {
    if (participantToRemove) {
      setIsRemovingParticipant(true);
      // Simulate slight network delay for polish
      await new Promise(resolve => setTimeout(resolve, 400));
      setLocalParticipants(prev => prev.filter(p => p.id !== participantToRemove.id));
      toast.success(`Removed ${participantToRemove.name}`);
      setIsRemovingParticipant(false);
      setIsRemoveParticipantModalOpen(false);
      setParticipantToRemove(null);
    }
  };

  const handleMakeHostClick = (participant: Participant) => {
    setParticipantToMakeHost(participant);
    setIsTransferHostModalOpen(true);
  };

  const confirmTransferHost = () => {
    if (participantToMakeHost) {
      setCurrentHost(participantToMakeHost.name);
      toast.success(`${participantToMakeHost.name} is now the host`);
      setIsTransferHostModalOpen(false);
      setParticipantToMakeHost(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col bg-[#0d0d0d] text-white overflow-hidden">
        {/* Top Bar Skeleton */}
        <header className="flex h-12 shrink-0 items-center justify-between px-4 text-sm font-medium border-b border-white/5 animate-pulse">
          <div className="h-6 w-32 rounded bg-white/5"></div>
          <div className="h-8 w-32 rounded bg-white/5 hidden sm:block"></div>
          <div className="h-8 w-16 rounded bg-white/5"></div>
        </header>

        {/* Main Video Area Skeleton */}
        <main className="flex-1 flex items-center justify-center p-2 sm:p-4 md:p-8 relative">
          <div className="relative aspect-video w-full max-w-5xl max-h-[calc(100vh-140px)] overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/5 flex items-center justify-center animate-pulse">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-white/5"></div>
              <div className="h-4 w-24 rounded bg-white/5"></div>
            </div>
          </div>
        </main>

        {/* Bottom Controls Skeleton */}
        <footer className="flex h-16 sm:h-20 shrink-0 items-center justify-between px-2 sm:px-4 md:px-6 pb-2 animate-pulse">
          <div className="flex w-1/3 min-w-max items-center gap-2">
             <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/5"></div>
             <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/5"></div>
          </div>
          <div className="flex w-1/3 min-w-max items-center justify-center gap-2">
             <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/5"></div>
             <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/5"></div>
          </div>
          <div className="flex w-1/3 min-w-max items-center justify-end">
             <div className="h-8 w-20 rounded-lg bg-white/5"></div>
          </div>
        </footer>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.3 }}
        className="flex h-screen w-full flex-col items-center justify-center bg-[#0d0d0d] text-white gap-4 p-4 text-center"
      >
        <div className="rounded-full bg-white/5 p-6 text-gray-500 mb-2 border border-white/5">
          <VideoOff className="h-16 w-16" />
        </div>
        <h1 className="text-3xl font-semibold">Meeting not found</h1>
        <p className="text-gray-500 max-w-sm mb-4">
          This meeting may have ended, been deleted, or the link is invalid.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-md justify-center">
          <Button onClick={() => router.push("/")} className="w-full sm:w-auto px-6">
            Go to Dashboard
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push("/")} 
            className="w-full sm:w-auto px-6"
          >
            Join Another Meeting
          </Button>
        </div>
      </motion.div>
    );
  }

  const isCurrentUserHost = currentHost === meeting.host_name;
  const filteredParticipants = localParticipants.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-screen w-full flex-col bg-[#0d0d0d] text-white overflow-hidden">
      {/* Top Bar */}
      <header className="flex h-12 shrink-0 items-center justify-between px-4 text-sm font-medium border-b border-white/5 bg-[#0d0d0d]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-6 items-center gap-1 rounded-full bg-green-500/10 px-2.5 text-xs text-green-400 shrink-0 border border-green-500/10">
            <Shield className="h-3 w-3" />
            <span className="hidden sm:inline">Encrypted</span>
          </div>
          <span className="text-xs text-gray-500 truncate hidden xs:inline-block">
            Host: <span className="text-gray-300 font-medium">{meeting.host_name}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            onClick={copyInviteLink} 
            aria-label="Copy Invite Link"
          >
            <Info className="h-3.5 w-3.5 hidden sm:block" />
            <span className="font-mono">{meeting.meeting_id}</span>
          </button>
        </div>

        <div>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleLeave} 
            className="rounded-lg text-xs px-4"
            aria-label={isCurrentUserHost ? "End Meeting" : "Leave Meeting"}
          >
            {isCurrentUserHost ? "End" : "Leave"}
          </Button>
        </div>
      </header>

      {/* Main Video Area */}
      <main className="flex-1 flex items-center justify-center p-2 sm:p-4 md:p-8 relative focus-visible:outline-none" tabIndex={-1}>
        <div className="relative aspect-video w-full max-w-5xl max-h-[calc(100vh-140px)] overflow-hidden rounded-2xl bg-[#1a1a1a] shadow-2xl ring-1 ring-white/5 flex items-center justify-center transition-all">
          {isVideoOn ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#1a1a1a] to-[#111]">
              {/* Simulate camera view */}
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-2xl bg-white/5">
                  <Video className="w-12 h-12 text-gray-600" />
                </div>
                <p className="text-gray-600 text-sm">Camera Feed</p>
              </div>
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-[#1a1a1a] to-[#111]">
              <Avatar fallback={meeting.host_name.substring(0, 2).toUpperCase()} size="lg" className="h-24 w-24 text-2xl bg-zoom-blue/20 text-zoom-blue-light border-2 border-zoom-blue/20" />
              <p className="text-gray-500 text-sm mt-3">{meeting.host_name}</p>
            </div>
          )}

          <div className="absolute bottom-4 left-4 rounded-lg bg-black/50 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-xl flex items-center gap-2 border border-white/5">
            {meeting.host_name} 
            {isCurrentUserHost ? (
              <span className="bg-zoom-blue/20 text-zoom-blue-light text-[10px] uppercase px-1.5 py-0.5 rounded font-bold tracking-wider">Host, You</span>
            ) : (
              <span className="bg-white/10 text-gray-400 text-[10px] uppercase px-1.5 py-0.5 rounded font-bold tracking-wider">You</span>
            )}
          </div>

          {!isMicOn && (
            <div className="absolute top-4 right-4 rounded-full bg-zoom-red p-1.5 text-white shadow-lg" aria-label="Microphone muted">
              <MicOff className="h-4 w-4" />
            </div>
          )}
        </div>
      </main>

      {/* Bottom Controls */}
      <footer className="flex h-16 sm:h-20 shrink-0 items-center justify-between px-2 sm:px-4 md:px-6 pb-2 overflow-x-auto no-scrollbar bg-[#0d0d0d]/80 backdrop-blur-xl" aria-label="Meeting Controls">
        <div className="flex w-1/3 min-w-max items-center gap-1 md:gap-2">
          <ControlItem
            icon={isMicOn ? Mic : MicOff}
            label={isMicOn ? "Mute" : "Unmute"}
            onClick={() => setIsMicOn(!isMicOn)}
            isActive={!isMicOn}
            ariaLabel={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
          />
          <ControlItem
            icon={isVideoOn ? Video : VideoOff}
            label={isVideoOn ? "Stop Video" : "Start Video"}
            onClick={() => setIsVideoOn(!isVideoOn)}
            isActive={!isVideoOn}
            ariaLabel={isVideoOn ? "Stop Video" : "Start Video"}
          />
        </div>

        <div className="flex w-1/3 min-w-max items-center justify-center gap-1 md:gap-2">
          <ControlItem 
            icon={Users} 
            label="Participants" 
            badge={localParticipants.length + 1} 
            onClick={() => setIsParticipantsModalOpen(true)}
            ariaLabel="Manage Participants"
          />
          <ControlItem icon={MessageSquare} label="Chat" ariaLabel="Open Chat" />
          <ControlItem
            icon={MonitorUp}
            label="Share"
            className="hidden sm:flex"
            ariaLabel="Share Screen"
          />
          <ControlItem icon={MoreHorizontal} label="More" className="sm:hidden" ariaLabel="More Options" />
        </div>

        <div className="flex w-1/3 min-w-max items-center justify-end pl-2">
          <Button 
            variant="destructive" 
            onClick={handleLeave} 
            size="sm" 
            className="rounded-lg text-xs px-4"
            aria-label={isCurrentUserHost ? "End Meeting" : "Leave Meeting"}
          >
            {isCurrentUserHost ? "End" : "Leave"}
          </Button>
        </div>
      </footer>

      {/* End Meeting Modal */}
      <Modal 
        isOpen={isEndMeetingModalOpen} 
        onClose={() => !isEndingMeeting && setIsEndMeetingModalOpen(false)}
        title="End Meeting"
      >
        <div className="flex flex-col gap-4 mt-2">
          <p className="text-zoom-text-muted">Are you sure you want to end this meeting for everyone?</p>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button 
              variant="destructive" 
              onClick={confirmEndMeeting} 
              className="w-full relative" 
              disabled={isEndingMeeting}
              aria-label="Confirm End Meeting for Everyone"
            >
              {isEndingMeeting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ending...
                </>
              ) : (
                "End for Everyone"
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsEndMeetingModalOpen(false)} 
              className="w-full" 
              disabled={isEndingMeeting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Manage Participants Modal */}
      <Modal 
        isOpen={isParticipantsModalOpen} 
        onClose={() => setIsParticipantsModalOpen(false)}
        title={`Participants (${localParticipants.length + 1})`}
      >
        <div className="flex flex-col h-auto max-h-[70vh] sm:max-h-[500px]">
          <div className="mt-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zoom-text-dim" />
            <Input 
              placeholder="Search participants..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
              aria-label="Search participants"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-2 min-h-[200px] no-scrollbar">
            {/* Self - Only show if matches search */}
            {(meeting.host_name.toLowerCase().includes(searchQuery.toLowerCase())) && (
              <div className="flex items-center justify-between group py-2 px-3 rounded-xl hover:bg-zoom-dark-hover transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar fallback={meeting.host_name.substring(0,2).toUpperCase()} className="h-9 w-9 sm:h-10 sm:w-10 bg-zoom-blue text-white text-xs sm:text-sm font-medium" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-zoom-text flex items-center gap-2">
                      {meeting.host_name} 
                      {isCurrentUserHost ? (
                        <span className="bg-zoom-blue/15 text-zoom-blue-light text-[9px] uppercase px-1.5 py-0.5 rounded font-bold tracking-wider">Host, You</span>
                      ) : (
                        <span className="bg-white/10 text-gray-400 text-[9px] uppercase px-1.5 py-0.5 rounded font-bold tracking-wider">You</span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 text-zoom-text-dim">
                   <Mic className="h-4 w-4" />
                   <Video className="h-4 w-4" />
                </div>
              </div>
            )}
            
            {/* Other Participants */}
            {filteredParticipants.map((p) => (
              <div key={p.id} className="flex items-center justify-between group py-2 px-3 rounded-xl hover:bg-zoom-dark-hover transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar fallback={p.name.substring(0,2).toUpperCase()} className="h-9 w-9 sm:h-10 sm:w-10 bg-zoom-dark-elevated text-zoom-text-muted text-xs sm:text-sm font-medium border border-zoom-dark-border" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-zoom-text flex items-center gap-2">
                      {p.name} 
                      {currentHost === p.name && (
                        <span className="bg-zoom-blue/15 text-zoom-blue-light text-[9px] uppercase px-1.5 py-0.5 rounded font-bold tracking-wider">Host</span>
                      )}
                    </span>
                  </div>
                </div>
                
                {isCurrentUserHost && currentHost !== p.name && (
                  <div className="flex items-center gap-1">
                    <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         className="h-7 px-2 text-[11px] text-zoom-blue hover:text-zoom-blue-light hover:bg-zoom-blue/10" 
                         onClick={() => handleMakeHostClick(p)}
                         aria-label={`Make ${p.name} host`}
                       >
                         Host
                       </Button>
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         className="h-7 px-2 text-[11px] text-zoom-red hover:text-red-400 hover:bg-zoom-red/10" 
                         onClick={() => handleRemoveClick(p)}
                         aria-label={`Remove ${p.name}`}
                       >
                         Remove
                       </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredParticipants.length === 0 && !(meeting.host_name.toLowerCase().includes(searchQuery.toLowerCase())) && (
              <div className="flex flex-col items-center justify-center py-8 text-zoom-text-dim">
                <Users className="h-10 w-10 mb-2 opacity-20" />
                <p className="text-sm">No participants found</p>
              </div>
            )}
          </div>
          
          {/* Host Controls */}
          {isCurrentUserHost && (
            <div className="mt-4 pt-4 border-t border-zoom-dark-border flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={handleMuteAll}
                disabled={localParticipants.length === 0}
                aria-label="Mute All Participants"
              >
                Mute All
              </Button>
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={handleStopAllVideo}
                disabled={localParticipants.length === 0}
                aria-label="Stop All Video"
              >
                Stop All Video
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* Transfer Host Modal */}
      <Modal 
        isOpen={isTransferHostModalOpen} 
        onClose={() => setIsTransferHostModalOpen(false)}
        title="Change Host"
      >
        <div className="flex flex-col gap-4 mt-2">
          <p className="text-zoom-text-muted">
            Do you want to change the host to <span className="font-semibold text-zoom-text">{participantToMakeHost?.name}</span>?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button onClick={confirmTransferHost} className="w-full">
              <UserCheck className="mr-2 h-4 w-4" />
              Change Host
            </Button>
            <Button variant="outline" onClick={() => setIsTransferHostModalOpen(false)} className="w-full">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Remove Participant Modal */}
      <Modal 
        isOpen={isRemoveParticipantModalOpen} 
        onClose={() => !isRemovingParticipant && setIsRemoveParticipantModalOpen(false)}
        title="Remove Participant"
      >
        <div className="flex flex-col gap-4 mt-2">
          <p className="text-zoom-text-muted">
            Are you sure you want to remove <span className="font-semibold text-zoom-text">{participantToRemove?.name}</span> from this meeting?
          </p>
          <p className="text-sm text-zoom-text-dim">
            They will not be able to rejoin unless you allow them.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button 
              variant="destructive" 
              onClick={confirmRemoveParticipant} 
              className="w-full" 
              disabled={isRemovingParticipant}
            >
              {isRemovingParticipant ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <UserMinus className="mr-2 h-4 w-4" />
                  Remove
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsRemoveParticipantModalOpen(false)} 
              className="w-full" 
              disabled={isRemovingParticipant}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

interface ControlItemProps {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
  badge?: number;
  ariaLabel?: string;
}

function ControlItem({ icon: Icon, label, onClick, className, isActive, badge, ariaLabel }: ControlItemProps) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel || label}
      className={cn(
        "group relative flex flex-col items-center justify-center gap-1 rounded-lg p-1 min-w-[52px] sm:min-w-[60px] transition-colors duration-150 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zoom-blue cursor-pointer",
        isActive ? "text-zoom-red" : "text-gray-400 hover:text-gray-200",
        className
      )}
      title={label}
    >
      <div className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150",
        isActive ? "bg-zoom-red/15" : "bg-white/5 group-hover:bg-white/10"
      )}>
        <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={1.5} />
      </div>
      <span className="text-[9px] font-normal hidden sm:block tracking-wide">{label}</span>
      {badge !== undefined && (
        <span className="absolute top-0.5 right-1 sm:right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-zoom-blue text-[8px] font-bold text-white leading-none">
          {badge}
        </span>
      )}
    </button>
  );
}
