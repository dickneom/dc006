var express = require('express')
var router = express.Router()

var db = require('../models/db')	// ESTO NO DEBE ESTAR AQUI
var control = require('../models/control')

router.route('/')
	.get(function(req, res, next) {
		console.log('*************** Atendiendo la ruta: /register GET')
		res.render('register/register', {
			pageTitle: 'Registro',
			pageName: 'register',
			sessionUser: null,
			errors: null
		})
	})
	.post(function (req, res, next) {
		console.log('*************** Atendiendo la ruta: /register POST')

		var user = {}
		user.id = req.body.id
		user.nickname = req.body.nickname
		user.firstname = req.body.firstname
		user.lastname = req.body.lastname
		user.email = req.body.email
		user.birthdate = req.body.birthdate
		user.password = req.body.password

		var pass = req.body.password1
		var clavesIguales = true
		if (pass !== user.password) {
			user.password = null
			clavesIguales = false
		} else {
			user.password = control.encryptPassword(user.password)
		}

		user.createdAt = new Date()
		user.updatedAt = new Date()

		console.log('*** Registrar usuario: ' + user + ', createdAt: ' + user.createdAt + ', UpdatedAt: ' +  user.updatedAt)

		db.User.create(user)
		.then(function (userNew) {
			console.log('****** Registro creado correctamente!')
			var date = new Date().getTime()
			var message = userNew.id + ',' + date
			console.log('********* Email message: ' + message)
			message = '/register/' + control.encryptEmail(message)

			control.sendEmail(userNew.email, message)
			//
			// ENVIAR EMAIL
			// EN MENSAJE CONTIENE LOS DATOS: ID DEL USUARIO, FECHA Y HORA DE ENVIO
			// EL MENSAJE DEBE IR ENCRIPTADO
			//
			res.render('register/register_success', {
				pageTitle: 'Registro',
				pageName: 'register_success',
				sessionUser: null,
				errors: null,
				user: userNew,
				tempMessage: message	// Este mensaje debe enviarse por email
			})
		})
		.catch(function (errors) {
			console.log('****** ERROR. No se registraron los datos! : ' + errors)
	        var es = errors.errors
	        for (var i = 0; i < es.length; i++) {
	            var error = es[i]
	            if (error.path === 'clave' && !clavesIguales) {
	                es[i].message = 'Las contraseñas no son iguales'
	            }
	            console.log('********* Error ' + i + ' path: ' + error.path + ' error ' + error.message)
	        }
	        res.render('register/register', {
	            pageTitle: 'Registro',
	            pageName: 'register',
	            sessionUser: null,
	            user: user,
	            errors: errors.errors
	        })
		})
	})

router.get('/:verif', function (req, res) {
	console.log('*************** Atendiendo la ruta: /register/:verif GET')
	var code = req.params.verif

	if (code) {
		code = control.decryptEmail(code)
		var datos = code.split(',')
		var userId = datos[0]
		var date = new Date(parseInt(datos[1]))
		console.log('*** userId: ' + userId + ' date: ' + date)
		var dateNow = new Date()
		var dif = dateNow.getTime() - date.getTime()
		if (dif <= 1000 * 60 * 15) {
			console.log("****** TRANSCURRIDO MENOS DE 15 MIN")
			db.User.findOne({
				where: {
					id: userId
				}
			}).then(function (user) {
				if (user) {
					console.log('********* Autenticando: ' + user.nickname)
					user.update({authenticated: true})
					.then(function (userNew) {
						console.log('********* Actualizado: ' + userNew.id)
						control.sessionInit(req, res, userNew)
						res.render('register/register_verified', {
							pageTitle: 'Registro Verificado',
							pageName: 'register_verified',
							sessionUser: userNew,
							errors: null
						})
					})
					.catch(function(errors) {
                        console.log('****** ERROR en la actualizacion del usuario')
                        res.render('error', error)
					})
				} else {
					console.log('****** ERROR usuario no encontrado')
					// HACER ALGO SI NO SE ENCUENTRA
				} // fin verificar si se encontro el usuario
            }).catch(function (errors) {
                console.log('****** ERROR en la busqueda el usuario: ' + errors)
                res.render('error', errors)
            })
		} else {
			console.log("****** TRANSCURRIDO MAS DE 15 MIN. EMAIL CADUCADO")
            //
            //  SE DEBE HACER ALGO CUANDO CADUCA EL MENSAJE
            //
		} // fin verifica caducidad
	} else {
		console.log('ERROR. Ruta sin codigo de verificacion.')
	}  // fin if (code)
})

module.exports = router;