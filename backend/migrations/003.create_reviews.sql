create table reviews (
  id uuid primary key default uuid_generate_v4(),
  opportunity_id uuid references opportunities(id) on delete cascade,
  student_id uuid references users(id) on delete cascade,
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamp default now()
);