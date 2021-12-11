const express = require('express')
const Article = require('./../models/article')
const router = express.Router()
const {unlink} = require('fs-extra')
const path = require('path')

router.get('/new', (req, res) => {
  res.render('articles/new', { article: new Article() })
})

router.get('/edit/:id', async (req, res) => {
  const article = await Article.findById(req.params.id)
  res.render('articles/edit', { article: article })
})

router.get('/:slug', async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug })
  if (article == null) res.redirect('/')
  res.render('articles/show', { article: article })
})

router.post('/', async (req, res, next) => {
  console.log(req.file);
  req.article = new Article()
  next()
}, saveArticleAndRedirect('new'))

router.put('/:id', async (req, res, next) => {
  req.article = await Article.findById(req.params.id)
  next()

}, saveArticleAndRedirect('edit'))

router.delete('/:id', async (req, res) => {
  const article = await Article.findByIdAndDelete(req.params.id);
  await unlink(path.resolve('./public/' + article.imagen.path));
  res.redirect('/')
})

function saveArticleAndRedirect(path) {
  return async (req, res) => {
    let article = req.article;
    article.title = req.body.title;
    article.author = req.body.author;
    article.description = req.body.description;
    article.markdown = req.body.markdown;
    if(req.file != null)
    {
      article.imagen.filename = req.file.filename;
      article.imagen.path = 'img/uploads/' + req.file.filename;
      article.imagen.originalname = req.file.originalname;
      article.imagen.mimetype = req.file.mimetype;
      article.imagen.size = req.file.size;
    }
    console.log(article);
    try {
      article = await article.save()
      res.redirect(`/articles/${article.slug}`)
    } catch (e) {
      res.render(`articles/${path}`, { article: article })
    }
  }
}

module.exports = router