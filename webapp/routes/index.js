var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.html', { title: 'Express' });
});

// Signin
router.get('/signin', (req, res) => {
    res.render('signin.html');
})

module.exports = router;
