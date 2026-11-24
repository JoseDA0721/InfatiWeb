-- InfantiWeb · esquema inicial (sección 11 del documento de contexto)
-- Ampliaciones marcadas con «+»: clave con imágenes, recuperación de PIN,
-- límite de intentos, retroalimentación por opción y datos de cada actividad.

CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('nino', 'familia')),
  display_name TEXT NOT NULL,
  username TEXT UNIQUE,
  password_hash TEXT,
  picture_hash TEXT,                 -- + clave con imágenes (niño)
  pin_hash TEXT,
  security_question TEXT,            -- + recuperación del PIN (familia)
  security_answer_hash TEXT,         -- +
  avatar_id INTEGER DEFAULT 1,
  age INTEGER,                       -- + edad visible para la familia
  failed_attempts INTEGER DEFAULT 0, -- + límite de intentos
  locked_until TEXT,                 -- +
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE family_links (
  parent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  child_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (parent_id, child_id)
);

CREATE TABLE child_progress (
  child_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  weekly_goal INTEGER DEFAULT 5,
  tutorial_done INTEGER DEFAULT 0
);

CREATE TABLE preferences (
  child_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  font_scale TEXT DEFAULT 'normal' CHECK (font_scale IN ('normal', 'grande', 'muy_grande')),
  high_contrast INTEGER DEFAULT 0,
  volume REAL DEFAULT 0.6,
  muted INTEGER DEFAULT 0,           -- + botón de silencio siempre visible
  voice_rate REAL DEFAULT 0.9,
  read_mode TEXT DEFAULT 'ambos' CHECK (read_mode IN ('texto', 'audio', 'ambos')),
  reduce_motion INTEGER DEFAULT 0
);

CREATE TABLE modules (
  id INTEGER PRIMARY KEY,
  code TEXT UNIQUE,
  title TEXT,
  world_title TEXT,                  -- + nombre del mundo en el mapa
  skill TEXT CHECK (skill IN ('reconocimiento', 'comprension', 'regulacion', 'expresion')),
  position INTEGER,
  icon TEXT
);

CREATE TABLE activities (
  id INTEGER PRIMARY KEY,
  module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('identifica', 'une', 'que_harias', 'respira', 'expreso', 'observa', 'escucha')),
  title TEXT,
  instruction TEXT,                  -- + instrucción de una línea
  emotion_code TEXT,                 -- + emoción principal (insignias detective)
  sticker_code TEXT,                 -- + sticker que se gana al completarla
  position INTEGER,
  est_minutes INTEGER DEFAULT 3
);

CREATE TABLE questions (
  id INTEGER PRIMARY KEY,
  activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
  position INTEGER,
  prompt TEXT,
  story TEXT,                        -- + situación narrada (Escucha y responde)
  scene_image TEXT,
  scene_alt TEXT,                    -- + texto alternativo de la escena
  hint1 TEXT,
  hint2 TEXT,
  explanation TEXT
);

CREATE TABLE options (
  id INTEGER PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,        -- +
  kind TEXT DEFAULT 'choice' CHECK (kind IN ('choice', 'pair', 'emotion', 'reason')), -- +
  label TEXT,
  emotion_code TEXT,
  image TEXT,
  feedback TEXT,                     -- + efecto de la estrategia (¿Qué harías?)
  is_correct INTEGER DEFAULT 0
);

CREATE TABLE attempts (
  id INTEGER PRIMARY KEY,
  child_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
  started_at TEXT,
  finished_at TEXT,
  completed INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  duration_sec INTEGER DEFAULT 0
);

CREATE TABLE answers (
  id INTEGER PRIMARY KEY,
  attempt_id INTEGER REFERENCES attempts(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  option_id INTEGER REFERENCES options(id) ON DELETE SET NULL,
  is_correct INTEGER,
  try_number INTEGER,
  hints_used INTEGER DEFAULT 0,
  revealed INTEGER DEFAULT 0,        -- + se mostró la respuesta (ayuda completa)
  stars INTEGER DEFAULT 0,           -- + estrellas de la pregunta al resolverse
  detail TEXT,                       -- + JSON: parejas, frase construida, intensidad
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE badges (
  id INTEGER PRIMARY KEY,
  code TEXT UNIQUE,
  title TEXT,
  condition_text TEXT,
  icon TEXT
);

CREATE TABLE child_badges (
  child_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TEXT,
  PRIMARY KEY (child_id, badge_id)
);

CREATE TABLE stickers (
  id INTEGER PRIMARY KEY,
  code TEXT UNIQUE,
  title TEXT,                        -- +
  image TEXT
);

CREATE TABLE child_stickers (
  child_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  sticker_id INTEGER REFERENCES stickers(id) ON DELETE CASCADE,
  earned_at TEXT,
  PRIMARY KEY (child_id, sticker_id)
);

CREATE TABLE usage_daily (
  child_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  day TEXT,
  seconds INTEGER DEFAULT 0,
  PRIMARY KEY (child_id, day)
);

CREATE TABLE recommendations (
  id INTEGER PRIMARY KEY,
  skill TEXT,
  title TEXT,
  body TEXT,
  minutes INTEGER DEFAULT 5          -- +
);

CREATE TABLE help_requests (
  id INTEGER PRIMARY KEY,
  child_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  context TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  seen INTEGER DEFAULT 0
);

-- + mensajes a soporte desde el panel de familia
CREATE TABLE support_messages (
  id INTEGER PRIMARY KEY,
  parent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attempts_child ON attempts (child_id, activity_id);
CREATE INDEX idx_answers_attempt ON answers (attempt_id, question_id);
CREATE INDEX idx_questions_activity ON questions (activity_id, position);
CREATE INDEX idx_options_question ON options (question_id, position);
