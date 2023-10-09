const fs = require('fs')
const Tour = require("./../models/tourModel")
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/AppError');
const asyncHandler = require('express-async-handler')

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = 5;
    req.query.sort = "-ratingsAverage ,price";
    req.query.fields = "name,price ratingsAverage,summary,difficulty";
    next();

}
exports.getAllTours = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const tours = await features.query;

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    })
})
exports.createTour = asyncHandler(async (req, res, next) => {
        const newTour = await Tour.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })


});
exports.getTour = catchAsync(async (req, res, next) => {
    const id = req.params.id
    const tour = await Tour.findById(id)
    if (!tour) {
        return next(new AppError("No tour found with that ID", 404))
    }
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
})

exports.deleteTour = catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const tour = await Tour.findByIdAndDelete(id)
    if (!tour) {
        return next(new AppError("No tour found with that ID", 404))
    }
    res.status(204).json({
        status: 'success',
        data: null
    })
})
exports.updateTour = catchAsync(async (req, res, next) => {
    const id = req.params.id
    const tour = await Tour.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
    });
    if (!tour) {
        return res.status(404).json({
            status: 'fail',
            message: 'Tour not found',
        });
    }
    res.status(200).json({
        stauts: 'success',
        data: {
            tour
        }
    })
})

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAvergae' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        },
        //   {$match: {_id:{$ne: 'EASY'}}}
    ])

    res.status(200).json({
        stauts: 'success',
        data: {
            stats
        }
    })

})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'  // / unwind is used to deconstruct array into multiple document
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        }, {
            $project: {
                _id: 0
            }
        },
        {
            $sort: { numTourStarts: -1 }
        },
        {
            $limit: 6
        }
    ]);
    res.status(200).json({
        stauts: 'success',
        data: {
            plan
        }
    })

})