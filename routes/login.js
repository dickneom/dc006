var express = require('express')
var router = express.Router()

var control = require('../models/control')

router.route('/')
	.get(function (req, res) {
		console.log('*************** Atendiendo la ruta: /login GET')
		res.render('login/login', {
			pageTitle: 'Ingreso',
			pageName: 'login',
			sessionUser: null,
			errors: null
		})
	})
	.post(function(req, res) {
		console.log('*************** Atendiendo la ruta: /login POST')
		var email = req.body.email
		var password = req.body.password
		var rememberme = req.body.rememberme

	    control.login(email, password, rememberme, function (error, user) {
	        if (error) {
	            console.log('ERROR: ' + error)
	            res.render('login/login', {
	                pageTitle: 'Ingreso',
	                pageName: 'login',
	                sessionUser: null,
	                errors: [error]
	            })
	        } else {
	            req.session.userLoged = user
	            control.sessionInit(req, res, user)
	            res.redirect('/')
	        }
	    })
	})

module.exports = router;