const express = require("express")
const app = express();
const fs = require('fs');
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean');
const hpp = require('hpp')
const helmet = require('helmet')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes');
const AppError = require("./utils/AppError");
const globalErrorHandler = require('./controllers/errorController')


app.use(helmet())
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

// body parser reading data from req.body
app.use(express.json());
app.use(express.static(`${__dirname}/public`))
app.use((req ,res , next) =>  {
    req.requestTime = new Date().toISOString();
    // console.log(req.headers)
    next()
})

const limiter = rateLimit({
    max: 100,
    windowMs: 60* 60 * 1000,
    message: "Too many request from this IP , please try again in an hour"

});
app.use('/api',limiter);

// body parser reading data from req.body
app.use(express.json({ limit : '10kb'}))

// data sanitization against cross sql injection
 app.use(mongoSanitize()); // this will remove all those mongoose operators like $
 app.use(xss()); // this will clean any input from  malcious html code

 //prevent parameter pollution

 app.use(hpp({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
]
 }));

app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);

app.all('*', (req ,res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`))
});

app.use(globalErrorHandler);





module.exports = app;