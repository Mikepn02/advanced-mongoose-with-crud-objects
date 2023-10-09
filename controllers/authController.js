const crypto = require('crypto')
const User = require("../models/userModel")
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/email');
const jwt = require('jsonwebtoken');
const { log } = require('console');

const signToken = (id) => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60* 60* 1000),
        secure: true,
        httpOnly: true // this protect the browser so that it can not be updated by the browser
    };

    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt',token ,cookieOptions);
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
}



exports.signup = catchAsync(async (req, res, next) => {
    // const newUser = await User.create({
    //     name: req.body.name,
    //     email: req.body.email,
    //     password: req.body.password,
    //     passwordConfirm: req.body.passwordConfirm
    // });

    const newUser = await User.create(req.body)
    createSendToken(newUser, 201, res);
})
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body

    // 1 check if email exist

    if (!email || !password) {
        return next(new AppError("Please provide email and password!", 400))
    }

    // 2. check if the email and password are correct

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError("Incorect email or password", 401))
    }

    // sending token to the user

    createSendToken(user , 200 , res)


});




exports.forgotPassword = catchAsync(async (req, res, next) => {
    // get user based on posted email

    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return next(new AppError("There is no user with the email address", 404));
    }

    // generateRandom token

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });


    //send back as email

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password 
    and passwordConfirm to: ${resetURL}.\n if you didn't forgot the password please ignore this email!`;
    try {

        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message
        })

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        })
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false })

        return next(new AppError('There was an error sending the email. Try again later!!', 500))
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // get user based on the token

    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex')

    console.log("hasedToken:", hashedToken)



    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });
    if (!user) {
        return next(new AppError("Token is invalid or has expired", 400))
    }
    


    // if token has not expired and there is user , set new password


    user.password = req.body.password;
    user.password = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    //  update changedPasswordAt property for the user
    await user.save({ validateBeforeSave: false });


    // log in the user in and send jwt
   createSendToken(user , 200 , res );
});


exports.updatePassword = catchAsync(async (req, res, next) => {
    //get  user from the collection
    const user = await User.findById(req.user.id).select('+password');
    // 2 check if the posted password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError("Your current password is wrong", 401))
    }
    // if so update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm

    await user.save();


    // log user and send jwt

    createSendToken(user , 200 , res )
})


