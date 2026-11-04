-- Run after prisma migrate deploy in Supabase SQL Editor.
-- Public course catalog is readable by everyone; authoring is service/admin only.
alter table "Language" enable row level security;
alter table "Unit" enable row level security;
alter table "Lesson" enable row level security;
alter table "Source" enable row level security;
alter table "ApprovedChannel" enable row level security;
alter table "Badge" enable row level security;
alter table "Quest" enable row level security;

create policy "Public course catalog is readable" on "Language" for select using (true);
create policy "Public units are readable" on "Unit" for select using (true);
create policy "Public lessons are readable" on "Lesson" for select using (true);
create policy "Public sources are readable" on "Source" for select using (true);
create policy "Public badges are readable" on "Badge" for select using (true);
create policy "Public quests are readable" on "Quest" for select using (true);

alter table "User" enable row level security;
alter table "UserSettings" enable row level security;
alter table "LessonProgress" enable row level security;
alter table "UserBadge" enable row level security;
alter table "UserQuest" enable row level security;
alter table "XpEvent" enable row level security;

-- User IDs must match auth.users.id. Policies restrict all personal rows to their owner.
create policy "Users read own profile" on "User" for select using (auth.uid()::text = id);
create policy "Users update own profile" on "User" for update using (auth.uid()::text = id) with check (auth.uid()::text = id);
create policy "Users manage own settings" on "UserSettings" for all using (auth.uid()::text = "userId") with check (auth.uid()::text = "userId");
create policy "Users manage own progress" on "LessonProgress" for all using (auth.uid()::text = "userId") with check (auth.uid()::text = "userId");
create policy "Users read own badges" on "UserBadge" for select using (auth.uid()::text = "userId");
create policy "Users read own quests" on "UserQuest" for select using (auth.uid()::text = "userId");
create policy "Users read own XP events" on "XpEvent" for select using (auth.uid()::text = "userId");

-- Keep writes to lesson/source/channel content limited to server service-role operations.
