var express = require('express')
var router = express.Router()
var fs = require('fs')
var Sequelize = require('sequelize')
var sequelize = new Sequelize('', '', '', {
  dialect: 'sqlite',
  storage: './db/dc.db',
  define: {
//    timestamps: false,
    freezeTableName: true
  }
})

var cloudinary = require('cloudinary') // sitio web para almacenar imagenes
var multer = require('multer')  // Para subir archivo (imagenes)
var uploader = multer({dest: './uploads'})

// configuracion de cloudinary para dresscloset
cloudinary.config({
  cloud_name: 'cloud-dc',
  api_key: '315662672528822',
  api_secret: 'HaVwA3NVQfm5cVMeTKYU3O5Di7s'
})

var db = require('../models/db')
var control = require('../models/control')

brands = [{id: 1, title: 'Zara'},
		{id: 2, title: 'Chino'},
		{id: 3, title: 'Victoria Secrets'},
		{id: 4, title: 'Calvin Klein'},
		{id: 5, title: 'MiMarca'}]

states = [{id: 1, title: 'REGISTRADO'},
		{id: 2, title: 'PUBLICADO'},
		{id: 3, title: 'EN VENTA'}]

colors = [{id: 1, color: 'BLANCO'},
		{id: 2, color: 'NEGRO'},
		{id: 3, color: 'ROJO'},
		{id: 4, color: 'AZUL'},
		{id: 5, color: 'VERDE'},
		{id: 6, color: 'GRIS'},
		{id: 7, color: 'ROSADO'},
		{id: 8, color: 'MORADO'},
		{id: 9, color: 'AMARILLO'},
		{id: 10, color: 'NARANJA'},
		{id: 11, color: 'MARRON'},
		{id: 12, color: 'VIOLETA'},
		{id: 13, color: 'CELESTE'},
		{id: 14, color: 'DORADO'},
		{id: 15, color: 'PLATEADO'},]


// para usar con todas las rutas
router.use(function(req, res, next) {
	//
	// codigo aqui
	//
	next()
})

