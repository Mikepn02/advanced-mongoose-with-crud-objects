const sendErrorDev = (err ,res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack:err.stack
    })
}

const sendErrorPro = (err,res) => {

    //operational ,trust error: sends the message to the client
    if(err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
        // Programming or other unknown error: don;t leak error details
    }else{
        // 1) log error

         console.log('error ❌',err);
         
        //  2) send the generic message

        res.status(500).json({
           status:'error',
           message:'something went wrong! '
        })
}
}

module.exports = ((err,req,res,next) =>{
  
    // console.log(err.stack)
    //stack will show us where the erro happens
  
    err.statusCode = err.statusCode || 500 ;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err,res);
    }else if(process.env.NODE_ENV === 'production'){
        let error = {...err}
    //   if(err.name === 'CastError') err = handleCastErrorDB(err)


        sendErrorPro(err,res);
    }

  })