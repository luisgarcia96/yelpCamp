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

    //Création de 25 nouveaux objets
    for (let i = 0; i < 10; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const randomPrice = Math.floor(Math.random() * 30);
        const camp = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                  url: 'https://res.cloudinary.com/dpgk4shsm/image/upload/v1672155408/YelpCamp/nye5xzml4p7tr2ibexem.jpg',
                  filename: 'YelpCamp/nye5xzml4p7tr2ibexem'
                },
                {
                  url: 'https://res.cloudinary.com/dpgk4shsm/image/upload/v1672155407/YelpCamp/rjsado2qssckwrrpsz3i.jpg',
                  filename: 'YelpCamp/rjsado2qssckwrrpsz3i'
                }
              ],
            price: randomPrice,
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Illum, soluta iure? Ut labore perferendis quae modi sit minus sunt in sed, accusamus doloremque dignissimos, non voluptates quas dicta at itaque!',
            author: '63a8bd9f375847f4981dab57', //Your user ID
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: {
              "type":"Point",
              "coordinates":[3.876734,43.611242]
            }
        })
        await camp.save();
    }
}

seedDB().then( ()=> {
    mongoose.connection.close();
    console.log('Connection closed');
});