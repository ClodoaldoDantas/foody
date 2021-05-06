-- TABLE RECIPES
CREATE TABLE public.recipes (
  id integer NOT NULL,
  chef_id integer,
  title text,
  information text,
  created_at timestamp without time zone,
  ingredients text[],
  preparation text[]
);

CREATE SEQUENCE public.recipes_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

ALTER SEQUENCE public.recipes_id_seq OWNED BY public.recipes.id;

ALTER TABLE ONLY public.recipes ALTER COLUMN id SET DEFAULT nextval('public.recipes_id_seq'::regclass);

ALTER TABLE ONLY public.recipes ADD CONSTRAINT recipes_pkey PRIMARY KEY (id);

-- TABLE CHEFS
CREATE TABLE public.chefs (
  id integer NOT NULL,
  name text,
  created_at timestamp without time zone
);

CREATE SEQUENCE public.chefs_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

ALTER SEQUENCE public.chefs_id_seq OWNED BY public.chefs.id;

ALTER TABLE ONLY public.chefs ALTER COLUMN id SET DEFAULT nextval('public.chefs_id_seq'::regclass);

ALTER TABLE ONLY public.chefs ADD CONSTRAINT chefs_pkey PRIMARY KEY (id);

ALTER TABLE chefs ADD COLUMN file_id INTEGER REFERENCES files(id);

-- TABLE FILES
create table files(
	id SERIAL PRIMARY KEY,
  name TEXT,
  path TEXT NOT NULL
);

-- TABLE RECIPE_FILES
create table recipe_files(
	id SERIAL PRIMARY KEY,
  recipe_id INTEGER REFERENCES recipes(id),
  file_id INTEGER REFERENCES files(id)
);

-- UPDATED_AT
CREATE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();