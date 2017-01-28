var express = require('express')
var router = express.Router()

var db = require('../models/db')
var control = require('../models/control')

router.route('/')
	.get(function (req, res, next) {
		console.log('*************** Atendiendo la ruta: /pass_recover GET')
		res.render('pass_recover/pass_recover', {
			pageTitle: 'Recuperar contraseña',
			pageName: 'pass_recover',
			sessionUser: null,
			errors: null
		})
	})
	.post(function (req, res, next) {
		console.log('*************** Atendiendo la ruta: /pass_recover POST')
		var email = req.body.email

		if (email && email.length > 0)
			db.User.findOne({
				where: {
					email: email
				}
			})
			.then(function (user) {
				if (user) {
					console.log('****** Usuario encontrado')
	                console.log('User: ' + user.id + ' email: ' + user.email)
                	var date = new Date().getTime()
                	var message = user.id + ',' + date
                	console.log('*** MENSAJE: ' + message)
                	var message = control.encryptEmail(message)
	                //
	                //  SE DEBE ENVIAR UN CODIGO ESPECIAL
	                //  ENVIAR EMAIL, CON UN ENLACE QUE CADUCA
	                //
	                res.render('pass_recover/pass_recover_email', {
	                    pageTitle: 'Recuperar contraseña',
	                    pageName: 'pass_recover_email',
	                    sessionUser: null,
	                    errors: null,
	                    user: user,
	                    tempMessage: message 	// este mensaje se debe enviar al email
	                })
				} else {
					console.log('****** Usuario no encontrado con el email: ' + email)
					var error = 'Email no encontrado'
					res.render('pass_recover/pass_recover', {
						pageTitle: 'Recuperar contraseña',
						pageName: 'pass_recover',
						sessionUser: null,
						errors: [error]
					})
				}
			})
			.catch(function (errors) {
				console.log('ERROR: ' + errors)
			})
		else {
			var error = 'Email no puede estar vacio'
			console.log('ERROR: ' + error)
			res.render('pass_recover/pass_recover', {
				pageTitle: 'Recuperar contraseña',
				pageName: 'pass_recover',
				sessionUser: null,
				errors: [error]
			})
		} // fin comprobacion de email vacio
	})

router.route('/change/:code')
	.get(function (req, res, next) {
		console.log('*************** Atendiendo la ruta: /pass_recover/change/:code GET')
		var code = req.params.code

		if (code) {
			code = control.decryptEmail(code)
			var datos = code.split(',')
			var userId = datos[0]
			var date = new Date(parseInt(datos[1]))
	        console.log('userId: ' + userId + ' date: ' + date)
	        var dateNow = new Date()
	        var dif = dateNow.getTime() - date.getTime()
	        console.log('TRANSCURRIDO: ' + dif + ' min:' + dif/1000/60)
	        
	        if (dif <= 15*60*1000) {
	        	console.log("TRANSCURRIDO MENOS DE 15 MIN")

	        	db.User.findOne({
	        		where: {
	        			id: userId
	        		}
	        	}).then(function (user) {
	        		if (user) {
	        			console.log('****** User: ' + user.id + ' email: ' + user.email)
						res.render('pass_recover/pass_recover_change', {
							pageTitle: 'Recuperar contraseña',
							pageName: 'pass_recover_change',
							sessionUser: null,
							errors: null,
							userId: userId
						})
	        		} else {
	                    console.log('****** Usuario no encontrado')
	                    var error = 'No se encontro el usuario'
	                    res.render('pass_recover/pass_recover_error', {
	                        pageTitle: 'Recuperar contraseña error',
	                        pageName: 'pass_recover_error',
	                        sessionUser: null,
	                        errors: error
	                    })
	        		}
	        	}).catch(function (errors) {
	        		console.log('****** ERROR usuario no encontrado: ' + error)
	        	})
	        } else {
	            console.log("TRANSCURRIDO MAS DE 15 MIN")
	            var error = 'En el enlace a caducado. Vuelva a intentarlo.'
	            res.render('pass_recover/pass_recover', {
	                pageTitle: 'Recuperar contraseña',
	                pageName: 'pass_recover',
	                sessionUser: null,
	                errors: [error]
	            })
	        } 
		} else {
			error = 'codigo vacio'
			console.log('ERROR: ' + error)
		} // fin code vacio
	})

router.route('/change')
	.post(function (req, res, next) {
		console.log('*************** Atendiendo la ruta: /pass_recover/change POST')
	    var password = req.body.password
	    var password1 = req.body.password1
	    var userId = req.body.id

	    if (password === password1) {
	        db.User.findOne({
	            where: {
	                id: userId
	            }
	        }).then(function (user) {
	            console.log('****** Actualizando password de: ' + user.nickname)
	            if (user) {
//		            if (user.authenticated) {
		                var pass = control.encriptPassword(password)
		                user.update({password: pass})
		                .then(function (user) {
		                    control.sessionInit(req, res, user)
		                    res.render('pass_recover/pass_recover_success', {
		                        pageTitle: 'Recuperacion de contraseña exitosa',
		                        pageName: 'pass_recover_success',
		                        sessionUser: req.session.userLoged,
		                        errors: null,
		                        userId: userId
		                    })
		                })
		                .catch(function (error) {
		                    console.log(error)
		                    res.render('error', error)
		                })
/*		            } else {
		                var error = 'Usuario no autenticado, complete el registro'
		                console.log('ERROR: ' + error)
		                res.render('anonymous/pass_recover_change', {
		                    pageTitle: 'Recuperar contraseña',
		                    pageName: 'pass_recover_change',
		                    sessionUser: null,
		                    errors: [error],
		                    userId: userId
		                }) 
		            } */
		        } else {
		        	console.log('ERROR Usuario no encontrado')
		        }
	        })
	    } else {
	        var error = 'Las contraseñas no coinciden'
	        console.log(error)
	        res.render('pass_recover/pass_recover_change', {
	            pageTitle: 'Recuperar contraseña',
	            pageName: 'pass_recover_change',
	            sessionUser: null,
	            errors: [error],
	            userId: userId
	        })
	    } // Fin verificar que los password ingresados sean iguales
	})

module.exports = router