export type StaffRole = "admin" | "editor";
export interface StaffUser { id: string; full_name: string; email: string; role: StaffRole; is_active: boolean; created_at: string }
