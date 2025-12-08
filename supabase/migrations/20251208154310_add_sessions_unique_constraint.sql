-- Add unique constraint for sessions (one session per user per video)
alter table public.sessions add constraint sessions_user_video_unique unique (user_id, video_id);
