// const mongoose = require('mongoose');

// const invoiceSchema = new mongoose.Schema({
//   names:{
//     type:String,
//     required:[true,'a client must have names'],
//     // unique:true
//   },
//   location:{
//     type:String,
//     required:[true,'a client must have location'],

//   },
//   creditnumber:{
//     type:Number,
//     required:[true,'a client must have creditnumber'],
//   },
//   Restaurant:{
//     type:String,
//     required:[true,'a client must choose Restaurant'],
//   },
//   Date:{
//     type:Date,
//     required:[true,'a client must choose Date'],
//     default:Date.now()
//   },
//   TimeRanges:{
//     type:String,
//     required:[true,'a client must choose the time for delivery'],
//   }
  
// })
// const Invoice = mongoose.model('invoice',invoiceSchema)
// // const testInvoice= new invoice({
// //   names:"Mbab",
// //   location:"Kicukiro",
// //   creditnumber:45678934520243,
// //   Restaurant:"five to five",
// //   TimeRanges:"Dinner"
// // });
// // testInvoice.save().then(data =>{
// //   console.log(data);
// // }).catch(err =>{
// //   console.log(err.message )
// // })

// module.exports = Invoice;