// listar todos los vestidos
router.get('/', function (req, res) {
	console.log('*************** Atendiendo la ruta: /dresses GET')
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
        for (var i in dresses) {
        	dress = dresses[i]
        	if (dress.image) {
        		if (dress.image !== null) {
		        	if (!dress.image.startsWith('http')) {
		        		console.log('***************** Imagen no impieza con http ***************************************************')
		        		dress.image = '/images/dresses/' + dress.image
		        	}
		        }
	        }
        }
        if (dresses) {
            res.render('dresses/dresses', {
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

// ver un vestido
router.get('/:dressId', function (req, res) {
	console.log('*************** Atendiendo la ruta: /dresses/:dressId GET')
	var id = req.params.dressId

	db.Dress.findOne({
		where: {
			id: id
		},
		include: {
			model: db.User,
			as: 'user'
		}
	})
	.then(function (dress) {
    	if (dress.image) {
    		if (dress.image !== null) {
	        	if (!dress.image.startsWith('http')) {
	        		console.log('***************** Imagen no impieza con http ***************************************************')
	        		dress.image = '/images/dresses/' + dress.image
	        	}
	        }
        }
		var brand = brands[dress.brandId].title
		var state = states[dress.stateId - 1].title
		var color = colors[dress.colorId] .color
		if (dress) {
			res.render('dresses/dress_view', {
				pageTitle: 'Vestido ' + dress.title,
				pageName: 'dress_view',
				sessionUser: req.session.userLoged,
				errors: null,
				dress: dress,
				brand: brand,
				state: state,
				color: color
			})
		} else {
			console.log('*** Vestido no encontrado: Id:' + id)
		}
	})
	.catch(function (errors) {
		console.log('*** ERROR: ' + errors)
	})
})

// editar un vestido, tiene que estar registrado, logeado y ser el propietario
// router.get('/:dressId/edit', control.sessionValidate, function (req, res) {
router.get('/:dressId/edit', function (req, res) {
	console.log('*************** Atendiendo la ruta: /dresses/:dressId/edit GET')
	var id = req.params.dressId

	db.Dress.findOne({
		where: {
			id: id
		},
		include: {
			model: db.User,
			as: 'user'
		}
	})
	.then(function (dress) {
		console.log('****** Vestido encontrado. id: ' + dress.id + ' stateId: ' + dress.stateId)
		var imageUrl = ''
		if (dress.image)
			if (dress.image !== null)
				if (dress.image.startsWith('http'))
					imageUrl = dress.image
				else
					imageUrl = '/images/dresses/' + dress.image

		res.render('dresses/dress_edit', {
			pageTitle: 'Editar Vestido ' + dress.title,
			pageName: 'dress_edit',
			sessionUser: req.session.userLoged,
			errors: null,
			dress: dress,
			imageUrl: imageUrl,
			brands: brands,
			colors: colors
		})
	})
	.catch(function (errors) {
		console.log('*** ERROR: ' + errors)
	})
})


router.post('/load_image', uploader.single('image'), function (req, res) {
	console.log('*************** Atendiendo la ruta: /dresses/load_image POST')
	if (req.file) {
		// var dirDest = '/images/dresses/'
		// console.log(req.file)
		// console.log('ID: ' + id)

		//dress.image = filePathDest
		console.log('********* Subiendo imagen ***********')
		cloudinary.uploader.upload(req.file.path, function (result) {1
			console.log('********* viendo resultados')
			console.log(result)

			var fileUrl = result.url
			var fileSecureUrl = result.secure_url

			db.Dress.findOne({
				where: {
					id: req.body.id
				},
				include: {
					model: db.User,
					as: 'user'
				}
			})
			.then(function (dress) {
				dress.image = fileUrl

				console.log('********* Vestido a grabar: ' + dress)
				for (var prop in dress)
					//console.log('obj.' + prop, '=', dress[prop])

				var sql = 'UPDATE dresses SET image = "' + fileUrl + '" WHERE id = ' + dress.id
				console.log('Actualizando con : ' + sql)
				sequelize.query(sql).spread(function(results, metadata) {
  					// Results will be an empty array and metadata will contain the number of affected rows.
  					console.log('********* Actualizado')
  					console.log('********* result')
  					console.log(result)
  					console.log('********* metadata')
  					console.log(metadata)
  					res.redirect('/dresses/' + dress.id + '/edit')
				})

/*				dress.update()
				.then(function (dressNew) {
					res.redirect('/dresses/' + dressNew.id + '/edit')
				})*/
			})

		})
	}
})

// guardar un vestido, tiene que estar registrado, logeado y ser el propietario
// router.post('/', control.sessionValidate, function (req, res) {
router.post('/', uploader.single('image'), function (req, res) {
	console.log('*************** Atendiendo la ruta: /dresses/ POST')
    if (req.file) { //form files
    	console.log(req.file.path) //form files
    	var fileUpload = req.file.path
    	console.log(fileUpload)
    	console.log('******** Archivo nombre: ' + req.file.name)


//    	indico la ruta donde se copiará
//    	puede ser un directorio local o
//    	una url web

//    	asigno a drees.image = ruta final del archivo
    }

	var id = ''
	if (req.body.id !== '')
		id = req.body.id

	console.log('****** Grabando vestido. Id: ' + id)
	if (id !== '') {
		updateDress(req, res, function (error, dress) {
			if (error) {
				res.render('dresses/dress_edit', {
					pageTitle: 'Vestido',
					pageName: 'dress_view',
					sessionUser: req.session.userLoged,
					errors: error,
					dress: dress,
					brands: brands
				})
			}

			res.redirect('/dresses/' + dress.id + '/edit')
		})
	} else {
		createDress(req, res, function (error, dress) {
			if (error) {
				res.render('dresses/dress_edit', {
					pageTitle: 'Vestido',
					pageName: 'dress_view',
					sessionUser: req.session.userLoged,
					errors: error,
					dress: dress,
					brands: brands
				})
			}

			res.redirect('/dresses/' + dress.id + '/edit')
		})
	}
})

function createDress (req, res, cb) {
	console.log('****** Creando Vestido')
	var dress = {}

	dress.title = req.body.title
	dress.description = req.body.description
	dress.brandId = req.body.brandId
	dress.price = req.body.price
	dress.stateId = 1
	if (req.session.userLoged)
		dress.userId = req.session.userLoged.id
	else
		dress.userId = 1

	dress.createdAt = new Date()
	dress.updatedAt = new Date()

	db.Dress.create(dress)
	.then(function (dressNew) {
		console.log('*** Vestido creado: Id: ' + dressNew.id)
		cb(null, dressNew)
		if (dressNew) {
			res.redirect('/dresses/' + dressNew.id)
		}
	})
	.catch(function (errors) {
		console.log("*** ERROR al grabar el vestido: " + errors)
		cb(errors, dress)
	})
}

function updateDress (req, res, cb) {
	console.log('****** Actualizando Vestido. Id: ' + req.body.id)
	db.Dress.findOne({
		where: {
			id: req.body.id
		},
		include: {
			model: db.User,
			as: 'user'
		}
	})
	.then(function (dress) {
		console.log('****** Vestido encontrado: ' + dress.id + ' - ' + dress.title)
		dress.title = req.body.title
		dress.description = req.body.description
		dress.brandId = req.body.brandId
		dress.price = req.body.price
		dress.stateId = 1

		dress.updatedAt = new Date()
		if (!dress.createdAt)
			dress.createdAt = new Date()
		console.log(dress)
		console.log(dress.id)
		console.log(dress.title)
		console.log(dress.description)
		console.log(dress.brandId)
		console.log(dress.price)
		console.log(dress.stateId)
		console.log(dress.createdAt)
		console.log(dress.updatedAt)
		console.log(dress.user.id)
		console.log(dress.user.nickname)


		console.log('****** Aplicando la actualizacion al vestido')
		dress.update()
		.then(function (dressNew) {
			console.log('*** Vestido actualizado: Id: ' + dressNew.id)
			cb(null, dressNew)
		})
		.catch(function (errors) {
//			var errors = null
			console.log('*** ERROR en la actualizacion: ' + errors)
			res.render('dresses/dress_edit', {
				pageTitle: 'Vestido',
				pageName: 'dress_view',
				sessionUser: req.session.userLoged,
				errors: errors,
				dress: dress,
				brands: brands
			})
		})
	})
/*	.catch(function (errors) {
		console.log('****** ERROR en la busqueda: ' + errors)
	})*/
}

// publicar un vestido
router.get('/:dressId/publish', control.sessionValidate, function(req, res) {

})

// poner en venta un vestido. esto lo hace un usuario administrador
router.get('/:dressId/')

// agregar a favoritos un vestido
router.get('/:dressId/like', control.sessionValidate, function (req, res) {
	console.log('*************** Atendiendo la ruta: /dresses/:dressId/like GET')
	var id = req.params.dressId

})

// comprar un vestido
router.get('/:dressId/buy', control.sessionValidate, function (req, res) {
	console.log('*************** Atendiendo la ruta: /dresses/:dressId/buy GET')

})

module.exports = router
