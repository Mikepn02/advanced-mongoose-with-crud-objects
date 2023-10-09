const mongoose = require('mongoose');
const slugify = require('slugify');
const validator  = require('validator')

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true , ' a tour must have name'],
        unique: true,
        maxlength: [40 , 'A tour name must have less or equal then 40 characters'],
        minlength: [10 , "A tour name must have more or equal then 10 characters"],
        validate: [validator.isAlpha , "Tour must only contain characters"]
    },
    slug : String,
    duration:{
        type: Number,
        required:[true ,"A tour must have a duration"]
   },
    
    maxGroupSize: {
      type: Number,
      required:[true , "A tour must have a group size"]
    },
    difficulty: {
       type: String,
       required: [true , "A tour must have difficulty"],
       enum: {
        values:["easy","medium","difficult"],
        message: 'Difficulty is either: easy , medium , difficulty'
       }
    },
    ratingsAverage:{
        type: Number,
        default: 4.5,
        min: [1,"Rating must be above 1.0"],
        max:[5 , "Rating must be below 5.0"]
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type:Number,
        required:[true , ' a tour must have price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val) {
                return val < this.price
            },
            message: "Discount ({VALUE}) price should be below regular price"
        }
    },
    summary: {
        type: String,
        trim: true,   // trim removes all white space ex:       i am going
        required: [true , "a tour must have a description"]
    },
    description: {
       type: String,
       trim: true
    },
    imageCover: {
        type: String,
        require:[true , 'A tour must have a cover image']
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour:{
        type: Boolean,
        default: false
    }
   
}, {
    toJSON: { virtuals: true},
    toObject: {virtuals: true}

})

// Document middleware : runs before .save() and .create() 
const emoji = "🌲"
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    if (!this.name.endsWith(emoji)) {
      this.slug += emoji;
    }
    next();
  });

// tourSchema.pre('save',function(next){
//     console.log("Will save the document....");
//     next();
// })

// tourSchema.post('save',function(doc, next){ //
//     console.log(doc);
//     next();
// })

// pre middleware runs before the operation, and post middleware runs after the operation


// Query middleware
tourSchema.pre(/^find/,function(next){
    this.find({ secretTour: {$ne : true}});
    this.start = Date.now();
    next();
});

tourSchema.post(/^find/,function(docs , next){
    console.log(`Query took ${Date.now() - this.start} millesconds!!`)
    next()
});

// Aggregation middleware

tourSchema.pre('aggregate',function(next){
    this.pipeline().unshift({ $match : { secretTour: {$ne : true}}})
    console.log(this.pipeline());
    next();
})

tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7
})

const Tour = mongoose.model('Tour' , tourSchema);

module.exports = Tour;
