-- Run this in the Supabase SQL Editor (supabase.com > your project > SQL Editor)

-- Rooms table
create table rooms (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  name text not null,
  created_at timestamptz default now()
);

-- Suggestions table (movies and dinner options)
create table suggestions (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references rooms(id) on delete cascade not null,
  category text not null check (category in ('film', 'middag')),
  title text not null,
  poster_path text,
  release_year text,
  added_by text not null,
  created_at timestamptz default now()
);

-- Votes table (ranked 1-3 per category)
create table votes (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references rooms(id) on delete cascade not null,
  voter_name text not null,
  suggestion_id uuid references suggestions(id) on delete cascade not null,
  category text not null check (category in ('film', 'middag')),
  rank int not null check (rank >= 1 and rank <= 3),
  created_at timestamptz default now(),
  unique(room_id, voter_name, category, rank),
  unique(room_id, voter_name, suggestion_id)
);

-- Popcorn votes table (yes/no per user per room)
create table popcorn_votes (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references rooms(id) on delete cascade not null,
  voter_name text not null,
  vote boolean not null,
  created_at timestamptz default now(),
  unique(room_id, voter_name)
);

-- Enable Row Level Security
alter table rooms enable row level security;
alter table suggestions enable row level security;
alter table votes enable row level security;
alter table popcorn_votes enable row level security;

-- Open policies (anyone with the anon key can read/write)
create policy "Allow all on rooms" on rooms for all using (true) with check (true);
create policy "Allow all on suggestions" on suggestions for all using (true) with check (true);
create policy "Allow all on votes" on votes for all using (true) with check (true);
create policy "Allow all on popcorn_votes" on popcorn_votes for all using (true) with check (true);

-- Enable realtime for suggestions, votes and popcorn_votes
alter publication supabase_realtime add table suggestions;
alter publication supabase_realtime add table votes;
alter publication supabase_realtime add table popcorn_votes;

-- Migration: Add TMDB poster and release year to suggestions
-- Run this if you already have an existing suggestions table:
-- ALTER TABLE suggestions ADD COLUMN poster_path text;
-- ALTER TABLE suggestions ADD COLUMN release_year text;

-- Migration: Add popcorn_votes table
-- Run this if you already have an existing database:
--
-- CREATE TABLE popcorn_votes (
--   id uuid default gen_random_uuid() primary key,
--   room_id uuid references rooms(id) on delete cascade not null,
--   voter_name text not null,
--   vote boolean not null,
--   created_at timestamptz default now(),
--   unique(room_id, voter_name)
-- );
-- ALTER TABLE popcorn_votes ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all on popcorn_votes" ON popcorn_votes FOR ALL USING (true) WITH CHECK (true);
-- ALTER PUBLICATION supabase_realtime ADD TABLE popcorn_votes;
