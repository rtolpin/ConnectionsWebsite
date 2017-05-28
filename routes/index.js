var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const UserSchema = mongoose.model('UserSchema');

const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';

/* GET home page. */
router.get('/', function(req, res) {
  UserSchema.findOne({username: req.session.username}, (err, user) => {
    //var context = { title: 'Connections'};
    if(!user){
      res.render('index', { title: 'Connections'});
    }else{
      console.log(user);
      console.log(user.first_name);
      //context = {user: user};
      res.render('index', {user: user,first_name: user.first_name, username: req.session.username});
    }
  });
});

router.get('/register', function(req, res){
  res.render('start_page');
});

router.get('/login', function(req, res){
  res.render('login');
});

router.post('/login', function(req, res){
  console.log('34:', req.body);
  UserSchema.findOne({username: req.body.username}, (err, user, count) => {
    console.log('125 user: ', user);
    if (!err && user) {
        // compare with form password!
        bcrypt.compare(req.body.password, user.password, (err, passwordMatch) => {
          // regenerate session if passwordMatch is true
          if(passwordMatch){
            req.session.regenerate((err) => {
              if (!err) {
                req.session.username = user.username;
                res.redirect('/');
              } else {
                console.log('error');
                res.send('an error occurred, please see the server logs for more information');
              }
            });
          }else{
            res.render('login', {incorrectPassword: 'Error: incorrect password entered.'});
          }
        });

    } else{
      console.log('error: user does not exist');
      res.render('login', {userDoesNotExist: 'Error: user does not exist'});
    }
  });
});

router.get('/logout', function(req, res){
	req.session.destroy(function(err){
		if(err){
			res.send('Internal Server Error: Could not log out.');
		}
    res.redirect('/');
		//res.render('userListsMainPage', {loggedout: loggedout});
	});
});

router.post('/register', function(req,res){
  console.log(req.body);
  /*if(req.body.password.length < 8){
		res.render('register', {errMessage: 'Error: Password too short'});
	}*/
	UserSchema.findOne({username: req.body.username}, (err, result, count) => {
		console.log('59: req.body.username: ', req.body.username);
		if(result){
			console.log('User already exists: ', result);
			res.render('register', {ExistsErrMessage: 'Error: User already exists'});
		}else{
			console.log(bcrypt);
			console.log(bcrypt.hash);
			const genPassword = bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
				console.log('enters hash function');
					if (err){
						console.log(err);
						res.send('Internal Server Error: generating password');
					}
					console.log('66: hash: ', hash);
					//console.log('92 req.body.username: ', req.body.username);
					//const user = new User({username: req.body.username, password: hash});
					//console.log('69: generate password:', genPassword);
					//const user = new User({username: req.body.username});
					//password: genPassword
          (new UserSchema({
              username: req.body.username,
              password: hash,
              company: req.body.company,
              first_name: req.body.first_name,
              last_name: req.body.last_name,
              birthday: req.body.birthday
          })).save((err, user, count) => {
            console.log(user);
            console.log(count);
            console.log('68 user: ', user);
            if(err){
              console.log(err);
              res.send('an internal server error occured: see server logs for more information');
            }else{
              req.session.regenerate((err) => {
                if (!err){
                  req.session.username = user.username;
                  res.redirect('/');
                } else{
                  console.log('error');
                  res.send('an error occurred, please see the server logs for more information');
                }
              });
            }
          });

			});
		}
	});
});

module.exports = router;
