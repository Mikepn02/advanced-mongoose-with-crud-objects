const dotenv = require('dotenv')
const mongoose = require('mongoose')

process.on('uncaughtException', err => {
    console.log(err.name , err.message);
    console.log("Uncaught exception🎆! shutting down....");
    process.exit(1);
  
})
const app = require('./app')
dotenv.config()
const DB = process.env.DATABASE_LOCAL;

mongoose.connect(DB , {
    useNewUrlParser: true,
    useUnifiedTopology: true,

})
.then((con) => {
    console.log("DB successfully connected!!")
})



const port = process.env.PORT || 3000
const server = app.listen(port, () => {
    console.log(`App is running on port ${port}...`)
});

process.on('unhandledRejection', err => {
    console.log(err.name , err.message);
    console.log("Unhandled rejection🎆! shutting down....");
    server.close(() => {
        process.exit(1)
    })
})



