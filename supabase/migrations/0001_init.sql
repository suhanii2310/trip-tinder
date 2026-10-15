-- Trip Tinder schema.
-- Every phone signs in with a Supabase anonymous session (no account), so auth.uid()
-- identifies a device. Members can only read their own trip. Swipes are private:
-- a member can read only their own, and group results come from trip_tallies(),
-- which never says who skipped.

-- ---------- types ----------
create type trip_status as enum ('setup', 'swiping', 'results', 'planned');
create type place_category as enum ('do', 'eat', 'stay');
create type day_slot as enum ('morning', 'afternoon', 'evening');
create type swipe_value as enum ('must', 'like', 'skip');
create type member_role as enum ('organizer', 'member');

-- 122 random bits, URL-safe (22 chars). Used for invite and share codes.
create function random_code() returns text
language sql volatile as $$
  select translate(
    encode(decode(replace(gen_random_uuid()::text, '-', ''), 'hex'), 'base64'),
    '+/=', '-_'
  )::text
$$;

-- ---------- tables ----------
create table places (
  id text primary key,
  city text not null,
  name text not null,
  category place_category not null,
  area text not null,
  lat double precision not null,
  lng double precision not null,
  price smallint not null check (price between 1 and 3),
  dist_km numeric(4, 1) not null,
  visit_minutes int not null default 0,
  slot day_slot,                      -- best time of day; null for places to stay
  description text not null,
  tags text[] not null default '{}',
  is_sample boolean not null default false,
  image_url text,                     -- real photo later; null shows the gradient + icon
  art text not null,
  color_from text not null,
  color_to text not null
);

create table trips (
  id uuid primary key default gen_random_uuid(),
  destination text not null,
  start_date date not null,
  end_date date not null check (end_date >= start_date),
  group_size int not null check (group_size between 2 and 12),
  categories place_category[] not null check (cardinality(categories) > 0),
  status trip_status not null default 'swiping',
  invite_code text not null unique default random_code(),
  share_code text not null unique default random_code(),
  created_by uuid not null,
  created_at timestamptz not null default now()
);

create table members (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips (id) on delete cascade,
  user_id uuid not null,
  display_name text not null check (char_length(display_name) between 1 and 30),
  color text not null,
  role member_role not null default 'member',
  finished boolean not null default false,
  swiped_count int not null default 0,
  joined_at timestamptz not null default now(),
  unique (trip_id, user_id),
  unique (id, trip_id)
);

create table swipes (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null,
  member_id uuid not null,
  place_id text not null references places (id),
  value swipe_value not null,
  created_at timestamptz not null default now(),
  unique (member_id, place_id),
  foreign key (member_id, trip_id) references members (id, trip_id) on delete cascade
);

create table plans (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips (id) on delete cascade,
  version int not null,
  days jsonb not null,
  source text not null check (source in ('model', 'rules')),
  created_at timestamptz not null default now(),
  unique (trip_id, version)
);

create index on members (trip_id);
create index on swipes (trip_id);
create index on plans (trip_id, version desc);

