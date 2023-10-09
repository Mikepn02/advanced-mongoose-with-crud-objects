const fs = require('fs')
const Tour = require("./../models/tourModel")

exports.checkId = (req ,res ,next ,val) => {
    console.log(`Tour id is: ${val}`)
    if(req.params.id * 1 > tours.length ){
        return res.status(404).json({
            status:'fail',
            message : "invalid id:  "
        })
    }

    next();
}

exports.checkBody = ( req ,res ,next) => {
    if(!req.body.name || !req.body.price) {
        res.status(400).json({
            status:'fail',
            messages: 'Missing name or price'
        })
    }
    next();
}

exports.updateTours =(req,res) => {
    const id = req.params.id * 1
    const tourIndex = tours.findIndex(el => el.id === id);

    if(tourIndex === -1){
        return res.status(404).json({
            status:'fail',
            message : "invalid id:  " + id
        })
    }
    const updatedTour = {
        id: id,
        ...tours[tourIndex],
        ...req.body
    };


    tours[tourIndex] =  updatedTour;
    const existingTourObject = tours.findIndex(edl => el.id === id);
    if(existingTourObject === -1){
        tours.push(updatedTour)
    }
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,JSON.stringify(tours),err => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                message: 'Error writing to file'
            });
        }
        res.status(200).json({
           status: "success",
           data: {
               tours: tours[tourIndex]
           }
        })
    })
}

exports.getAllTours = (req ,res) => {
    res.status(200).json({
     status:'success',
     requestedAt: req.requestTime,
    })
 }
exports.createTour = (req ,res) => {
    // console.log(req.body)
    const newId = tours[tours.length -1].id + 1;
    const newTour = Object.assign({ id: newId}, req.body)


    tours.push(newTour);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,JSON.stringify(tours),err => {
        res.status(201).json({ 
            status: 'success',
            data:{
                tour: newTour
            }
         })
    })

}
exports.getTour = (req ,res) => {
    const id = req.params.id * 1;
    // const tour = tours.find(el => el.id === id);
    // res.status(200).json({
    //  status:'success',
    //  data:{
    //      tours: tour
    //  }
    // })
 }
 
exports.deleteTour = (req,res) => {
    if (req.params.id * 1 > tours.length) {
        return res.status(404).json({
            status:'fail',
            message: "invalid id"
        })
        
    }

    res.status(204).json({
        status:'success',
        data: null
    })
}