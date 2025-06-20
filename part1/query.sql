INSERT INTO Dogs (name, size, owner_id)
VALUES ('Max', 'medium', (SELECT user_id FROM Users WHERE username = 'alice123')),
('Bella', 'small', (SELECT user_id FROM Users WHERE username = 'carol123')),
('Luna', 'large', (SELECT user_id FROM Users WHERE username = 'carol123')),
('Bow', 'medium', (SELECT user_id FROM Users WHERE username = 'spongebob')),
('Mayonnaise', 'small', (SELECT user_id FROM Users WHERE username = 'spongebob'));

INSERT INTO WalkRequests (name, size, owner_id)
VALUES ('Max', 'medium', (SELECT user_id FROM Users WHERE username = 'alice123')),
('Bella', 'small', (SELECT user_id FROM Users WHERE username = 'carol123')),
('Luna', 'large', (SELECT user_id FROM Users WHERE username = 'carol123')),
('Bow', 'medium', (SELECT user_id FROM Users WHERE username = 'spongebob')),
('Mayonnaise', 'small', (SELECT user_id FROM Users WHERE username = 'spongebob'));