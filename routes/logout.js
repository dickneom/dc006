var express = require('express')
var router = express.Router()

// var control = require('../models/control')

router.get('/', function (req, res, next) {
	console.log('*************** Atendiendo la ruta: /logout GET')
	req.session.destroy(function (errors) {
		if (errors) {
			console.log('*** ERROR: ' + errors)
			return
		} else {
			//req.session.user = null
			//req.session = null
			console.log('*** Sesion: ' + req.session)
			//console.log('*** Sesion: ' + req.session.user)
			res.redirect('/')
		}
	})
})

module.exports = router
