const { promisify } = require('util')
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync')
const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');


const protectUser = asyncHandler(async (req, res, next) => {

    // 1 getting the token if it exist
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access', 401))
    }

    // 2 verification
      
    // promisify is to convert method that return response using call back function to return using promises

    const decoded = await promisify(jwt.verify)(token , process.env.JWT_SECRET);

    // 3) check if the user still exist

    const freshUser = await User.findById(decoded.id)
    if(!freshUser){
        return next(new AppError("The user belonging to this token does no longer exist",401))
    }
    // 4) check if the user change the password after the token was issued

    if(freshUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError("user recentely changed password! Please log in again.",401))
    }


    // grant access to protected routes

    req.user = freshUser 


    next()
})


module.exports = { protectUser }