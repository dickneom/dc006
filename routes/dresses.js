var express = require('express')
var router = express.Router()

var db = require('../models/db')
var control = require('../models/control')

// para usar con todas las rutas
router.use(function(req, res, next) {
	//
	// codigo aqui
	//
	next()
})

router.route('/')
	// todos los vestidos
	.get(function (req, res) {
		console.log('*************** Atendiendo la ruta: /dreses GET')
	    var limit = 9
	    if (req.query.limit) {
	        limit = req.query.limit
	    }
	    var pageNumber = 1
	    if (req.query.page) {
	        pageNumber = req.query.page
	    }

	    var offset = limit * (pageNumber - 1)

	    console.log('****** Buscando vestidos: limit: ' + limit + ' pageNumber: ' + pageNumber + ' offset: ' + offset)

	    db.Dress.findAll({
	        limit: limit,
	        offset: offset,
	        include: {
	          model: db.User,
	          as: 'user'
	        }
	    }).then(function (dresses) {
	        console.log('*** Busqueda concluida con exito')
	        if (dresses) {
	            res.render('dresses/dresses',{
	                pageTitle: 'Vestidos',
	                pageName: 'dresses',
	                sessionUser: req.session.userLoged,
	                errors: null,
	                dresses: dresses,
	                pageNumber: pageNumber,
	                limit: limit
	            })
	        } else {
	            console.log('****** Resultado de la busqueda vacia')
	        }
    	}).catch(function (errors) {
    		console.log('*** ERROR: ' + errors)
    	})
    })
	// crea un vestido
	.post()

router.route('/:dressId')
	// busca un vestido
	.get()
	// actualiza un vestido
	.put()
	// borra un vestido
	.delete()

module.exports = router