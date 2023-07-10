const express = require('express');
const morgan = require('morgan');

const tourRoutes = require('./routes/tourRoutes');
const userRoutes = require('./routes/userRouter');
const { json } = require('body-parser');
const app = express();

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

app.use((req,res,next) => {
   req.requestTime = new Date().toISOString();
   next();
})
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/tours',tourRoutes);
app.use('/api/v1/users',userRoutes)

app.all('*',(req,res,next) =>{
    // res.status(404),json({
    //     status:'fail',
    //     message: `can't find ${req.originalUrl} on this server`
    // })
    const err = new Error(`can't find ${req.originalUrl} on this server!!`);
    err.status = 'fail';
    err.statusCode = 404;

    next(err);
    // it will skip and go to excute the codes below
});

app.use((err,req,res,next) =>{
    err.statusCode = err.statusCode || 500 ;
    err.status = err.status || 'error';

    
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    })
})



module.exports = app;