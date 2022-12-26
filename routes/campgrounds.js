const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const {isLoggedIn, validateCampground, isAuthor} = require('../middleware');

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
    const newCampground = new Campground(req.body.campground);
    newCampground.author = req.user._id;
    await newCampground.save();
    req.flash('success', 'Succesfully created a new Campground');
    res.redirect(`/campgrounds/${newCampground._id}`)
  }))
  
  router.get('/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id).populate('reviews').populate('author');
    if (!campground) {
      req.flash('error', 'Cannot find that Campground');
      return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show.ejs', {
      campground
    });
  }))
  
  router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
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
  
  router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground
    });
    req.flash('success', 'Succesfully updated Campground!');
    res.redirect(`/campgrounds/${campground._id}`);
  }))
  
  router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Succesfully deleted Campground');
    res.redirect('/campgrounds');
  }))

  module.exports = router;