-- =====================================================
-- Migration 003: Bảng words_of_the_day
-- Mục đích: Curated từ vựng hiển thị trên Dashboard
-- Khi nào sử dụng: GET /user/word-of-the-day
-- =====================================================

CREATE TABLE IF NOT EXISTS words_of_the_day (
  id SERIAL PRIMARY KEY,
  word VARCHAR(100) NOT NULL,
  ipa VARCHAR(200),
  meaning_vi TEXT,
  meaning_en TEXT,
  example TEXT,
  day_index INTEGER UNIQUE -- Ngày trong năm (1-366) để rotate
);

-- Seed data mẫu (30 từ đầu tiên)
INSERT INTO words_of_the_day (word, ipa, meaning_vi, meaning_en, example, day_index) VALUES
  ('serendipity', '/ˌser.ənˈdɪp.ə.t̬i/', 'sự tình cờ may mắn', 'the occurrence of events by chance in a happy way', 'Finding that book was pure serendipity.', 1),
  ('ephemeral', '/ɪˈfem.ər.əl/', 'phù du, tạm thời', 'lasting for only a short time', 'Social media stories are ephemeral by design.', 2),
  ('resilience', '/rɪˈzɪl.i.əns/', 'khả năng phục hồi', 'the ability to recover quickly from difficulties', 'Her resilience helped her overcome many challenges.', 3),
  ('ubiquitous', '/juːˈbɪk.wɪ.təs/', 'có mặt khắp nơi', 'present everywhere', 'Smartphones have become ubiquitous in modern life.', 4),
  ('eloquent', '/ˈel.ə.kwənt/', 'hùng biện, lưu loát', 'fluent or persuasive in speaking or writing', 'She gave an eloquent speech at the conference.', 5),
  ('pragmatic', '/præɡˈmæt.ɪk/', 'thực dụng', 'dealing with things in a practical way', 'We need a pragmatic approach to this problem.', 6),
  ('ambiguous', '/æmˈbɪɡ.ju.əs/', 'mơ hồ, mập mờ', 'open to more than one interpretation', 'The instructions were ambiguous and confusing.', 7),
  ('meticulous', '/məˈtɪk.jə.ləs/', 'tỉ mỉ, cẩn thận', 'showing great attention to detail', 'He is meticulous about his work.', 8),
  ('inevitable', '/ɪˈnev.ɪ.t̬ə.bəl/', 'không thể tránh khỏi', 'certain to happen; unavoidable', 'Change is inevitable in the tech industry.', 9),
  ('versatile', '/ˈvɝː.sə.t̬əl/', 'đa năng', 'able to adapt to many different functions', 'Python is a versatile programming language.', 10),
  ('procrastinate', '/proʊˈkræs.tə.neɪt/', 'trì hoãn', 'to delay doing something', 'Stop procrastinating and start studying!', 11),
  ('empathy', '/ˈem.pə.θi/', 'sự đồng cảm', 'the ability to understand others feelings', 'Good leaders show empathy toward their team.', 12),
  ('diligent', '/ˈdɪl.ə.dʒənt/', 'siêng năng, chăm chỉ', 'having or showing care in work', 'She is a diligent student who always does her homework.', 13),
  ('mundane', '/mʌnˈdeɪn/', 'tầm thường, nhàm chán', 'lacking interest or excitement', 'Even mundane tasks can be done with excellence.', 14),
  ('nostalgia', '/nɑːˈstæl.dʒə/', 'nỗi nhớ, hoài niệm', 'a sentimental longing for the past', 'The old photos filled her with nostalgia.', 15),
  ('candid', '/ˈkæn.dɪd/', 'thẳng thắn, chân thành', 'truthful and straightforward', 'I appreciate your candid feedback.', 16),
  ('tenacious', '/təˈneɪ.ʃəs/', 'kiên trì, bền bỉ', 'tending to keep a firm hold; persistent', 'She was tenacious in pursuing her dreams.', 17),
  ('exquisite', '/ɪkˈskwɪz.ɪt/', 'tinh tế, tuyệt đẹp', 'extremely beautiful and delicate', 'The restaurant served exquisite dishes.', 18),
  ('paradigm', '/ˈper.ə.daɪm/', 'mô hình, khuôn mẫu', 'a typical example or pattern', 'AI is creating a new paradigm in education.', 19),
  ('benevolent', '/bəˈnev.əl.ənt/', 'nhân từ, hay giúp đỡ', 'well-meaning and kindly', 'The benevolent donor supported many charities.', 20),
  ('conundrum', '/kəˈnʌn.drəm/', 'bài toán hóc búa', 'a confusing and difficult problem', 'The scheduling conundrum took hours to solve.', 21),
  ('impeccable', '/ɪmˈpek.ə.bəl/', 'hoàn hảo, không chê vào đâu được', 'without faults or mistakes', 'Her English pronunciation is impeccable.', 22),
  ('lucrative', '/ˈluː.krə.t̬ɪv/', 'sinh lợi, có lãi', 'producing a great deal of profit', 'Tech startups can be very lucrative.', 23),
  ('nonchalant', '/ˌnɑːn.ʃəˈlɑːnt/', 'thờ ơ, bình thản', 'feeling calm and relaxed', 'He seemed nonchalant about the exam results.', 24),
  ('quintessential', '/ˌkwɪn.t̬əˈsen.ʃəl/', 'tiêu biểu, điển hình', 'representing the most perfect example', 'She is the quintessential entrepreneur.', 25),
  ('surreptitious', '/ˌsɝː.əpˈtɪʃ.əs/', 'lén lút, bí mật', 'kept secret especially because disapproved of', 'He took a surreptitious glance at his phone.', 26),
  ('whimsical', '/ˈwɪm.zɪ.kəl/', 'kỳ quặc, bất chợt', 'playfully unusual', 'The artist has a whimsical style of painting.', 27),
  ('zealous', '/ˈzel.əs/', 'nhiệt tình, hăng hái', 'having great energy or enthusiasm', 'She is a zealous advocate for education.', 28),
  ('anomaly', '/əˈnɑː.mə.li/', 'sự bất thường', 'something that deviates from what is standard', 'The data showed an anomaly in the results.', 29),
  ('catalyst', '/ˈkæt̬.əl.ɪst/', 'chất xúc tác, tác nhân', 'something that causes an important event to happen', 'The pandemic was a catalyst for digital transformation.', 30)
ON CONFLICT (day_index) DO NOTHING;

COMMENT ON TABLE words_of_the_day IS 'Từ vựng hàng ngày hiển thị trên Dashboard (rotate theo day_index)';
