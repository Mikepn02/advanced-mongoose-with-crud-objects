const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const express = require('express');
const app = express();
const router = require('./routes/tourRoutes')

app.use(express.json())


// Load environment variables


// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/UsersInfo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.log('Error connecting to MongoDB:', err.message);
});
const port = process.env.PORT || 8800;
app.listen(port, () => {
  console.log(`Server is running on port ${port}....`);
});
app.use('/',router)

