-- Create a table for public profiles
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  plan text default 'FREE' check (plan in ('FREE', 'STANDARD', 'MASTER')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.users enable row level security;

create policy "Public profiles are viewable by everyone."
  on public.users for select
  using ( true );

create policy "Users can insert their own profile."
  on public.users for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.users for update
  using ( auth.uid() = id );

-- Create a table for archives (saved sentences)
create table public.archives (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  video_id text not null,
  sentence_id text,
  content text,
  user_note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS for archives
alter table public.archives enable row level security;

create policy "Users can view their own archives."
  on public.archives for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own archives."
  on public.archives for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own archives."
  on public.archives for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own archives."
  on public.archives for delete
  using ( auth.uid() = user_id );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
