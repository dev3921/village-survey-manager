export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'user';
  team_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  admin_id: string;
  referral_code: string;
  created_at: string;
}

export interface Family {
  id: string;
  user_id: string;
  team_id: string | null;
  serial_no: number | null;
  head_name: string;
  total_members: number;
  economic_status: string;
  caste: string;
  shg_name: string;
  income_source: string;
  women_skills: string;
  monthly_income: number;
  farm_land: string;
  water_source: string;
  livestock: string;
  tools_machines: string;
  house_type: string;
  electricity: boolean;
  toilet: boolean;
  fuel_type: string;
  has_disabled: boolean;
  scheme_benefits: string;
  internet_access: string;
  village_name: string;
  created_at: string;
  updated_at: string;
  members?: FamilyMember[];
}

export interface FamilyMember {
  id: string;
  family_id: string;
  member_name: string;
  age: number | null;
  relationship: string;
  marital_status: string;
  education: string;
  created_at: string;
}

export type FamilyFormData = Omit<Family, 'id' | 'user_id' | 'team_id' | 'created_at' | 'updated_at' | 'members'> & {
  members: Omit<FamilyMember, 'id' | 'family_id' | 'created_at'>[];
};
