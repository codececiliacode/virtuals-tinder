const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('mydatabase.db');

db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    university TEXT NOT NULL,
    location REAL NOT NULL
)`);

// Arrays of names and universities
const maleNames = [
  "Michael", "David", "Daniel", "James", "Robert", "William", "Joseph",
  "Charles", "Thomas", "Jaden", "Brandon", "Brendon", "Kenneth",
  "Nicholas", "Ryan", "Cameron", "Jeff", "Marcus", "Joe", 'Jake', 'Bryan',
  'Benedict', 'Tom', 'Justin'
];

const femaleNames = [
  "Emily", "Sarah", "Jessica", "Laura", "Emma", "Olivia", "Sophia",
  "Isabella", "Mia", "Nicole", "Dana", "Angelica", "Mimi", "Jennifer",
  "Susan", "Vicky", "Cassandra", "Cassie", "Olyvia", "Angela", "Georgia",
  'Ashley', 'Carmen'
];

const lastNames = [
  "Lee", "Wang", "Wong", "Nguyen", "Chen", "Li", "Park", "Patel",
  "Zhang", "Liu", "Tan", "Yang", "Huang", "Choi", "Yamamoto", "Singh",
  "Cheng", "Lin", "Chong", "Lim", "Tang", "Chang", "Khor", "Chin", "Low",
  "Lau", "Ta", "Tse"
];

const malaysianUniversities = [
  "Universiti Malaya (UM)", "Universiti Kebangsaan Malaysia (UKM)",
  "Universiti Putra Malaysia (UPM)", "Universiti Sains Malaysia (USM)",
  "Universiti Teknologi Malaysia (UTM)", "Universiti Teknologi MARA (UiTM)",
  "Universiti Pertahanan Nasional Malaysia (UPNM)",
  "Universiti Malaysia Kelantan (UMK)", "Universiti Tunku Abdul Rahman (UTAR)",
  "Monash University Malaysia", "University of Nottingham Malaysia",
  "Taylor's University", "Sunway University", "Multimedia University (MMU)",
  "INTI International University", "Heriot-Watt University Malaysia",
  "SEGi University", "HELP University",
  "Asia Pacific University of Technology & Innovation (APU)", "UCSI University",
  "Limkokwing University of Creative Technology", "MAHSA University",
  "Universiti Tenaga Nasional (UNITEN)", "Universiti Kuala Lumpur (UniKL)",
  "KDU University College", "Nilai University"
];

// Function to get a random element from an array
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Function to generate random user data
const generateRandomUser = () => {
  const gender = Math.random() > 0.5 ? 'male' : 'female';
  const firstName = gender === 'male' ? getRandomElement(maleNames) : getRandomElement(femaleNames);
  const lastName = getRandomElement(lastNames);
  const university = getRandomElement(malaysianUniversities);
  const location = (Math.random() * 9.5 + 0.5).toFixed(1); // Random float between 0.5 and 10
  let name = firstName + ' ' + lastName
  return { name, university, location, gender };
};

const insertUser = (user) => {
  db.run(`INSERT INTO users (name, gender, location, university) VALUES (?, ?, ?, ?)`,
    [user.name, user.gender, user.location, user.university],
    function (err) {
      if (err) {
        console.error(err.message);
      } else {
        console.log(`Inserted user with ID: ${this.lastID}`);
      }
    });
};

for (let i = 0; i < 100; i++) {
  const user = generateRandomUser();
  insertUser(user);
}

db.close();
