const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');


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




app.get('/', (req, res) => {
  res.render('home.ejs');
})

app.get('/makeCampground', async (req, res) => {
  const camp = new Campground({
    title: 'My Backyard 2',
    description : 'cheap cheap'
  })
  await camp.save();
  res.send(camp);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})