create table saved_opportunities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  opportunity_id uuid references opportunities(id) on delete cascade,
  created_at timestamp default now()
);