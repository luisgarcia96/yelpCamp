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
        const randomPrice = Math.floor(Math.random() * 30);
        const camp = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [{url: 'https://source.unsplash.com/collection/483251', filename: 'CampgroundPic'}],
            price: randomPrice,
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Illum, soluta iure? Ut labore perferendis quae modi sit minus sunt in sed, accusamus doloremque dignissimos, non voluptates quas dicta at itaque!',
            author: '63a8bd9f375847f4981dab57',
            location: `${cities[random1000].city}, ${cities[random1000].state}`
        })
        await camp.save();
    }
}

seedDB().then( ()=> {
    mongoose.connection.close();
    console.log('Connection closed');
});