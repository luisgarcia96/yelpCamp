const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const {campgroundSchema, reviewSchema} = require('./validationSchemas');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');
const {urlencoded} = require('express');
const methodOverride = require('method-override');
const morgan = require('morgan');

//Connexion à la Base de données
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/yelp-camp');
  console.log('Database Connected!')
}

const app = express();
const port = 3000


//Configuration générale pour l'application Express
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(urlencoded({extended: true}));
app.use(methodOverride('_method'));
//app.use(morgan('dev'));

const validateCampground = (req, res, next) => {
  
  const {error} = campgroundSchema.validate(req.body);
  if(error){
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
}

const validateReview = (req, res, next) => {
  const {error} = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
}



app.get('/', (req, res) => {
  res.render('home.ejs');
})

app.get('/campgrounds', catchAsync(async (req, res) => {
  const allCampgrounds = await Campground.find({});
  res.render('campgrounds/index.ejs', {
    allCampgrounds
  });
}))

app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new.ejs');
})

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
  // if (!req.body.campground) {
  //   throw new ExpressError('Invalid campground data', 400);
  // }
  const newCampground = new Campground(req.body.campground);
  await newCampground.save();
  res.redirect(`/campgrounds/${newCampground._id}`)
}))

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id).populate('reviews');
  res.render('campgrounds/show.ejs', {
    campground
  });
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id);
  res.render('campgrounds/edit.ejs', {
    campground
  });
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground
  });
  res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
  const {id} = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect('/campgrounds');
}))

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id);
  const review = new Review(req.body.review);
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
}))

app.all('*', (req, res, next) => {
  next(new ExpressError('Page not found', 404))
})

app.use((err, req, res, next) => {
  const {statusCode = 500} = err;
  if (!err.message) {
    err.message = 'Oh no, Something went wrong!'
  }
  res.status(statusCode).render('error.ejs', {err});
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})