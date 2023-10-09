const fs = require('fs')
const Tour = require("./../models/tourModel")

exports.aliasTopTours = (req ,res , next) => {
    req.query.limit = 5;
    req.query.sort = "-ratingsAverage ,price";
    req.query.fields = "name,price ratingsAverage,summary,difficulty";
    next();

}

exports.getAllTours = async (req, res) => {
    try {

        // 1) filtering

        const queryObj = {...req.query}
        const excludeFields = ['page','sort','limit','fields'];
        excludeFields.forEach(el => delete queryObj[el]);


        let queryString = JSON.stringify(queryObj)
        queryString = queryString.replace(/\b(gte|lte|lt|gt)\b/g ,match => `$${match}`);
        let query = Tour.find(JSON.parse(queryString))
        
        // 2) sort

        if(req.query.sort) {
          const soryBy = req.query.sort.split(",").join(' ');
          query = query.sort(soryBy)
        }else {
            query = query.sort('-createdAt')
        }


        // 3) limiting the fields

        if(req.query.fields) {
            const fields = req.query.fields.split(",").join(' ');
            query = query.select(fields)
        }else {
            query = query.select('-__v');
        }

        //4) pagination 


        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 100;
        const skip = (page - 1) * limit
        query = query.skip(skip).limit(limit)
        
        if(req.query.page) {
            const numTours = await Tour.countDocuments();
             if (skip >= numTours) throw new Error(" Page does not exit 😩 ")
        }

        const tours = await query
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours
            }
        })
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message
        })
    }
}
exports.createTour = async (req, res) => {
    try {
        const newTour = await Tour.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        })
    }

}
exports.getTour = async(req, res) => {
    try {
        const id = req.params.id
        const tour = await Tour.findById(id)


        res.status(200).json({
            status:'success',
            data:{
                tour
            }
        })

    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message
        })
    }
}

exports.deleteTour = async(req, res) => {

try{
    const id = req.params.id;
   await  Tour.findByIdAndDelete(id)
    res.status(204).json({
        status: 'success',
        data: null
    })
}catch(err){
  res.status(404).json({
    status:'fail',
    message:err.message
  })
}
}
exports.updateTour = async(req ,res) => {
  try{
    const id = req.params.id
    const tour = await Tour.findByIdAndUpdate(id , req.body ,{
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
        stauts:'success',
        data:{
            tour
        }
    })

  }catch(err){
    res.status(404).json({
        status:'fail',
        message: err.message
    })
  }

}