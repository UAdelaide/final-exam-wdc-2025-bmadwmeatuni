INSERT INTO Dogs (name, size, owner_id)
VALUES ('Max', 'medium', SELECT user_id FROM Users WHERE username = 'alice123'),
('Bella', 'small', SELECT user_id FROM Users WHERE username = 'carol123'),
('Luna', 'small', SELECT user_id FROM Users WHERE username = 'carol123'),