"use client";

import * as React from "react";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { toast } from "sonner";
import { Copy, Play, Trash2, Clock, User, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { meetingsService } from "@/services/api";
import { Skeleton } from "./Skeleton";

import { Meeting } from "@/types/meeting";
import { getInviteLink } from "@/lib/utils";

interface MeetingCardProps {
  meeting: Meeting;
  isRecent?: boolean;
  onRefresh?: () => void;
}

export function MeetingCard({ meeting, isRecent = false, onRefresh }: MeetingCardProps) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
  
  const handleCopyLink = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(getInviteLink(meeting.meeting_id));
    toast.success("Meeting link copied to clipboard");
  };

  const handleCopyId = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(meeting.meeting_id);
    toast.success("Meeting ID copied to clipboard");
  };

  const handleStart = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    router.push(`/meeting/${meeting.meeting_id}`);
  };

  const handleCardClick = () => {
    setIsDetailsModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await meetingsService.deleteMeeting(meeting.meeting_id);
      toast.success("Meeting deleted successfully");
      setIsDeleteModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete meeting");
    } finally {
      setIsDeleting(false);
    }
  };

  const displayDate = meeting.scheduled_for ? new Date(meeting.scheduled_for) : new Date(meeting.start_time);
  
  const formattedDate = displayDate.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
  
  const formattedTime = displayDate.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <>
      <div 
        className="group flex items-center gap-3 p-3 rounded-lg border border-zoom-dark-border bg-zoom-dark-surface hover:bg-zoom-dark-hover transition-colors duration-150 cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Date badge */}
        <div className="hidden sm:flex flex-col items-center justify-center w-11 h-11 rounded bg-zoom-dark-elevated border border-zoom-dark-border shrink-0">
          <span className="text-[9px] font-semibold text-zoom-blue uppercase leading-none">
            {displayDate.toLocaleDateString('en-US', { month: 'short' })}
          </span>
          <span className="text-[15px] font-bold text-zoom-text leading-tight mt-0.5">
            {displayDate.getDate()}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="text-[13px] font-medium text-zoom-text truncate">{meeting.title}</h4>
            <Badge 
              variant={meeting.status === "SCHEDULED" ? "default" : meeting.status === "ENDED" ? "secondary" : "success"} 
              className="text-[9px] px-1 py-0 shrink-0"
            >
              {meeting.status}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-zoom-text-muted">
            <span className="flex items-center gap-1" suppressHydrationWarning>
              <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
              {formattedTime}
              {meeting.duration ? ` · ${meeting.duration}m` : ''}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" strokeWidth={1.5} />
              {meeting.host_name}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-zoom-text-muted hover:text-zoom-blue" 
            onClick={handleCopyLink} 
            title="Copy Invite Link"
          >
            <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Button>
          {!isRecent && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-zoom-text-muted hover:text-zoom-red" 
              onClick={handleDeleteClick} 
              title="Delete Meeting"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Button>
          )}
          <Button 
            size="sm" 
            onClick={handleStart} 
            className="h-7 px-3 text-[11px] ml-1"
            variant={isRecent ? "secondary" : "default"}
          >
            {!isRecent && <Play className="h-3 w-3 fill-current mr-1" />}
            {isRecent ? "Rejoin" : "Start"}
          </Button>
        </div>
      </div>

      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Delete Meeting" 
        description={`Are you sure you want to delete "${meeting.title}"? This action cannot be undone.`}
      >
        <div className="mt-5 flex flex-col-reverse sm:flex-row justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting} className="w-full sm:w-auto h-8 text-[12px]">Cancel</Button>
          <Button variant="destructive" size="sm" className="w-full sm:w-auto h-8 text-[12px]" onClick={confirmDelete} disabled={isDeleting}>
            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Delete"}
          </Button>
        </div>
      </Modal>

      <Modal 
        isOpen={isDetailsModalOpen} 
        onClose={() => setIsDetailsModalOpen(false)} 
        title="Meeting Details"
      >
        {!meeting ? (
          <div className="space-y-3" aria-hidden="true">
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-14 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-3/4" />
            
            <div className="bg-zoom-dark-elevated rounded p-3 space-y-3 border border-zoom-dark-border mt-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            
            <div className="pt-3 flex flex-col sm:flex-row gap-2 border-t border-zoom-dark-border">
              <Skeleton className="h-8 w-full sm:flex-1" />
              <div className="flex gap-2 w-full sm:w-auto">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-[14px] font-semibold text-zoom-text line-clamp-1">{meeting.title}</h3>
                <Badge variant={meeting.status === "SCHEDULED" ? "default" : "secondary"}>
                  {meeting.status}
                </Badge>
              </div>
              {meeting.description && (
                <p className="text-zoom-text-muted text-[12px] whitespace-pre-wrap leading-relaxed">{meeting.description}</p>
              )}
            </div>

            <div className="bg-zoom-dark-elevated rounded p-3 space-y-2.5 border border-zoom-dark-border">
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-zoom-text-muted font-normal">Host</span>
                <span className="text-zoom-text font-medium">{meeting.host_name}</span>
              </div>
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-zoom-text-muted font-normal">Date & Time</span>
                <span className="text-zoom-text font-medium" suppressHydrationWarning>{formattedDate} at {formattedTime}</span>
              </div>
              {meeting.duration && (
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-zoom-text-muted font-normal">Duration</span>
                  <span className="text-zoom-text font-medium">{meeting.duration} Minutes</span>
                </div>
              )}
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-zoom-text-muted font-normal">Meeting ID</span>
                <span className="text-zoom-text font-mono font-medium">{meeting.meeting_id}</span>
              </div>
              <div className="flex justify-between items-center text-[12px] overflow-hidden">
                <span className="text-zoom-text-muted font-normal flex-shrink-0">Invite Link</span>
                <span className="text-zoom-blue text-[11px] font-mono truncate ml-4" title={getInviteLink(meeting.meeting_id)}>
                  {getInviteLink(meeting.meeting_id)}
                </span>
              </div>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row gap-2 border-t border-zoom-dark-border">
              <Button size="sm" className="w-full sm:flex-1 h-8 text-[12px]" onClick={() => handleStart()}>
                Join Meeting
              </Button>
              <div className="flex flex-col sm:flex-row gap-1.5 w-full sm:w-auto">
                <div className="flex gap-1.5 w-full">
                  <Button variant="outline" size="sm" className="flex-1 px-2 h-8 text-[12px]" onClick={() => handleCopyId()} title="Copy Meeting ID">
                    Copy ID
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 px-2 h-8 text-[12px]" onClick={() => handleCopyLink()} title="Copy Invite Link">
                    Copy Link
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="w-full sm:w-auto px-3.5 h-8 text-[12px]" onClick={() => setIsDetailsModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
