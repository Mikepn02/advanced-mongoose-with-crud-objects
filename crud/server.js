const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const express = require('express');
const app = express();
const router = require('./routes/tourRoutes')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errControllers')

app.use(express.json())
app.use(express.static(`${__dirname}/public`));
app.use('/api/v1/tours',router);



// Load environment variables
app.all('*',(req,res,next) =>{

  next(new AppError(`can't find ${req.originalUrl} on this server!!`,404));
  // it will skip and go to excute the codes below
});

app.use(globalErrorHandler)


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




