var express = require('express')
var router = express.Router()
// var fs = require('fs')
/* var Sequelize = require('sequelize') */
/* var sequelize = new Sequelize('', '', '', {
  dialect: 'sqlite',
  storage: './db/dc.db',
  define: {
//    timestamps: false,
    freezeTableName: true
  }
}) */

// PARA SUBIR LAS IMAGENES A CLOUDINARY
var cloudinary = require('cloudinary')  // sitio web para almacenar imagenes
var multer = require('multer')   // Para subir archivo (imagenes)
var uploader = multer({dest: './uploads'})

// configuracion de cloudinary para dresscloset
cloudinary.config({
  cloud_name: 'cloud-dc',
  api_key: '315662672528822',
  api_secret: 'HaVwA3NVQfm5cVMeTKYU3O5Di7s'
})

var db = require('../models/db')
var control = require('../models/control')

// CONSTANTES QUE DEBERIAN ESTAR EN LAS TABLAS DE LAS BASE DE DATOS
const BRANDS = [{id: 1, title: 'Zara'},
    {id: 2, title: 'Chino'},
    {id: 3, title: 'Victoria Secrets'},
    {id: 4, title: 'Calvin Klein'},
    {id: 5, title: 'MiMarca'}]

const STATES = [{id: 1, title: 'REGISTRADO'},
    {id: 2, title: 'PUBLICADO'},
    {id: 3, title: 'EN VENTA'}]

const COLORS = [{id: 1, color: 'BLANCO'},
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
    {id: 15, color: 'PLATEADO'}]

const NUM_DRESSES_FOR_PAGE = 9

// para usar con todas las rutas
router.use(function (req, res, next) {
  //
  // codigo aqui
  //

  // Esta url es para poder regresar de login
  if (req.method === 'GET') {
    req.session.url = '/dresses' + req.url
  }
  next()
})

