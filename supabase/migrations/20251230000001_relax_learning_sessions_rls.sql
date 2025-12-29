-- Migration: Relax RLS policies for learning_sessions to allow management of orphaned records
-- Date: 2025-12-30

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Creators can update their learning sessions" ON public.learning_sessions;
DROP POLICY IF EXISTS "Creators can delete their learning sessions" ON public.learning_sessions;

-- New policies that also allow authenticated users to manage sessions where creator is null
-- (This handles migrated or orphaned sessions)
CREATE POLICY "Users can update their own or orphaned sessions"
  ON public.learning_sessions FOR UPDATE
  USING (auth.uid() = created_by OR created_by IS NULL);

CREATE POLICY "Users can delete their own or orphaned sessions"
  ON public.learning_sessions FOR DELETE
  USING (auth.uid() = created_by OR created_by IS NULL);
