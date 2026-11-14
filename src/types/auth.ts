import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/types";

export interface AccountSession { user: User; profile: UserProfile }
export interface AccountActionResult { success: boolean; error?: string; message?: string; requestId?: string; expiresIn?: number; resendAfter?: number; retryAfter?: number }
