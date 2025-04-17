const mongoose = require('mongoose');

require('dotenv').config();

const User = new mongoose.Schema({
  first_name: {type: String, required: true},
  last_name: {type: String, required: true},
  genderImageUrl: String
}, {
_id: true
});

const UserSchema = new mongoose.Schema({
  username: {type: String, unique: true},
  password: {type: String, required: true},
  company: {type: String, required: true},
  first_name: {type:String, required: true},
  last_name: {type:String, required: true},
  birthday: Date,
  location: {type:String, required: true},
  connections: [User]
}, {
_id: true
});

const dbURI = process.env.MONGODB_URI;

mongoose.model('User', User);
mongoose.model('UserSchema', UserSchema);

const connect = async () => {
  await mongoose.connect(dbURI);
}

connect();


