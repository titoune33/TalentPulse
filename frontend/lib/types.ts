export type Role = "admin" | "hr_manager" | "employee";

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  is_active: boolean;
  company_id?: number | null;
  created_at: string;
  updated_at?: string | null;
}

export type TalentStatus = "active" | "at_risk" | "inactive" | "turnover";

export interface Talent {
  id: number;
  user_id?: number | null;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  position?: string | null;
  department?: string | null;
  hire_date?: string | null;
  salary?: number | null;
  skills: string[];
  experience_years: number;
  education?: string | null;
  performance_score: number;
  engagement_score: number;
  satisfaction_score: number;
  status: TalentStatus;
  turnover_risk: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}

export type TalentInput = Partial<
  Pick<
    Talent,
    | "first_name"
    | "last_name"
    | "email"
    | "phone"
    | "position"
    | "department"
    | "hire_date"
    | "salary"
    | "skills"
    | "experience_years"
    | "education"
    | "performance_score"
    | "engagement_score"
    | "satisfaction_score"
    | "status"
  >
> & {
  first_name?: string;
  last_name?: string;
  email?: string;
};

export interface Prediction {
  id: number;
  talent_id: number;
  prediction_type: string;
  score: number;
  confidence: number;
  probability?: number | null;
  features: Record<string, any>;
  details: Record<string, any>;
  recommendation?: string | null;
  predicted_at: string;
  valid_until?: string | null;
}

export interface TalentStats {
  total: number;
  active: number;
  at_risk: number;
  turnover: number;
  avg_performance: number;
  avg_engagement: number;
  departments: Record<string, number>;
}

export interface PredictionStats {
  total: number;
  avg_risk_score: number;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Plan {
  name: string;
  price: number | null;
  description: string;
  features: string[];
  highlighted: boolean;
  cta: string;
}
