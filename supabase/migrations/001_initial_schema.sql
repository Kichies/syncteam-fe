-- Extensions
create extension if not exists "uuid-ossp";

-- PROFILES
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text not null,
  avatar_url      text,
  role            text,
  skills          text[] default '{}',
  available_hours int default 10,
  xp_points       int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- PROJECTS
create table if not exists public.projects (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  description     text,
  owner_id        uuid not null references public.profiles(id),
  status          text default 'active' check (status in ('active','completed','archived')),
  start_date      date not null,
  end_date        date not null,
  sprint_count    int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- PROJECT MEMBERS
create table if not exists public.project_members (
  id               uuid primary key default uuid_generate_v4(),
  project_id       uuid not null references public.projects(id) on delete cascade,
  user_id          uuid not null references public.profiles(id) on delete cascade,
  role_in_project  text,
  joined_at        timestamptz default now(),
  unique (project_id, user_id)
);

-- SPRINTS
create table if not exists public.sprints (
  id                uuid primary key default uuid_generate_v4(),
  project_id        uuid not null references public.projects(id) on delete cascade,
  sprint_number     int not null,
  name              text,
  start_date        date not null,
  end_date          date not null,
  status            text default 'active' check (status in ('active','completed')),
  progress_snapshot int default 0,
  created_at        timestamptz default now()
);

-- TASKS
create table if not exists public.tasks (
  id               uuid primary key default uuid_generate_v4(),
  project_id       uuid not null references public.projects(id) on delete cascade,
  sprint_id        uuid references public.sprints(id),
  title            text not null,
  description      text,
  status           text default 'backlog' check (status in ('backlog','in_progress','completed')),
  priority         text default 'medium' check (priority in ('low','medium','high')),
  assigned_to      uuid references public.profiles(id),
  estimated_hours  int,
  actual_hours     int,
  required_skills  text[] default '{}',
  due_date         date,
  completed_at     timestamptz,
  parent_task_id   uuid references public.tasks(id),
  ai_generated     boolean default false,
  order_index      int default 0,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- AI SUGGESTIONS
create table if not exists public.ai_suggestions (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  type        text not null check (type in ('reorder','workload','deadline','recommendation')),
  title       text not null,
  body        text not null,
  metadata    jsonb default '{}',
  is_accepted boolean,
  created_at  timestamptz default now()
);

-- REWARD HISTORY
create table if not exists public.reward_history (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  project_id  uuid references public.projects(id),
  task_id     uuid references public.tasks(id),
  type        text not null check (type in ('reward','punishment')),
  points      int not null,
  reason      text,
  created_at  timestamptz default now()
);

-- ROADMAPS
create table if not exists public.roadmaps (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  content     jsonb not null,
  version     int default 1,
  created_at  timestamptz default now()
);

-- INDEXES
create index if not exists idx_tasks_project on public.tasks(project_id);
create index if not exists idx_tasks_assigned on public.tasks(assigned_to);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_members_user on public.project_members(user_id);
create index if not exists idx_suggestions_project on public.ai_suggestions(project_id);

-- UPDATED_AT TRIGGER
create or replace function public.handle_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create or replace trigger set_updated_at_profiles
  before update on public.profiles for each row execute function public.handle_updated_at();
create or replace trigger set_updated_at_projects
  before update on public.projects for each row execute function public.handle_updated_at();
create or replace trigger set_updated_at_tasks
  before update on public.tasks for each row execute function public.handle_updated_at();

-- AUTO CREATE PROFILE saat user register
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- REWARD TRIGGER saat task completed
create or replace function public.handle_task_completion()
returns trigger as $$
declare v_points int; v_reason text;
begin
  if new.status = 'completed' and old.status != 'completed' and new.assigned_to is not null then
    new.completed_at = now();
    if new.due_date is null then
      v_points := 5; v_reason := 'Task completed';
    elsif now()::date < new.due_date then
      v_points := 10; v_reason := 'Selesai lebih awal';
    elsif now()::date = new.due_date then
      v_points := 5; v_reason := 'Selesai tepat waktu';
    elsif now()::date <= new.due_date + 3 then
      v_points := -5; v_reason := 'Terlambat 1-3 hari';
    else
      v_points := -15; v_reason := 'Terlambat lebih dari 3 hari';
    end if;
    insert into public.reward_history (user_id, project_id, task_id, type, points, reason)
    values (new.assigned_to, new.project_id, new.id,
      case when v_points > 0 then 'reward' else 'punishment' end, v_points, v_reason);
    update public.profiles set xp_points = xp_points + v_points where id = new.assigned_to;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_task_completed
  before update on public.tasks for each row execute function public.handle_task_completion();

-- RLS
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.sprints enable row level security;
alter table public.tasks enable row level security;
alter table public.ai_suggestions enable row level security;
alter table public.reward_history enable row level security;
alter table public.roadmaps enable row level security;

-- PROFILES
create policy "view all profiles" on public.profiles for select using (true);
create policy "update own profile" on public.profiles for update using (auth.uid() = id);
create policy "insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Helper function: cek membership tanpa trigger RLS (security definer)
create or replace function public.is_member_of_project(pid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.project_members
    where project_id = pid and user_id = auth.uid()
  );
$$;

-- PROJECTS
create policy "members view projects" on public.projects for select using (
  owner_id = auth.uid() or public.is_member_of_project(id)
);
create policy "create project" on public.projects for insert with check (auth.uid() = owner_id);
create policy "owner update project" on public.projects for update using (owner_id = auth.uid());
create policy "owner delete project" on public.projects for delete using (owner_id = auth.uid());

-- PROJECT MEMBERS
create policy "members view team" on public.project_members for select using (
  user_id = auth.uid() or
  exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
);
create policy "owner manage members" on public.project_members for all using (
  exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
);

-- TASKS
create policy "members view tasks" on public.tasks for select using (
  public.is_member_of_project(project_id) or
  exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
);
create policy "members create tasks" on public.tasks for insert with check (
  public.is_member_of_project(project_id) or
  exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
);
create policy "assignee or owner update task" on public.tasks for update using (
  assigned_to = auth.uid()
  or exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
);

-- AI SUGGESTIONS
create policy "members view suggestions" on public.ai_suggestions for select using (
  public.is_member_of_project(project_id) or
  exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
);

-- REWARD HISTORY
create policy "view own rewards" on public.reward_history for select using (user_id = auth.uid());

-- ROADMAPS
create policy "members view roadmap" on public.roadmaps for select using (
  public.is_member_of_project(project_id) or
  exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
);
