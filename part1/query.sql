INSERT INTO Dogs (name, size, owner_id)
VALUES ('Max', 'medium', (SELECT user_id FROM Users WHERE username = 'alice123')),
('Bella', 'small', (SELECT user_id FROM Users WHERE username = 'carol123')),
('Luna', 'large', (SELECT user_id FROM Users WHERE username = 'carol123')),
('Bow', 'medium', (SELECT user_id FROM Users WHERE username = 'spongebob')),
('Mayonnaise', 'small', (SELECT user_id FROM Users WHERE username = 'spongebob'));

INSERT INTO WalkRequests (requested_time, duration_minutes, status, location, dog_id)
VALUES ('2025-06-10 08:00:00', 30, 'open', (SELECT dog_id FROM Dogs WHERE name = 'Max')),
