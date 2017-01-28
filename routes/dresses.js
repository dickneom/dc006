var express = require('express')
var router = express.Router()

// para usar con todas las rutas
router.use(function(req, res, next) {
	//
	// codigo aqui
	//
	next()
})

router.route('dresses')
	// todos los vestidos
	.get()
	// crea un vestido
	.post()

router.route('dresses/:dressId')
	// busca un vestido
	.get()
	// actualiza un vestido
	.put()
	// borra un vestido
	.delete()