export interface ContactInfo {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface EducationItem {
  degree?: string;
  institution?: string;
  year?: string;
  gpa?: string;
}

export interface ExperienceItem {
  company?: string;
  role?: string;
  duration?: string;
  responsibilities: string[];
}

export interface ProjectItem {
  title?: string;
  description?: string;
  technologies: string[];
}

export interface ParsedResume {
  candidate: ContactInfo;
  summary?: string;
  skills: string[];
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  certifications: string[];
  achievements: string[];
  raw_text?: string;
}

export interface Job {
  id: string;
  title: string;
  company?: string;
  department?: string;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  responsibilities: string[];
  education_requirements: string[];
  experience_requirements: string[];
  keywords: string[];
  created_at: string;
}

export interface ScoreBreakdown {
  overall_score: number;
  score_category: 'Exceptional Fit' | 'Strong Fit' | 'Good Fit' | 'Moderate Fit' | 'Low Fit';
  recommendation: 'Strongly Recommended' | 'Recommended' | 'Consider' | 'Not Recommended';
  skill_match_score: number;
  semantic_fit_score: number;
  experience_score: number;
  project_score: number;
  education_score: number;
  certification_score: number;
  keyword_score: number;
}

export interface CandidateMatchReport {
  candidate_id: string;
  candidate_name: string;
  email?: string;
  match_scores: ScoreBreakdown;
  matched_skills: string[];
  missing_skills: string[];
  additional_skills: string[];
  strengths: string[];
  gaps: string[];
  missing_in_resume: string[];
  recommendations: string[];
  explanation: string;
  experience_alignment: string;
  is_shortlisted: boolean;
}

export interface ScreeningSessionResponse {
  session_id: string;
  job_id: string;
  job_title: string;
  total_resumes: number;
  avg_score: number;
  created_at: string;
  results: CandidateMatchReport[];
}

export interface CandidateListItem {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  summary?: string;
  is_shortlisted: boolean;
  created_at: string;
  latest_screening?: {
    overall_score: number;
    score_category: string;
    recommendation: string;
    matched_skills: string[];
    missing_skills: string[];
    job_id?: string;
    sub_scores?: {
      skill_match?: number;
      semantic_fit?: number;
      experience?: number;
      projects?: number;
    };
  };
}

export interface CandidateDetailResponse {
  candidate: CandidateListItem;
  parsed_resume?: ParsedResume;
  raw_text?: string;
  screening_analysis?: {
    job_id?: string;
    job_title: string;
    overall_score: number;
    score_category: string;
    recommendation: string;
    sub_scores: {
      skill_match: number;
      semantic_fit: number;
      experience: number;
      projects: number;
      education: number;
      certifications: number;
      keywords: number;
    };
    matched_skills: string[];
    missing_skills: string[];
    additional_skills: string[];
    strengths: string[];
    gaps: string[];
    missing_in_resume: string[];
    recommendations: string[];
    explanation: string;
    experience_alignment: string;
  };
}

export interface DashboardStats {
  total_resumes_screened: number;
  avg_match_score: number;
  top_candidate_name?: string;
  top_candidate_score?: number;
  shortlisted_count: number;
  total_jobs_analyzed: number;
  score_distribution: Record<string, number>;
  top_matched_skills: Array<{ skill: string; count: number }>;
  common_skill_gaps: Array<{ skill: string; count: number }>;
  recent_sessions: Array<{
    session_id: string;
    job_title: string;
    total_resumes: number;
    avg_score: number;
    created_at: string;
  }>;
}

export interface CompareCandidate {
  candidate_id: string;
  name: string;
  email?: string;
  overall_score: number;
  score_category: string;
  recommendation: string;
  skill_score: number;
  semantic_score: number;
  experience_score: number;
  project_score: number;
  education_score: number;
  matched_skills: string[];
  missing_skills: string[];
  strengths: string[];
  gaps: string[];
  skills: string[];
}

export interface InterviewQuestionItem {
  category: string;
  target_skill: string;
  question: string;
  what_to_listen_for: string;
}

export interface InterviewKitResponse {
  candidate_id: string;
  candidate_name: string;
  questions: InterviewQuestionItem[];
}

export interface OutreachEmailResponse {
  candidate_id: string;
  candidate_name: string;
  subject: string;
  body: string;
}
