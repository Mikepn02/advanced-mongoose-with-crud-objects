const express = require('express')
const tourController = require('../controllers/tourControler')
const router = express.Router()


// router.post(tourController.checkBody,tourController.checkBody)
router.get('/top-5-cheap',tourController.aliasTopTours,tourController.getAllTours)
router.get('/tour-stats',tourController.getTourStats)
router.get('/monthly-plan/:year',tourController.getMonthlyPlan)
router.post('/create',tourController.createTour)
router.get('/getAll',tourController.getAllTours)
router.get('/getOne/:id',tourController.getTours)
router.patch('/update/:id',tourController.update)
router.delete('/delete/:id',tourController.delete)
module.exports =  router 