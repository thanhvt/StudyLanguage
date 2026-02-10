-- =====================================================
-- Migration 005: Bảng tongue_twisters
-- Mục đích: Curated tongue twisters cho Speaking practice
-- Khi nào sử dụng: GET /speaking/tongue-twisters
-- =====================================================

CREATE TABLE IF NOT EXISTS tongue_twisters (
  id SERIAL PRIMARY KEY,
  text_en TEXT NOT NULL,
  ipa TEXT,
  level VARCHAR(20) DEFAULT 'beginner', -- beginner, intermediate, advanced
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5)
);

-- Seed data
INSERT INTO tongue_twisters (text_en, ipa, level, difficulty) VALUES
  -- Beginner
  ('She sells seashells by the seashore.', '/ʃiː selz ˈsiːʃelz baɪ ðə ˈsiːʃɔːr/', 'beginner', 1),
  ('Red lorry, yellow lorry.', '/red ˈlɒr.i ˈjel.oʊ ˈlɒr.i/', 'beginner', 1),
  ('How much wood would a woodchuck chuck?', '/haʊ mʌtʃ wʊd wʊd ə ˈwʊd.tʃʌk tʃʌk/', 'beginner', 2),
  ('I scream, you scream, we all scream for ice cream.', NULL, 'beginner', 1),
  ('Toy boat, toy boat, toy boat.', NULL, 'beginner', 1),
  ('Six slippery snails slid slowly seaward.', NULL, 'beginner', 2),
  ('A proper copper coffee pot.', NULL, 'beginner', 2),
  ('Fresh French fried fish.', NULL, 'beginner', 1),
  ('Greek grapes, Greek grapes, Greek grapes.', NULL, 'beginner', 1),
  ('Big black bug bit a big black bear.', NULL, 'beginner', 2),
  -- Intermediate
  ('Peter Piper picked a peck of pickled peppers.', '/ˈpiː.tər ˈpaɪ.pər pɪkt ə pek əv ˈpɪk.əld ˈpep.ərz/', 'intermediate', 3),
  ('How can a clam cram in a clean cream can?', NULL, 'intermediate', 3),
  ('I saw Susie sitting in a shoeshine shop.', NULL, 'intermediate', 3),
  ('Fuzzy Wuzzy was a bear. Fuzzy Wuzzy had no hair.', NULL, 'intermediate', 2),
  ('A big black bear sat on a big black rug.', NULL, 'intermediate', 2),
  ('Which wristwatch is a Swiss wristwatch?', NULL, 'intermediate', 3),
  ('Can you can a can as a canner can can a can?', NULL, 'intermediate', 3),
  ('Thirty-three thirsty, thundering thoroughbreds.', NULL, 'intermediate', 3),
  ('Whether the weather is warm, whether the weather is hot.', NULL, 'intermediate', 3),
  ('If a dog chews shoes, whose shoes does he choose?', NULL, 'intermediate', 3),
  -- Advanced
  ('The sixth sick sheiks sixth sheeps sick.', '/ðə sɪksθ sɪk ʃiːks sɪksθ ʃiːps sɪk/', 'advanced', 5),
  ('Pad kid poured curd pulled cod.', NULL, 'advanced', 5),
  ('Brisk brave brigadiers brandished broad bright blades.', NULL, 'advanced', 4),
  ('Six Czech cricket critics.', NULL, 'advanced', 4),
  ('Imagine an imaginary menagerie manager managing an imaginary menagerie.', NULL, 'advanced', 5),
  ('Fred fed Ted bread and Ted fed Fred bread.', NULL, 'advanced', 4),
  ('The thirty-three thieves thought that they thrilled the throne throughout Thursday.', NULL, 'advanced', 5),
  ('Scissors sizzle, thistles sizzle.', NULL, 'advanced', 4),
  ('A skunk sat on a stump and thunk the stump stunk.', NULL, 'advanced', 4),
  ('Eleven benevolent elephants.', NULL, 'advanced', 4)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE tongue_twisters IS 'Tongue twisters cho Speaking practice, phân theo level và difficulty';
