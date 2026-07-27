export interface Participant {
  id: string;
  name: string;
  joined_at: string;
  left_at?: string;
}

export interface Meeting {
  id: string;
  meeting_id: string;
  title: string;
  description?: string;
  host_name: string;
  status: "INSTANT" | "SCHEDULED" | "ENDED";
  start_time: string;
  scheduled_for?: string;
  duration?: number;
  invite_link: string;
  created_by?: string;
  participants: Participant[];
}
