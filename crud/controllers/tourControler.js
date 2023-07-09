const fs = require('fs');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures')

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


exports.createTour = async (req, res) => {

    try {

        // const newTour = new Tour({})
        // newTour.save()

        const newTour = await Tour.create(req.body);


        res.status(201).json({
            status: "success",
            data: {
                tour: newTour
            }
        })

    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err
        })
    }

}

exports.getAllTours = async (req, res) => {


    try {
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
    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err
        })
        console.log(err)
    }

}

exports.getTours = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id)
        //    Tour.findOne({_id : req.params.id})
        res.status(200).json({
            status: "success",
            data: tour
        });
    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err
        })
    }
}
exports.update = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })


        // if (!tour) {
        //     // Handle the case when the document is not found
        //     return res.status(404).json({
        //       status: 'fail',
        //       message: 'Tour not found',
        //     });
        //   }


        res.status(200).json({
            status: 'succes',
            data: {
                tour
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err.message
        })
    }
}

exports.delete = async (req, res) => {
    try {

        await Tour.findByIdAndDelete(req.params.id)
        res.status(204).json({
            status: "success",
            data: null
        })

    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err
        })
    }
}
exports.getTourStats = async (req, res) => {
    try {
        const stats = await Tour.aggregate([
            {
                $match: { ratingsQuantity: { $gte: 4.5 } }
            },
            {
                $group:{
                   _id: {$toUpper:'$difficulty'},
                   numTours:{$sum: 1},
                   numRatings:{$sum:'$ratingsQuantity'},
                   avgRating:{$avg: '$ratingsQuantity'},
                   avgPrice:{$avg:'$price'},
                   minPrice:{$min:'$price'},
                   maxPrice: {$max:'$price'}
                }
                //$group is use to calculate the average
            },
            {
                $sort:{avgPrice:1}
            }
            // ,
            // {
            //     $match:{_id:{$ne:'EASY'}}
            // }
 
        ]);
        res.status(200).json({
            status:'success',
            data:{
                stats
            }
        })

    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err
        })
    }
}

exports.getMonthlyPlan = async(req,res) =>{
   try{
    const year = req.params.year *1;//2021
    // *1 is transfrom to a number from string
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        //unwind is used to deconstruct an array from the input document and  then output one field for each element of the array  that will return first element of array
        {
            $match: {
                startDates:{
                    $gte: new Date(`${year}-01-01`),
                    //here we want a data that is greater than january first
                    // i.e it must be between 2020 and 2022
                    $lte:new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group:{
                _id:{$month:'$startDates'},
                numTours:{$sum:1},
                tours:{$push: '$name'}
                // here we use push to  add name array in the group
             

            }
        },
        {
            $addFields: {month: '$_id'}
        },
        {
            $project:{
                _id:0
            }
            // this means id no longer shows up while make request
        },
        {
            $sort:{
                numTours:-1
            }
        },
        {
            $limit:12
        }
    ])  
    res.status(200).json({
        status:'success',
        data:{
            plan
        }
    })
   }catch (err) {
    res.status(404).json({
        status: "fail",
        message: err
    })
}
}