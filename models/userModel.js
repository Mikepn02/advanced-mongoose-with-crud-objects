const crypto = require('crypto')
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const validator = require('validator')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please tell us your name"]
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide valid email"]
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
            validator: function (el) {
                return el === this.password
            },
            message: "Passwords are not the same!"
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
})
userSchema.pre(/^find/,function(next){
    // this points to the current query
    this.find({active: {$ne : false }});
    next();
})


userSchema.methods.correctPassword = async function (candidatePassword, userPassowrd) {
    return await bcrypt.compare(candidatePassword, userPassowrd);
}

userSchema.methods.changedPasswordAfter = function (JWTTimestap) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime()) / 1000;
        return JWTTimestap < changedTimestamp  // we need to check if the password changed when the token was issued
    }

    //  false means not changed
    return false;
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

        console.log({resetToken},this.passwordResetToken)

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
}

// we should not store  plain text token in db 

userSchema.pre('save',function(next){
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
})

const User = mongoose.model('User', userSchema);

module.exports = User