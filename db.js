const mongoose = require('mongoose');

const User = new mongoose.Schema({
  name: {type: String, unique: true}
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
  location: String,
  connections: [{type: mongoose.Schema.Types.ObjectId, ref:'User'}],
}, {
_id: true
});


/*const Company = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});*/


mongoose.model('User', User);
mongoose.model('UserSchema', UserSchema);
mongoose.connect('mongodb://localhost/connectionsDB');
