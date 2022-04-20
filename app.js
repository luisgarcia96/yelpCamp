const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const {urlencoded} = require('express');
const methodOverride = require('method-override');
const morgan = require('morgan');

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');


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


app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

app.get('/', (req, res) => {
  res.render('home.ejs');
})

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