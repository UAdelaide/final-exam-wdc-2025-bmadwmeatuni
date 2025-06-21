router.get('/api/dogs', async (req, res) => {
  try {
    const [dogs] = await db.execute(`
        SELECT Dogs.dog_id AS DogID, Dogs.name AS Name, Dogs.size AS Size, Users.user_id AS OwnerID
        FROM Dogs JOIN Users ON Dogs.owner_id = Users.user_id
        `);
    res.json(dogs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});