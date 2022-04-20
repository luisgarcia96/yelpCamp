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

const campgrounds = require('./routes/campgrounds');

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


const validateReview = (req, res, next) => {
  const {error} = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
}

app.use('/campgrounds', campgrounds);

app.get('/', (req, res) => {
  res.render('home.ejs');
})


app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id);
  const review = new Review(req.body.review);
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
  const {id, reviewId} = req.params;
  await Campground.findByIdAndUpdate(id, {$pull: {reviews : reviewId}});
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/campgrounds/${id}`);
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