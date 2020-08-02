var mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
    fname:String,
    lname:String,
    gender:String,
    dob:String,
    username:String,
    password:String
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',userSchema);