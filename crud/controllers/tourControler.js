const fs = require('fs');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//validate Body

// exports.checkBody = (req,res,next) =>{
//     if(!req.body.name || !req.body.price){
//         res.status(400).json({
//             status: "fail",
//             message:"Missing name or Price"
//         })
//     }
//     next()
// }

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingQUantity,price';
    req.query.fields = 'name,price,summary,ratingQUantity,difficulty';
    next();
}
exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body);


    res.status(201).json({
        status: "success",
        data: {
            tour: newTour
        }
    })

});
//asynv function returns promises

exports.getAllTours = catchAsync(async (req, res, next) => {


    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const tours = await features.query
    res.status(200).json({
        status: "success",
        results: tours.length,
        data: {
            tours
        }
    })

})

exports.getTours = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id)
    //    Tour.findOne({_id : req.params.id})
    if(!tour){
      return  next(new AppError(`NO tour found with this id: ${req.params.id}`,404))
      // if we pass anything in next it assumes that is error and complete the process👇
      // if new error assumes that it is an error as it passes through next it jumps to globalErrorHandle in the server.js then sends the response
    }
    res.status(200).json({
        status: "success",
        data: tour
    });
})
exports.update = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    if(!tour){
        return  next(new AppError(`NO tour found with this id: ${req.params.id}`,404))
        
      }

    res.status(200).json({
        status: 'succes',
        data: {
            tour
        }
    })
})

exports.delete = catchAsync(async (req, res, next) => {
    await Tour.findByIdAndDelete(req.params.id);
    if(!tour){
        return  next(new AppError(`NO tour found with this id: ${req.params.id}`,404))
        
      }
    res.status(204).json({
        status: "success",
        data: null
    })
})
exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsQuantity: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsQuantity' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
            //$group is use to calculate the average
        },
        {
            $sort: { avgPrice: 1 }
        }
        // ,
        // {
        //     $match:{_id:{$ne:'EASY'}}
        // }

    ]);
    if(!tour){
        return  next(new AppError(`NO tour found with this id: ${req.params.id}`,404))
        
      }
    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    })

})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;//2021
    // *1 is transfrom to a number from string
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        //unwind is used to deconstruct an array from the input document and  then output one field for each element of the array  that will return first element of array
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    //here we want a data that is greater than january first
                    // i.e it must be between 2020 and 2022
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTours: { $sum: 1 },
                tours: { $push: '$name' }
                // here we use push to  add name array in the group


            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: {
                _id: 0
            }
            // this means id no longer shows up while make request
        },
        {
            $sort: {
                numTours: -1
            }
        },
        {
            $limit: 12
        }
    ])
    if(!tour){
        return  next(new AppError(`NO tour found with this id: ${req.params.id}`,404))
        
      }
    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    })
})