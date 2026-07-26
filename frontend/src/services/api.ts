import axios from 'axios';
import { Meeting } from '@/types/meeting';
import { User, AuthResponseData } from '@/types/user';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('zoom_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface StandardResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const authService = {
  signup: async (data: { full_name: string; email: string; password: string }): Promise<AuthResponseData> => {
    const response = await api.post<StandardResponse<AuthResponseData>>('/auth/signup', data);
    return response.data.data;
  },
  login: async (data: { email: string; password: string }): Promise<AuthResponseData> => {
    const response = await api.post<StandardResponse<AuthResponseData>>('/auth/login', data);
    return response.data.data;
  },
  getMe: async (): Promise<User> => {
    const response = await api.get<StandardResponse<User>>('/auth/me');
    return response.data.data;
  },
};

export const meetingsService = {
  createInstantMeeting: async (): Promise<Meeting> => {
    const response = await api.post<StandardResponse<Meeting>>('/meetings/instant');
    return response.data.data;
  },
  joinMeeting: async (meetingId: string, name: string): Promise<Meeting> => {
    const response = await api.post<StandardResponse<Meeting>>('/meetings/join', {
      meeting_id: meetingId,
      name,
    });
    return response.data.data;
  },
  scheduleMeeting: async (data: { title: string; description?: string; host_name: string; scheduled_for: string; duration: number }): Promise<Meeting> => {
    const response = await api.post<StandardResponse<Meeting>>('/meetings/schedule', data);
    return response.data.data;
  },
  getUpcomingMeetings: async (): Promise<Meeting[]> => {
    const response = await api.get<StandardResponse<Meeting[]>>('/meetings/upcoming');
    return response.data.data;
  },
  getRecentMeetings: async (): Promise<Meeting[]> => {
    const response = await api.get<StandardResponse<Meeting[]>>('/meetings/recent');
    return response.data.data;
  },
  getMeeting: async (meetingId: string): Promise<Meeting> => {
    const response = await api.get<StandardResponse<Meeting>>(`/meetings/${meetingId}`);
    return response.data.data;
  },
  endMeeting: async (meetingId: string): Promise<Meeting> => {
    const response = await api.post<StandardResponse<Meeting>>(`/meetings/${meetingId}/end`);
    return response.data.data;
  },
  deleteMeeting: async (meetingId: string): Promise<boolean> => {
    const response = await api.delete<StandardResponse<boolean>>(`/meetings/${meetingId}`);
    return response.data.data;
  },
};
