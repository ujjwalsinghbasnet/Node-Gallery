const express = require('express');
const multer = require('multer');
const hbs = require('hbs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./config/database')
//working with env variables
require('dotenv').config();
const databaseLink = process.env.DB_STRING;

//storage for uploaded files
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

mongoose.connect(databaseLink,{useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection;
db.once('open',()=>{
  console.log('Connected')
})


const upload = multer({
  storage: storage,
  limits:{fileSize: 1000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('avatar');

function checkFileType(file, cb){
  // Allowed extension name
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}

const app = express();

app.set('view engine', 'hbs');

app.use(express.static('./public'));
app.use(express.static('./public/uploads'));


app.post('/upload',(req,res)=>{
  upload(req, res, (err) => {
    if(err){
      res.render('form', {
        error: err
      });
      console.log(err);
    } else {
      if(req.file == undefined){
        res.render('form',{error: err});
      } else {
        const newPhoto = User({
          avatarPath: req.file.filename
        })
        newPhoto.save(()=>{
          console.log('saved')
        })
        console.log(req.file.filename);
      }
    }
  });
})
let i = 1;
app.get('/',(req,res)=>{
  const photo = User.find((err,photos)=>{
    res.render('gallery',{images: photos,modal_images: photos, i: i})
  });
})


const port = 3000;
app.listen(port, () => console.log(`Server started on port ${port}`));