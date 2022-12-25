const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const {campgroundSchema} = require('../validationSchemas'); 
const {isLoggedIn} = require('../middleware');

const validateCampground = (req, res, next) => {
  
    const {error} = campgroundSchema.validate(req.body);
    if(error){
      const msg = error.details.map(el => el.message).join(',');
      throw new ExpressError(msg, 400);
    } else {
      next();
    }
  }

router.get('/', catchAsync(async (req, res) => {
    const allCampgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs', {
      allCampgrounds
    });
  }))
  
  router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new.ejs');
  })
  
  router.post('/', isLoggedIn ,validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) {throw new ExpressError('Invalid campground data', 400);}
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    req.flash('success', 'Succesfully created a new Campground');
    res.redirect(`/campgrounds/${newCampground._id}`)
  }))
  
  router.get('/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    if (!campground) {
      req.flash('error', 'Cannot find that Campground');
      return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show.ejs', {
      campground
    });
  }))
  
  router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
      req.flash('error', 'Cannot find that Campground');
      return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit.ejs', {
      campground
    });
  }))
  
  router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground
    });
    req.flash('success', 'Succesfully updated Campground!');
    res.redirect(`/campgrounds/${campground._id}`);
  }))
  
  router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Succesfully deleted Campground');
    res.redirect('/campgrounds');
  }))

  module.exports = router;