const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const {urlencoded} = require('express');
const methodOverride = require('method-override');
const morgan = require('morgan');

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
const res = require('express/lib/response');


//Connexion à la Base de données
mongoose.set('strictQuery', true);
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
app.use(express.static(path.join(__dirname, 'public')));
//app.use(morgan('dev'));

const sessionConfig = {
  secret : 'thisisnotagoodsecret',
  resave : false,
  saveUninitialized : true,
  cookie : {
    httpOnly: true,
    expires : Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge : 1000 * 60 * 60 * 24 * 7
  }
}

app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

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