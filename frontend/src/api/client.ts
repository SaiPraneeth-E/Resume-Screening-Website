import axios from 'axios';
import {
  Job,
  ScreeningSessionResponse,
  CandidateListItem,
  CandidateDetailResponse,
  DashboardStats,
  CompareCandidate,
  InterviewKitResponse,
  OutreachEmailResponse
} from '../types';

const rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || '/api';

let formattedApiUrl = rawApiUrl;
if (!formattedApiUrl.startsWith('http://') && !formattedApiUrl.startsWith('https://') && !formattedApiUrl.startsWith('/')) {
  formattedApiUrl = `https://${formattedApiUrl}`;
}

// Ensure the base URL ends with /api (unless using relative '/api')
if (formattedApiUrl.startsWith('http') && !formattedApiUrl.endsWith('/api') && !formattedApiUrl.includes('/api/')) {
  formattedApiUrl = formattedApiUrl.replace(/\/+$/, '') + '/api';
}

const API_BASE_URL = formattedApiUrl;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  getHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },

  listJobs: async (): Promise<Job[]> => {
    const res = await apiClient.get('/jobs');
    return res.data;
  },
  createJob: async (jobData: { title: string; company?: string; description: string; required_skills?: string[]; preferred_skills?: string[] }): Promise<Job> => {
    const res = await apiClient.post('/jobs', jobData);
    return res.data;
  },
  getJob: async (id: string): Promise<Job> => {
    const res = await apiClient.get(`/jobs/${id}`);
    return res.data;
  },
  deleteJob: async (id: string): Promise<void> => {
    await apiClient.delete(`/jobs/${id}`);
  },

  screenResumes: async (formData: FormData): Promise<ScreeningSessionResponse> => {
    const res = await apiClient.post('/screen', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  listCandidates: async (params?: {
    search?: string;
    min_score?: number;
    recommendation?: string;
    shortlisted_only?: boolean;
    session_id?: string;
  }): Promise<CandidateListItem[]> => {
    const res = await apiClient.get('/candidates', { params });
    return res.data;
  },
  getCandidate: async (id: string): Promise<CandidateDetailResponse> => {
    const res = await apiClient.get(`/candidates/${id}`);
    return res.data;
  },
  toggleShortlist: async (candidate_id: string, job_id?: string): Promise<{ shortlisted: boolean; candidate_id: string }> => {
    const res = await apiClient.post('/candidates/shortlist', { candidate_id, job_id });
    return res.data;
  },
  compareCandidates: async (candidate_ids: string[]): Promise<CompareCandidate[]> => {
    const res = await apiClient.post('/candidates/compare', candidate_ids);
    return res.data;
  },
  getInterviewQuestions: async (candidate_id: string): Promise<InterviewKitResponse> => {
    const res = await apiClient.get(`/candidates/${candidate_id}/interview-questions`);
    return res.data;
  },
  getOutreachEmail: async (candidate_id: string): Promise<OutreachEmailResponse> => {
    const res = await apiClient.get(`/candidates/${candidate_id}/outreach-email`);
    return res.data;
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await apiClient.get('/dashboard/stats');
    return res.data;
  },

  getExportUrl: (job_id: string) => {
    return `${API_BASE_URL}/export/csv?job_id=${job_id}`;
  }
};
