var express = require('express')
var router = express.Router()

var db = require('../models/db')
var global = require('../config/global')
var control = require('../models/control')

/* GET home page. */
router.get('/',	function (req, res, next) {
	console.log('*************** Atendiendo la ruta: / GET')
	console.log('*** global: ' + JSON.stringify(global))
	console.log('*** global: ' + global.siteTitle)
	console.log('*** Sesion: ' + req.session)
	console.log('*** Sesion: ' + req.session.user)
	if (req.session.userLoged) {
  		res.render('home', {
  			pageTitle: '',
  			pageName: 'home',
  			sessionUser: req.session.userLoged,
  			errors: null
  		})
  	} else {
  		res.render('index', {
  			pageTitle: '',
  			pageName: 'index',
  			sessionUser: null,
  			errors: null
  		})
  	}
})

module.exports = router;
