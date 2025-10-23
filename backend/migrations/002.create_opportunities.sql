create table opportunities(
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references users(id) on delete cascade,
  title text not null,
  description text not null,
  gpa_requirement numeric(3,2),
  location text,
  majors text[],
  apply_link text,
  status text default 'active',
  created_at timestamp default now()
);