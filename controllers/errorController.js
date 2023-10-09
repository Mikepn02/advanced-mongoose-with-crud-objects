const mongoose = require('mongoose');
const AppError = require('../utils/AppError');



module.exports = (err, req, res, next) => {
    if (err instanceof mongoose.Error.CastError) {
        return res.status(400).json({ error: `Invalid ${err.path} : ${err.value}` })
    }
    if (err.code === 11000 || err.code === 11001) {
        const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
        const message = `Duplicate field  ${value} , Please use another value`
        const appError = new AppError(message , 400)
        return  res.status(appError.statusCode).json({message:appError.message})
    
    }
    if(err instanceof mongoose.Error.ValidationError) {
        const errors = Object.values(err.errors).map(el => el.message)
        return res.status(400).json({error: `Invalid input data. ${errors.join('. ')}`})
    }

    if (err.name === 'JsonWebTokenError') {
        const message = "invalid token!! please log in again" 
        const appError = new AppError(message , 401)
        return res.status(appError.statusCode).json({ status: appError.status,message: appError.message})
    } 
    if (err.name === 'TokenExpiredError') {
        const message = "Your token has expired. Please log in again!" 
        const appError = new AppError(message , 401)
        return res.status(appError.statusCode).json({ status: appError.status,message: appError.message})
    } 


    const statusCode = err.statusCode || 500
    const appError = new AppError(err.message,statusCode , err.name)
    res.status(statusCode).json({
        error:appError,
        stack: err.stack
        })
}