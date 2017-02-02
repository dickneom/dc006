// /models/users.js

module.exports = function (sequelize, DataTypes) {
  var User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nickname: {
      type: DataTypes.TEXT,
      allowNull: {args: false, msg: 'No puede ser nulo.'},
      validate: {
        notEmpty: {args: true, msg: 'El alias no puede estar vacio.'}
      }
    },
    firstname: {
      type: DataTypes.TEXT,
      allowNull: {args: false, msg: 'No puede ser nulo.'},
      validate: {
        notEmpty: {args: true, msg: 'El nombre no puede estar vacio.'}
      }
    },
    lastname: {
      type: DataTypes.TEXT,
      allowNull: {args: false, msg: 'No puede ser nulo.'},
      validate: {
        notEmpty: {args: true, msg: 'El apellido no puede estar vacio.'}
      }
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: {args: false, msg: 'No puede ser nulo.'},
      unique: {args: true, msg: 'El email ya esta registrado.'},
      validate: {
        notEmpty: {args: true, msg: 'El email no puede estar vacio.'},
        isEmail: {args: true, msg: 'No es un email.'}
      }
    },
    birthdate: {
      type: DataTypes.DATE,
      allowNull: {args: false, msg: 'No puede ser nulo.'},
      validate: {
        notEmpty: {args: true, msg: 'La fecha de nacimiento no puede estar vacia.'},
        isDate: {args: true, msg: 'Formato de fecha no valido.'},
        isEmpty: function (value) {
          console.log('birthdate: -' + value + '-')
          if (value.length === 0) {
            throw new Error('La fecha de nacimiento no puede estar vacia.')
          }
        }
      }
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: {args: false, msg: 'No puede ser nulo'},
      notEmpty: true,
      notNull: true,
      validate: {
        len: {args: [6, 20], msg: 'La clave debe tener de 6 a 20 caracteres'}
      }
    },
    authenticated: {
      type: DataTypes.BOOLEAN,
      default: false
    },
    genderId: {
      type: DataTypes.INTEGER,
      field: 'gender_id'
    },
    phone: {
      type: DataTypes.TEXT,
      validate: {
        isNumeric: {args: true, msg: 'El telefono solo puede contener numeros'}
      }
    },
    picture: {
      type: DataTypes.TEXT
    },
    size: {   // Talla
      type: DataTypes.TEXT
    },
    useNickname: {
      type: DataTypes.BOOLEAN,
      field: 'use_nickname'
    },
    dirCountry: {
      type: DataTypes.TEXT,
      field: 'dir_country'
    },
    dirState: {
      type: DataTypes.TEXT,
      field: 'dir_state'
    },
    dirCity: {
      type: DataTypes.TEXT,
      field: 'dir_city'
    },
    dirStreet: {
      type: DataTypes.TEXT,
      field: 'dir_street'
    },
    dirNumber: {
      type: DataTypes.TEXT,
      field: 'dir_number'
    },
    dirStreetSec: {
      type: DataTypes.TEXT,
      field: 'dir_street_sec'
    },
    dirReference: {
      type: DataTypes.TEXT,
      field: 'dir_reference'
    },
    dirPOBox: {
      type: DataTypes.TEXT,
      field: 'dir_pobox'
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      field: 'is_admin',
      default: false
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at'
    },
    deletedAt: {
      type: DataTypes.DATE,
      field: 'deleted_at'
    }
  }, {
    tableName: 'users',
    timestamp: true,
    paranoid: true,
    getterMethods: {
      fullname: function () {
        var firstname = this.getDataValue('firstname')
        var lastname = this.getDataValue('lastname')
        var fullName = firstname + ' ' + lastname
        return fullName
      }
    }
    // aqui faltan las relaciones
  })

  return User
}
