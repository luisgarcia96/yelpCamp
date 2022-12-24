const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})

//The following line contains the logic for adding username and password but it is hidden (not great for code understanding purposes)
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);