// RUTAS PARA TODOS LOS USUARIOS, INCLUSO VISITANTES
// listar todos los vestidos para todos los usuarios, los vestidos tienen que estar en estado 3
router.get('/', function (req, res) {
  console.log('*************** Atendiendo la ruta: /dresses GET')
  console.log(req.url + ' - ' + req.method)

  var limit = NUM_DRESSES_FOR_PAGE
  var pageNumber = 1
  var offset

  if (req.query.limit) {
    limit = req.query.limit
  }
  if (req.query.page) {
    pageNumber = req.query.page
  }

  offset = limit * (pageNumber - 1)   // El primer offset es 0
  console.log('****** Buscando vestidos: limit: ' + limit + ' pageNumber: ' + pageNumber + ' offset: ' + offset)
  db.Dress.findAll({
    where: {
      state_id: 3
    },
    limit: limit,
    offset: offset,
    include: {
      model: db.User,
      as: 'user'
    }
  }).then(function (dresses) {
    console.log('*** Busqueda concluida con exito')

    if (dresses) {
      // Determinar la url de la imagen
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

      // Mostrar los vestidos en el navegador
      for (var dress in dresses) {
        console.log('dress: ', dress.id)
      }

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

// ver un vestido, para todos los usuarios, los vestidos tienen que estar en estado 3
router.get('/:dressId([0-9]+)', function (req, res) {
  console.log('*************** Atendiendo la ruta: /dresses/:dressId GET')
  console.log(req.url + ' - ' + req.method)

  var id = req.params.dressId
  var brand
  var state
  var color

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

    brand = BRANDS[dress.brandId].title
    state = STATES[dress.stateId - 1].title
    color = COLORS[dress.colorId].color

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

// RUTAS PARA LOS USUARIOS REGISTRADOS
// listar los vestidos festidos para los usuarios registrados, los vestidos tienen que estar en estado 3
router.get('/likes', control.sessionValidate, function (req, res) {
  console.log('*************** Atendiendo la ruta: /dresses/likes GET')
  db.Dress.findAll()
  .then(function (dresses) {
    res.render('dresses/likes', {
      pageTitle: 'Vestidos',
      pageName: 'dresses_likes',
      sessionUser: req.session.userLoged,
      errors: null,
      dresses: dresses,
      pageNumber: pageNumber,
      limit: limit
    })
  })
})

// agregar a favoritos un vestido
router.get('/:dressId([0-9]+)/like', control.sessionValidate, function (req, res) {
  console.log('*************** Atendiendo la ruta: /dresses/:dressId/like GET')
  // Coloca el vestido en favoritos si no esta, caso contrario lo retira

  var id = req.params.dressId

})

// quitar de favoritos un vestido
router.get('/:dressId([0-9]+)/dislike', control.sessionValidate, function (req, res) {
  console.log('*************** Atendiendo la ruta: /dresses/:dressId/like GET')
  // Coloca el vestido en favoritos si no esta, caso contrario lo retira

  var id = req.params.dressId

})

// comprar un vestido, registrar la compra para el pago
router.get('/:dressId([0-9]+)/buy', control.sessionValidate, function (req, res) {
  console.log('*************** Atendiendo la ruta: /dresses/:dressId/buy GET')

})

// cancelar la compra, TAMBIEN SE PODRIA DEJAR POR UN TIEMPO DETERMINADO Y QUE LA COMPRA SE CANCELE SOLA

// RUTAS PARA LOS PROPIETARIOS DE LOS VESTIDOS
// listar todos los vestidos propios, registrados, publicados y en venta
router.get('/mycloset', control.sessionValidate, function (req, res) {
  console.log('*************** Atendiendo la ruta: /dresses/mycloset GET')

  var limit = NUM_DRESSES_FOR_PAGE
  var pageNumber = 1

  if (req.query.limit) {
    limit = req.query.limit
  }
  if (req.query.page) {
    pageNumber = req.query.page
  }

  var offset = limit * (pageNumber - 1)
  console.log('****** Buscando vestidos: limit: ' + limit + ' pageNumber: ' + pageNumber + ' offset: ' + offset)

  db.Dress.findAll({
    where: {
      userId: req.session.userLoged.id,
      stateId: [1, 2, 3]
    },
    limit: limit,
    offset: offset,
    include: {
      model: db.User,
      as: 'user'
    }
  }).then(function (dresses) {
    console.log('*** Busqueda concluida con exito')
    // Determinar la url de la imagen
    var dress
    if (dresses) {
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

      // Mostrar los vestidos en el navegador
      res.render('dresses/dresses_mycloset', {
        pageTitle: 'Mi Closet',
        pageName: 'mycloset',
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

// editar un vestido, tiene que estar registrado, logeado y ser el propietario
router.get('/:dressId([0-9]+)/update', control.sessionValidate, control.isDressOwner, function (req, res) {
  console.log('*************** Atendiendo la ruta: /dresses/:dressId/update GET')

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
    if (dress.image) {
      if (dress.image !== null) {
        if (dress.image.startsWith('http')) {
          imageUrl = dress.image
        } else {
          imageUrl = '/images/dresses/' + dress.image
        }
      }
    }

    res.render('dresses/dress_update', {
      pageTitle: 'Editar Vestido ' + dress.title,
      pageName: 'dress_edit',
      sessionUser: req.session.userLoged,
      errors: null,
      dress: dress,
      imageUrl: imageUrl,
      brands: BRANDS,
      colors: COLORS
    })
  })
  .catch(function (errors) {
    console.log('*** ERROR: ' + errors)
  })
})

router.post('/update', control.sessionValidate, control.isDressOwner, function (req, res, next) {
  console.log('*************** Atendiendo la ruta: /dresses/update POST')

  if (req.body.dressId) {
    console.log('********* Se va a actualizar un vestido *********')

    db.Dress.findOne({
      where: {
        id: req.body.dressId
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
      dress.colorId = req.body.colorId
      dress.price = req.body.price
      dress.priceOriginal = req.body.priceOriginal
      dress.stateId = 1
      dress.updatedAt = new Date()

      console.log('****** Aplicando la actualizacion al vestido')
      dress.save()
      .then(function (dressNew) {
        console.log('*** Vestido actualizado: Id: ' + dressNew.id)

        res.redirect('/dresses/' + dress.id + '/update')
      })
      .catch(function (errors) {
        res.render('dresses/dress_update', {
          pageTitle: 'Vestido',
          pageName: 'dress_update',
          sessionUser: req.session.userLoged,
          errors: errors,
          dress: dress,
          brands: BRANDS,
          colors: COLORS
        })
      })
    })
    .catch(function (errors) {
      console.log('ERROR en la busqueda: ' + errors)
    })
  }
})

// crear un vestido, tiene que estar registrado, logeado y ser el propietario
router.get('/create', control.sessionValidate, function (req, res) {
  console.log('*************** Atendiendo la ruta: /dresses/:dressId/edit GET')

  res.render('dresses/dress_create', {
    pageTitle: 'Crear Vestido',
    pageName: 'dress_edit',
    sessionUser: req.session.userLoged,
    errors: null,
    dress: null,
    brands: BRANDS,
    colors: COLORS
  })
})

// crear un vestido, tiene que estar registrado, logeado y ser el propietario
router.post('/create', control.sessionValidate, function (req, res, next) {
  console.log('*************** Atendiendo la ruta: /dresses/create POST')

  console.log('****** Creando Vestido')

  if (typeof req.body.title === 'undefined') {
    console.log('********* NO EXISTE TITULO *********')
  } else {
    console.log('********* SI EXISTE TITULO *********' + req.body.title)
  }

  var dress = {}

  dress.title = req.body.title
  dress.description = req.body.description
  dress.brandId = req.body.brandId
  dress.price = req.body.price
  dress.stateId = 1
  if (req.session.userLoged) {
    dress.userId = req.session.userLoged.id
  } else {
    dress.userId = 1 // Esta linea no deberia necesitarse
  }
  dress.createdAt = new Date()
  dress.updatedAt = new Date()

  console.log('********* Dress: ' + dress.title)

  db.Dress.create(dress)
  .then(function (dressNew) {
    console.log('*** Vestido creado: Id: ' + dressNew.id)
    if (dressNew) {
      res.redirect('/dresses/mycloset')
    }
  })
  .catch(function (errors) {
    console.log('*** ERROR al grabar el vestido: ' + errors)
    if (errors) {
      res.render('dresses/dress_create', {
        pageTitle: 'Vestido',
        pageName: 'dress_create',
        sessionUser: req.session.userLoged,
        errors: errors,
        dress: dress,
        brands: BRANDS,
        colors: COLORS
      })
    }
  })
})

// carga la imagen de un vestido. tiene que estar registrado, logeado y ser el propietario
// tratar de unirlo con la ruta '/ POST'
router.post('/save_image', control.sessionValidate, control.isDressOwner, uploader.single('image'), function (req, res) {
  console.log('*************** Atendiendo la ruta: /dresses/load_image POST')
  if (req.file) {
    // var dirDest = '/images/dresses/'
    // console.log(req.file)
    // console.log('ID: ' + id)

    // dress.image = filePathDest
    console.log('********* Subiendo imagen ***********')
    cloudinary.uploader.upload(req.file.path, function (result) {
      console.log('********* viendo resultados')
      console.log(result)

      var fileUrl = result.url
      var fileSecureUrl = result.secure_url

      db.Dress.findOne({
        where: {
          id: req.body.dressId
        },
        include: {
          model: db.User,
          as: 'user'
        }
      })
      .then(function (dress) {
        dress.image = fileUrl
        console.log('********* Vestido a grabar: ' + dress)
        dress.save()
        .then(function (dressNew) {
          res.redirect('/dresses/' + dressNew.id + '/edit')
        })
      })
    })
  }
})

// publicar un vestido
router.get('/:dressId([0-9]+)/publish', control.sessionValidate, control.isDressOwner, function(req, res) {
	console.log('*************** Atendiendo la ruta: /dresses/:dressId/publish GET')
	var dressId = req.params.dressId

	db.Dress.findOne({
		where: {
			id: dressId
		}
	})
	.then(function (dress) {
		dress.update({stateId: 2}).then(function (dressNew) {
			//
			//	mensaje a los administradores para que ponga en venta el vestido o lo rechaze
			//
			res.redirect('/')
		})
	})
	.catch(function (errors) {
		console.log('*** ERROR en la busqueda del vestido: ' + dressId)
	})
})

// RUTAS PARA LOS ADMINISTRADORES
// poner en venta un vestido. esto lo hace un usuario administrador
router.get('/:dressId([0-9]+)/publish_acepted', function (req, res) {
	console.log('*************** Atendiendo la ruta: /dresses/:dressId/publish_acepted GET')
})

// No poner en venta un vestido (Rechazar por correcciones) y notificar al propietario. esto lo hace un usuario administrador
router.get('/:dressId([0-9]+)/publish_reject', function (req, res) {
	console.log('*************** Atendiendo la ruta: /dresses/:dressId/publish_reject GET')
})

// Listar los vestidos para el administrador
router.get('/admin', function (req, res, next) {
	console.log('*************** Atendiendo la ruta: /dresses/admin GET')
})

module.exports = router
