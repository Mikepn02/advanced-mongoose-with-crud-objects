const mongoose = require('mongoose');
const fs = require('fs')
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel')
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DB = process.env.DATABASE_LOCAL;

mongoose.connect(DB , {
    useNewUrlParser: true,
    useUnifiedTopology: true,

})
.then((con) => {
    console.log("DB successfully connected!!")
})
.catch((err) => {
    console.log("Error connecting to MongoDB:", err.message);
  });


const tours = JSON.parse(fs.readFileSync("tours-simple.json","utf-8"));

const importData = async() => {
    try{
     await Tour.create(tours);
     console.log("Data successfully loaded")
     process.exit();
    }catch(err){
      console.log(err);
    }
}

const deleteData = async() => {
    try{
        await Tour.deleteMany();
        console.log("Data successfully Deleted");
        process.exit();
       }catch(err){
         console.log(err);
       }
}


if(process.argv[2] === '--import'){
  importData();
}
else if(process.argv[2] === '--delete'){
  deleteData();
}

// console.log(process.argv);