-- ---------- helpers ----------
create function my_member_id(p_trip uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select id from members where trip_id = p_trip and user_id = auth.uid()
$$;

create function is_member(p_trip uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select my_member_id(p_trip) is not null
$$;

create function is_organizer(p_trip uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from members where trip_id = p_trip and user_id = auth.uid() and role = 'organizer'
  )
$$;

-- ---------- row-level security ----------
alter table places enable row level security;
alter table trips enable row level security;
alter table members enable row level security;
alter table swipes enable row level security;
alter table plans enable row level security;

create policy "places are public" on places for select using (true);

create policy "members read their trip" on trips for select using (is_member(id));
create policy "members read their group" on members for select using (is_member(trip_id));
create policy "members read plans" on plans for select using (is_member(trip_id));

-- Swipes: only your own, in a trip you belong to. Nobody else's swipe rows are readable.
create policy "read own swipes" on swipes for select
  using (member_id = my_member_id(trip_id));
create policy "add own swipes" on swipes for insert
  with check (member_id = my_member_id(trip_id));
create policy "change own swipes" on swipes for update
  using (member_id = my_member_id(trip_id))
  with check (member_id = my_member_id(trip_id));
create policy "undo own swipes" on swipes for delete
  using (member_id = my_member_id(trip_id));

-- Trips, members and plans are only written through the functions below
-- (or by the server with the service role key), so there are no write policies.

-- ---------- swipe triggers ----------
-- Spec 7: each person gets at most 5 must-haves per category.
create function enforce_must_cap() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  cat place_category;
  n int;
begin
  if new.value <> 'must' then return new; end if;
  select category into cat from places where id = new.place_id;
  select count(*) into n
    from swipes s join places p on p.id = s.place_id
   where s.member_id = new.member_id and s.value = 'must'
     and p.category = cat and s.place_id <> new.place_id;
  if n >= 5 then
    raise exception 'must_have_limit' using hint = 'At most 5 must-haves per category';
  end if;
  return new;
end $$;

create trigger swipes_must_cap before insert or update on swipes
  for each row execute function enforce_must_cap();

-- Keeps members.swiped_count current, so progress rings update over realtime
-- without anyone reading swipe values.
create function sync_swiped_count() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  m uuid := coalesce(new.member_id, old.member_id);
begin
  update members set swiped_count = (select count(*) from swipes where member_id = m) where id = m;
  return null;
end $$;

create trigger swipes_count after insert or delete on swipes
  for each row execute function sync_swiped_count();

-- ---------- functions the app calls ----------
create function member_color(n int) returns text
language sql immutable as $$
  select (array['#E5483D','#2F6FDB','#8A4FD6','#0E8A8A','#D9861A','#C2185B','#3B8C3B','#5C6BC0'])[1 + (n % 8)]
$$;

create function create_trip(
  p_destination text, p_start date, p_end date, p_group_size int,
  p_categories place_category[], p_display_name text
) returns json
language plpgsql security definer set search_path = public as $$
declare
  t trips;
  m_id uuid;
begin
  if auth.uid() is null then raise exception 'not_signed_in'; end if;
  insert into trips (destination, start_date, end_date, group_size, categories, created_by)
    values (p_destination, p_start, p_end, p_group_size, p_categories, auth.uid())
    returning * into t;
  insert into members (trip_id, user_id, display_name, color, role)
    values (t.id, auth.uid(), trim(p_display_name), member_color(0), 'organizer')
    returning id into m_id;
  return json_build_object('trip_id', t.id, 'member_id', m_id, 'invite_code', t.invite_code);
end $$;

-- What the join page shows before you join. Anyone with the invite code can see it.
create function trip_preview(p_code text) returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'trip_id', t.id,
    'destination', t.destination,
    'start_date', t.start_date,
    'end_date', t.end_date,
    'group_size', t.group_size,
    'organizer', (select display_name from members where trip_id = t.id and role = 'organizer'),
    'members', coalesce((select json_agg(json_build_object('name', display_name, 'color', color) order by joined_at)
                          from members where trip_id = t.id), '[]'::json),
    'is_full', (select count(*) >= 12 from members where trip_id = t.id),
    'already_joined', exists (select 1 from members where trip_id = t.id and user_id = auth.uid())
  )
  from trips t where t.invite_code = p_code
$$;

create function join_trip(p_code text, p_display_name text) returns json
language plpgsql security definer set search_path = public as $$
declare
  t trips;
  m members;
  n int;
begin
  if auth.uid() is null then raise exception 'not_signed_in'; end if;
  select * into t from trips where invite_code = p_code;
  if not found then raise exception 'trip_not_found'; end if;

  select * into m from members where trip_id = t.id and user_id = auth.uid();
  if found then
    update members set display_name = trim(p_display_name) where id = m.id;
    return json_build_object('trip_id', t.id, 'member_id', m.id);
  end if;

  perform 1 from trips where id = t.id for update;  -- serialize joins so the cap and colors hold
  select count(*) into n from members where trip_id = t.id;
  if n >= 12 then raise exception 'trip_full'; end if;
  insert into members (trip_id, user_id, display_name, color)
    values (t.id, auth.uid(), trim(p_display_name), member_color(n))
    returning * into m;
  return json_build_object('trip_id', t.id, 'member_id', m.id);
end $$;

-- Marks you done (or not). Opens results when every expected member has finished.
create function set_finished(p_trip uuid, p_finished boolean) returns void
language plpgsql security definer set search_path = public as $$
declare
  t trips;
begin
  update members set finished = p_finished where trip_id = p_trip and user_id = auth.uid();
  if not found then raise exception 'not_a_member'; end if;
  select * into t from trips where id = p_trip;
  if t.status = 'swiping'
     and (select count(*) from members where trip_id = p_trip) >= t.group_size
     and not exists (select 1 from members where trip_id = p_trip and not finished) then
    update trips set status = 'results' where id = p_trip;
  end if;
end $$;

-- Organizer only: "See results now" closes swiping early.
create function close_swiping(p_trip uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_organizer(p_trip) then raise exception 'organizer_only'; end if;
  update trips set status = 'results' where id = p_trip and status = 'swiping';
end $$;

-- Group results, safe to send to every phone.
-- Counts are always returned. Member ids (who liked, who marked must-have) are only
-- returned for places nobody skipped: on a place with a skip, showing the likers
-- would reveal the skipper by elimination. Only available once swiping has closed,
-- so nobody can watch the counts change while one person swipes.
create function trip_tallies(p_trip uuid)
returns table (place_id text, like_count int, must_count int, skip_count int, liker_ids uuid[], must_ids uuid[])
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_member(p_trip) then raise exception 'not_a_member'; end if;
  if (select status from trips where id = p_trip) not in ('results', 'planned') then
    raise exception 'results_not_open';
  end if;
  return query
  select s.place_id,
         count(*) filter (where s.value in ('like', 'must'))::int,
         count(*) filter (where s.value = 'must')::int,
         count(*) filter (where s.value = 'skip')::int,
         case when count(*) filter (where s.value = 'skip') = 0
              then array_agg(s.member_id order by s.member_id) filter (where s.value in ('like', 'must')) end,
         case when count(*) filter (where s.value = 'skip') = 0
              then coalesce(array_agg(s.member_id order by s.member_id) filter (where s.value = 'must'), '{}') end
    from swipes s
   where s.trip_id = p_trip
   group by s.place_id;
end $$;

-- The public, read-only plan page. Anyone with the share code (not the invite code).
create function public_plan(p_share_code text) returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'destination', t.destination,
    'start_date', t.start_date,
    'end_date', t.end_date,
    'members', (select json_agg(json_build_object('id', id, 'name', display_name, 'color', color) order by joined_at)
                  from members where trip_id = t.id),
    'plan', (select json_build_object('version', version, 'days', days)
               from plans where trip_id = t.id order by version desc limit 1)
  )
  from trips t where t.share_code = p_share_code
$$;

-- ---------- permissions ----------
-- Postgres (and Supabase's defaults) let every role run new functions; lock that down.
revoke execute on all functions in schema public from public, anon, authenticated;
-- RLS does not apply to TRUNCATE, so make sure the browser roles can never do it.
revoke truncate, references, trigger on all tables in schema public from anon, authenticated;
grant execute on function my_member_id(uuid), is_member(uuid), is_organizer(uuid) to anon, authenticated;
grant execute on function create_trip(text, date, date, int, place_category[], text) to authenticated;
grant execute on function join_trip(text, text) to authenticated;
grant execute on function set_finished(uuid, boolean) to authenticated;
grant execute on function close_swiping(uuid) to authenticated;
grant execute on function trip_tallies(uuid) to authenticated;
grant execute on function trip_preview(text) to anon, authenticated;
grant execute on function public_plan(text) to anon, authenticated;

-- ---------- realtime ----------
-- Phones listen to trips (status), members (join, progress) and plans. Never swipes.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table trips, members, plans;
  end if;
end $$;
