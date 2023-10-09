const AppError = require('../utils/AppError');
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel');



const restrictTo = (...roles) => {
    return (req , res , next) => {
        if(!roles.includes(req.user.role)){
            return next(new AppError("You don't have permission to perfom this action",403))
        }

        next();
    }
}


module.exports = { restrictTo }