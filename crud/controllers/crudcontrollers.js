const { query } = require("express");
const fs = require("fs");
const info = require("../models/crudmodel");

// this exports was used in showing id using the middleware
// exports.checkId = (res,req,next,val) =>{
//     consolele.log(`Tour id is ${val}`);
//     if(req.params.id *1 > info.length){
//         res.status(404).json({
//             status:'fail',
//             message: 'invalid id'
//         });
//     }
//     next();
// }
// exports.checkBody = (req,res,next) =>{
//     if(!req.body.username || !req.body.password){
//         res.status(404).json({
//             status:'fail',
//             message:'Missing the email and the passowrd'
//         })
//     }
//     next();
// }

exports.getAllInfo = async (req, res) => {
  try {
    // console.log(res.requestTime);
    // console.log(req.params)
    // const id =req.params.id
    const Info = await info.find();
    res.status(200).json({
      status: "successful",
      // requestedAt:req.requestTime,
      results: Info,
      data: {
        info,
      },
      // results:info.length
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error,
    });
  }
};
//params :is a property of the req object that contains the parameters sent in the request. Parameters are usually specified in the URL, such as /users/:userId
exports.getInfo = async (req, res) => {
  try {
    console.log(req.params);
    const id = req.params.id;
    const Info = await info.findById(id);
    // Info.findOne({_id:req.params.id})
    res.status(200).json({
      status: "success",
      data: {
        Info,
      },
    });
  } catch (err) {
    console.log(err.message);
  }
};
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
// we need another fn functionn to parse the error so that it can be handled
//fn means a function
exports.createInfo = catchAsync(async (req, res, next) => {
  const newInfo = await info.create(req.body);
  // here we directly call the method to info to create new document

  res.status(201).json({
    status: "success",
    data: {
      info: newInfo,
    },
  });
});

exports.updateInfo = async (req, res) => {
  try {
    const Info = await info.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        Info,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
// exports.deleteInfo = async(req,res)=>{
//     const Info =  await  info.findOneAndDelete(req.params.credit)
//     try{
//         res.status(204).json({
//         status:'success',
//         data:'null'
//     })
//     }catch(err){
//         res.status(400).json({
//             status:'fail',
//             message:err.message
//         })
//     }

// }
exports.deleteInfo = async (req, res) => {
  try {
    const credit = req.params.credit;
    const result = await info.deleteOne({ credit: credit });
    if (result.deletedCount > 0) {
      res.status(204).json({
        status: "success",
        data: null,
      });
    } else {
      res.status(404).json({
        status: "fail",
        message: "Record not found",
      });
    }
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.submitInfo = async (req, res) => {
  try {
    const { names, location, credit, date, time } = req.body;

    const newInfo = new info({
      names,
      location,
      creditnumber: credit,
      Restaurant,
      Date: date,
      TimeRanges: time,
    });

    await newInfo.save();
    res.redirect("/submissions");
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

