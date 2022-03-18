const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const {urlencoded} = require('express');
const methodOverride = require('method-override');


//Connexion à la Base de données
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/yelp-camp');
  console.log('Database Connected!');
}

const app = express();
const port = 3000


//Configuration générale pour l'application Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))


app.use(urlencoded({extended: true}));
app.use(methodOverride('_method'));




app.get('/', (req, res) => {
  res.render('home.ejs');
})

app.get('/campgrounds', async (req, res) => {
  const allCampgrounds = await Campground.find({});
  res.render('campgrounds/index.ejs', {
    allCampgrounds
  });
})

app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new.ejs');
})

app.post('/campgrounds', async (req, res) => {
  const newCampground = new Campground(req.body.campground)
  await newCampground.save();
  res.redirect(`/campgrounds/${newCampground._id}`)
})

app.get('/campgrounds/:id', async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id);
  res.render('campgrounds/show.ejs', {
    campground
  });
})

app.get('/campgrounds/:id/edit', async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id);
  res.render('campgrounds/edit.ejs', {campground});
})

app.put('/campgrounds/:id', async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
  res.redirect(`/campgrounds/${campground._id}`);
})

app.delete('/campgrounds/:id', async (req, res) => {
  const {id} = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect('/campgrounds');
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})