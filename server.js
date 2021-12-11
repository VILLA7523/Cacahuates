const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const multer = require('multer')
const morgan = require('morgan')
const { v4:uuidv4 } = require('uuid');
const Article = require('./models/article')
const articleRouter = require('./routes/articles')
const methodOverride = require('method-override')
const app = express()

mongoose.connect('mongodb://localhost/blog', {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
})

app.set('view engine', 'ejs'); //motor de plantillas
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
const storage = multer.diskStorage ({
  destination: path.join(__dirname , 'public/img/uploads'),
   filename: (req,file ,cb , filename) => {
     cb(null , uuidv4() + path.extname(file.originalname));
   }
});

app.use(multer({storage : storage}).single('image'));

app.get('/', async (req, res) => {
  const articles = await Article.find().sort({ createdAt: 'desc' })
  res.render('articles/index', { articles: articles })
});
app.use(express.static(path.join(__dirname,'public')));
app.use('/articles', articleRouter)

app.listen(5000)