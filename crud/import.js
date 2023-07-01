const fs= require('fs')
const info = require('./models/crudmodel')
const mongoose=require('mongoose')
const dotenv = require('dotenv')
 
const DB=dotenv.env.DATABASE
.replace('<PASSWORD',
process.env.DATABASE_PASSWORD);
mongoose.
connect(DB,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})