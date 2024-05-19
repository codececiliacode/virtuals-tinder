const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('mydatabase.db');

// Function to generate random interests
function generateRandomInterests() {
  const interests = ['Bouldering', 'Music', 'Travel', 'Foodie', 'Coding', 'Fashion', 'Bookworm', 'Yoga', 'Gaming', 'Outdoors', 'Fishing', 'Whiskey', 'Beer', 'Wine', 'Golfing', 'Dogs', 'Cats', 'Movies'];
  const numInterests = Math.floor(Math.random() * 6) + 1; // Random number of interests (1 to 6)
  const randomInterests = new Set();

  while (randomInterests.size < numInterests) {
    const interest = interests[Math.floor(Math.random() * interests.length)];
    randomInterests.add(interest);
  }

  return Array.from(randomInterests).join(',');
}

// Update all users with random interests
db.all('SELECT * FROM users', (err, users) => {
  if (err) {
    console.error(err.message);
    return;
  }

  users.forEach(user => {
    const interests = generateRandomInterests();
    db.run('UPDATE users SET interests = ? WHERE id = ?', [interests, user.id], function (err) {
      if (err) {
        console.error(`Error updating user with ID ${user.id}: ${err.message}`);
      } else {
        console.log(`Interests added for user with ID ${user.id}`);
      }
    });
  });
});

db.close();
