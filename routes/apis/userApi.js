const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const moment = require('moment');

const db = new sqlite3.Database('mydatabase.db');

function calculateSimilarityScore(user1, user2) {
  let score = 0;
  if (user1.university === user2.university) {
    score += 10; // Higher weight for same university
  }

  const interests1 = user1.interests.split(',');
  const interests2 = user2.interests.split(',');
  const commonInterests = interests1.filter(interest => interests2.includes(interest)).length;
  score += commonInterests * 3; // Weight for common interests

  return score;
}

router.get('/recommendations/:userId', (req, res) => {
  const userId = req.params.userId;

  // Get the current user
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, currentUser) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (!currentUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get the current date
    const currentDate = moment().utcOffset(-8);
    const currentDay = currentDate.date();
    const currentMonth = currentDate.month() + 1; // Months are 0-indexed

    // Fetch the latest stored recommendations for the user
    db.get('SELECT * FROM recommendations WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [userId], (err, storedRecommendations) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Check if there are stored recommendations
      if (storedRecommendations) {
        console.log('stored recs')
        // Extract the day and month from the stored recommendations' created_at timestamp
        const storedDay = new Date(storedRecommendations.created_at).getDate();
        const storedMonth = new Date(storedRecommendations.created_at).getMonth() + 1;

        // Check if it's the next day after the stored recommendations' created_at date
        console.log('day', currentDay, storedDay)
        console.log('month', currentMonth, storedMonth)
        if (currentDay !== storedDay || currentMonth !== storedMonth) {
          console.log('its the next day')
          // Logic to fetch new recommendations...

          // Get all other users
          db.all('SELECT * FROM users WHERE id != ?', [userId], (err, users) => {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }

            // Calculate similarity scores for all users
            const userScores = users.map(user => ({
              user,
              score: calculateSimilarityScore(currentUser, user)
            }));

            // Sort users by score and add some randomness
            userScores.sort((a, b) => b.score - a.score || Math.random() - 0.5);

            // Select top 10 users with scores
            let recommendations = userScores.slice(0, 10).map(us => us.user);
            let additionalUsers = userScores.slice(10, 20).map(us => us.user);

            // Fetch additional 5 users without scores
            const usersWithoutScores = users.filter(user => !userScores.some(us => us.user.id === user.id));

            // Add some randomness and select 5 users without scores
            usersWithoutScores.sort(() => Math.random() - 0.5);
            const additionalUsersWithoutScores = usersWithoutScores.slice(0, 5);

            // Append additional users without scores to the list of recommendations
            recommendations = [...additionalUsersWithoutScores, ...recommendations, ...additionalUsers];

            // Store additional users without scores in the database
            recommendations.forEach(userWithoutScore => {
              db.run(
                'INSERT INTO recommendations (user_id, recommended_user_id) VALUES (?, ?)',
                [userId, userWithoutScore.id],
                function (err) {
                  if (err) {
                    console.error('Error inserting recommendation:', err);
                  } else {
                    console.log('Recommendation inserted successfully');
                  }
                }
              );
            });

            // Send the recommendations to the client
            res.json(recommendations);
          });
        } else {
          console.log('not next day');
          // Return stored recommendations as they are up to date
          db.all('SELECT recommended_user_id FROM recommendations WHERE user_id = ?', [userId], (err, rows) => {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }

            // Extract recommended user IDs from rows
            const recommendedUserIds = rows.map(row => row.recommended_user_id);

            // Array to store promises of database queries
            const queries = recommendedUserIds.map(userId => {
              return new Promise((resolve, reject) => {
                db.all('SELECT * FROM users WHERE id = ?', [userId], (err, users) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(users[0]); // Assuming only one user is returned for each ID
                  }
                });
              });
            });

            // Execute all promises concurrently
            Promise.all(queries)
              .then(recommendations => {
                res.json(recommendations);
              })
              .catch(error => {
                res.status(500).json({ error: error.message });
              });
          });
        }


      } else {
        console.log('no stored recs')
        // Get all other users
        db.all('SELECT * FROM users WHERE id != ?', [userId], (err, users) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }

          // Calculate similarity scores for all users
          const userScores = users.map(user => ({
            user,
            score: calculateSimilarityScore(currentUser, user)
          }));

          // Sort users by score and add some randomness
          userScores.sort((a, b) => b.score - a.score || Math.random() - 0.5);

          // Select top 10 users with scores
          let recommendations = userScores.slice(0, 10).map(us => us.user);

          // Fetch additional 5 users without scores
          const usersWithoutScores = users.filter(user => !userScores.some(us => us.user.id === user.id));

          // Add some randomness and select 5 users without scores
          usersWithoutScores.sort(() => Math.random() - 0.5);
          const additionalUsersWithoutScores = usersWithoutScores.slice(0, 5);

          // Append additional users without scores to the list of recommendations
          recommendations = [...additionalUsersWithoutScores, ...recommendations];

          // Store additional users without scores in the database
          recommendations.forEach(userWithoutScore => {
            db.run(
              'INSERT INTO recommendations (user_id, recommended_user_id) VALUES (?, ?)',
              [userId, userWithoutScore.id],
              function (err) {
                if (err) {
                  console.error('Error inserting recommendation:', err);
                } else {
                  console.log('Recommendation inserted successfully');
                }
              }
            );
          });
          res.json(recommendations);
        });
      }
    });
  });
});


// Route to get all users
router.get('/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ users: rows });
  });
});

// Route to get a user by ID
router.get('/user/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

// Route to create a new user
router.post('/users', (req, res) => {
  const { name, email, address, phone_number, birthdate } = req.body;
  db.run(`INSERT INTO users (name, email, address, phone_number, birthdate) VALUES (?, ?, ?, ?, ?)`,
    [name, email, address, phone_number, birthdate],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ user: { id: this.lastID, name, email, address, phone_number, birthdate } });
    });
});

// // Route to update a user by ID
// router.put('/users/:id', (req, res) => {
//   const id = req.params.id;
//   const { name, email, address, phone_number, birthdate } = req.body;
//   db.run(`UPDATE users SET name = ?, email = ?, address = ?, phone_number = ?, birthdate = ? WHERE id = ?`,
//     [name, email, address, phone_number, birthdate, id],
//     function (err) {
//       if (err) {
//         res.status(500).json({ error: err.message });
//         return;
//       }
//       res.json({ message: `User with ID ${id} updated` });
//     });
// });

// Route to delete a user by ID
router.delete('/users/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: `User with ID ${id} deleted` });
  });
});


// // Alter the users table to add the interests column
// db.run(`ALTER TABLE users ADD COLUMN interests TEXT`, function (err) {
//   if (err) {
//     console.error(err.message);
//   } else {
//     console.log('Successfully added the interests column to the users table');
//   }
// });

// // Close the database connection
// db.close();

module.exports = router