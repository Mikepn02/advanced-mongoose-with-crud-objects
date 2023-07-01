const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A tour must have a name "],
    unique: true,
    maxlength: [40, 'A tour name must have less or equal then 40 characters'],
    minlength: [10, 'A tour must have atleast name with 10 characters'],
    validate: [validator.isAlpha,"Tour name must only contain characters"]
  },
  slug: String,
  duration: {
    type: "number",
    required: [true, "A tour must have a duration"]
  },
  maxGroupSize: {
    type: "number",
    required: [true, "A tour must have a group size"]
  },
  difficulty: {
    type: String,
    required: [true, "a tour must have a difficulty"],
    enum: {
       values:["easy","medim","difficult"],
       message:"difficulty is either easy,medium or difficult"
    }
  },
  ratingsQuantity: {
    type: Number,
    default: 4.5
  },
  ratingsAverage: {
    type: Number,
    default: 5,
    min:[1,"rating must be above 1.0"],
    max:[5,"raing must be below 5.0"]
  },
  price: {
    type: Number,
    required: true
  },
  priceDiscount:{
    type:Number,
    validate:function(val){
      // this only points on cuurent doc on new Document creation
      return val < this.price;
    },
    message: "a discount price({value }) should be below regular price"
  },
  summary: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, "A tour must have a cover images"]
  },
  images: [String],
  createAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false
  }

},
  {
    toJSON: { virtuals: true },
    // this means that in every case we output the data as json  then virtuals be true
    toObject: { virtuals: true }
  });
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
})

// DOCUMENT MIDDLWARE runs after .save() command and .create() .insertMany()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
})
tourSchema.pre('save', function (next) {
  console.log('will save the document');
  next();
})
tourSchema.post('save', function (doc, next) {
  // console.log(doc);
  next();
})

//QUERY MIDDLEWARE runs after .find()
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } })
  this.start = Date.now();
  next();
})
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds `);
  console.log(docs);
  next();
})

// aggregation middleware allow us to add hooks after an aggregation middleware

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
  //unshift  is used to add an element at the beginning of an array , it is build js for arrays
  console.log(this.pipeline())
  next();
});


const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;