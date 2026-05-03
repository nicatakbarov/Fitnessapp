create table if not exists food_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  date        date not null default current_date,
  name        text not null,
  calories    int not null,
  protein     int not null default 0,
  carbs       int not null default 0,
  fat         int not null default 0,
  created_at  timestamptz not null default now()
);

alter table food_logs enable row level security;

create policy "users can manage own food logs"
  on food_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
