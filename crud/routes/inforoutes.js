const express = require('express')
const crudcontroller = require('../controllers/crudcontrollers')
const router = express.Router();


router.get('/getAll',crudcontroller.getAllInfo)
router.post('/create',crudcontroller.createInfo)
router.post('/info2',crudcontroller.createInfo)

// .route('/:id')
router.get('/info/:id',crudcontroller.getInfo)
router.patch('/update/:id',crudcontroller.updateInfo)
router.delete('/delete/:id',crudcontroller.deleteInfo)

module.exports = router