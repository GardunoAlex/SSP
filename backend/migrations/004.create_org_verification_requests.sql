create table org_verification_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  website text,
  linked_in text,
  submitted_at timestamp default now(),
  reviewed boolean default false,
  decision text check (decision in ('approved', 'rejected')) default null,
  reviewed_at timestamp
);