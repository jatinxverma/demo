const express = require('express');
const path= require('path');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const expressValidator =require('express-validator');
const flash=require('connect-flash');
const session =require('express-session');
const passport =require('passport');
const config =require('./config/database');


mongoose.connect(config.database);
let db=mongoose.connection;

//check conn
db.once('open',function(){
    console.log('Connected to mongodb');
})

//check for db error
db.on('error',function(err){
    console.log(err);
})

//init app
const app=express();

//bring in models
let Question=require('./models/question');

//load views
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

//body parser 
app.use(bodyParser.urlencoded({ extended : false}))

app.use(bodyParser.json());

//set public folder
app.use(express.static(path.join(__dirname,'public')));

//express-session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
  }));

// express messages middleware
app.use(require('connect-flash')());
app.use(function(req,res,next){
    res.locals.messages = require('express-messages')(req,res);
    next();
});

//express validator middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;
  
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
  }));

require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
    res.locals.user = req.user || null;
    next();
  });

//home route
app.get('/',function(req,res){
 Question.find({},function(err,questions){
     if(err){
         console.log(err);
     }
     else{
        res.render('index',{
            title:'Questions',
            questions:questions
            });
     }
    
 });

});

let questions=require('./routes/questions');
let users=require('./routes/users');
let responses=require('./routes/responses')
let admins = require('./routes/admins');
let tests = require('./routes/tests');
app.use('/questions',questions);
app.use('/users',users);
app.use('/responses',responses);
app.use('/admins',admins);
app.use('/tests',tests);
//start server
app.listen(3000,function(){
    console.log('server started on port 3000');
})