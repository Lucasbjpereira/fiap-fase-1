CREATE TABLE IF NOT EXISTS workshops (
  id serial PRIMARY KEY,
  name varchar(180) NOT NULL,
  document varchar(14) NOT NULL UNIQUE,
  address text NOT NULL,
  phone varchar(30),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
