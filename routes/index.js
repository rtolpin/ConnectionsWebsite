var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const UserSchema = mongoose.model('UserSchema');
const User = mongoose.model('User');

const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';

const locations = ['California', 'Conneticut', 'Florida', 'Massachusetts', 'New Jersey', 'New York'];

/* GET home page. */
router.get('/', async function(req, res) {
  const user = await UserSchema.findOne({username: req.session.username});

  if(!user){
    res.render('index', { title: 'Connections'});
  }else{
    res.render('index', {user: user, username: req.session.username});
  }
});

router.get('/register', function(req, res){
  res.render('start_page');
});

router.get('/login', function(req, res){
  res.render('login');
});

router.get('/profile', async function(req, res){
  const user = await UserSchema.findOne({username: req.session.username});

  if(!!user){
    res.render('profile', {username: req.session.username, user: user});
  }
});

router.get('/about', function(req, res){
  res.render('about', {username: req.session.username});
});

router.get('/find/connections', async function(req, res){
  const user = await UserSchema.findOne({username: req.session.username}).populate('connections');

  if(!!user){
    res.render('connections', {username: req.session.username, user: user, connections: user.connections});
  }
});

router.post('/create/connection', async function(req, res){
  const user = await UserSchema.findOne({username: req.session.username});

  if(!!user){
    let genderUrl = '';
    if(req.body.gender == '1'){
      genderUrl = 'https://marketplace.canva.com/MAB3okQ_Ypk/1/thumbnail/canva-business-woman-icon-MAB3okQ_Ypk.png';
    }else{
      genderUrl = 'https://marketplace.canva.com/MAB3og_uyQk/1/thumbnail/canva-businessman-avatar-MAB3og_uyQk.png';
    }
    user.connections.push({first_name: req.body.first_name, last_name: req.body.last_name, genderImageUrl: genderUrl});
    await user.save();
    res.redirect('/find/connections');
  }
});

router.get('/connect/profile', async function(req, res){
  const user = await UserSchema.findOne({first_name: req.body.first_name, last_name: req.body.last_name, company: req.body.company});

  if(!!user){
    res.render('profile', {user: user});
  }
});

router.get('/search', async function(req, res){
  if(req.query.company){
    const users = await UserSchema.find({company: { $regex: req.query.company, $options: 'i' }});

    if(users){
      let searchCompany = true;
      res.render('search', {username: req.session.username, users: users, searchCompany: searchCompany});
    } else {
      const users = await UserSchema.find({});
      res.render('search', {username: req.session.username, users: users});
    }
  } else {
    const users = await UserSchema.find({});
    res.render('search', {username: req.session.username, users: users});
  }
});

router.post('/login', async function(req, res){
  console.log(req.body.username);
  const user = await UserSchema.findOne({username: req.body.username});

  if (!!user) {
        // compare with form password!
        console.log(user.password);
        console.log(req.body.password);
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
      res.render('login', {userDoesNotExist: 'Error: user does not exist'});
    }
});

router.get('/logout', function(req, res){
	req.session.destroy(function(err){
		if(err){
			res.send('Internal Server Error: Could not log out.');
		}
    res.redirect('/');
	});
});

router.post('/register', async function(req,res){
	const user = await UserSchema.findOne({username: req.body.username});

  if(!!user){
    res.render('start_page', {ExistsErrMessage: 'Error: User already exists'});
  } else {
    console.log(req.body.password);
    const genPassword = bcrypt.hash(req.body.password, saltRounds, async function(err, hash) {
        if (err){
          console.log(err);
          res.send('Internal Server Error: generating password');
        }
        let location = '';

        if(req.body.location){
          req.body.location = locations[req.body.location-1];
        }

        const newUser = new UserSchema({
            username: req.body.username,
            password: hash,
            company: req.body.company,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            location: req.body.location,
            birthday: req.body.birthday
          });

        const user = await newUser.save();

        req.session.regenerate((err) => {
          if (!err){
            req.session.username = user.username;
            res.redirect('/');
          } else{
            console.log('error');
            res.send('an error occurred, please see the server logs for more information');
          }
        });
    });
  }

});

module.exports = router;
