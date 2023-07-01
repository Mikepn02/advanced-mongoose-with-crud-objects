const jwt = require('jsonwebtoken')
const User = require('./../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError');
const signToken = id =>{
    return jwt.sign({id} ,process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN
    
    }) 
}
// fn is asynchronous function
exports.signup = catchAsync(async(req,res,next)=>{
const newUser = signToken(newUser._id)
await User.create(req.body);
res.status(201).json({
    status:'success',
    token,
    data:{
        user:newUser
    }
})


})



exports.login = catchAsync( async (req,res,next) =>{
    const {email , password} = req.body;
    
// 1) check if email and password 
if(!email || !password){
    // here we have to return  because if we call next() middleware we have to make sure that the function finishes
 return next(new AppError('please provide email and the password',400));
    
}
//2) check if the user exists && password is correct
// we use select  in order to check if the password is correct when the user logged in 
const user = await User.findOne({email }).select('+password');
// const correct = user.correctPassword(password,user.password)
if(!user || !await user.correctPassword(password,user.password)){
    return next(new AppError('incorrect email or password',401))
}

const token = signToken(user._id);
res.status(200).json({
    status:'success',
    // message:err.message,
    token
}); 
});


//2) check if the user exists && and the password is correct

//3 if everything okay , send token to the client


