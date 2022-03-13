const mongoose = require('mongoose');
const cities = require('./cities')
const {descriptors, places} = require('./seedHelpers');
const Campground = require('../models/campground');


//Connexion à la Base de données
main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://localhost:27017/yelp-camp');
    console.log('Database Connected!');
}

const seedDB = async () => {
    //On vide toute la BDD avant de fournir les nouvelles données
    await Campground.deleteMany({});
    console.log("Deletion executed");

    const sample = array => array[Math.floor(Math.random() * array.length)];

    //Création de 50 nouveaux objets
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`
        })
        await camp.save();
        console.log('New campgrounds added!');
    }
}

seedDB().then( ()=> {
    mongoose.connection.close();
    console.log('Connection closed');
});