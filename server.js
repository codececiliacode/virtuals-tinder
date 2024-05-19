const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

app.use(bodyParser.json());

// User API routes
app.use('/api', require('./routes/apis/userApi'));


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
