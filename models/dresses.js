// /models.dresses.js

module.exports = function (sequelize, DataTypes) {
  var Dress = sequelize.define('Dress', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.TEXT
    },
    description: {
      type: DataTypes.TEXT
    },
    colorId: {
      type: DataTypes.INTEGER,
      field: 'color_id'
    },
    brandId: {  // Marca del vestido
      type: DataTypes.INTEGER,
      field: 'brand_id'
    },
    price: {  // precio de venta
      type: DataTypes.NUMERIC
    },
    priceOriginal: {  // Precio del mercado o precio en que fue comprado
      type: DataTypes.NUMERIC,
      field: 'price_original'
    },
    categoId: { // Noche, Dia, Novia, Quinceañera...
      type: DataTypes.INTEGER,
      field: 'catego_id'
    },
    long: {   // Largo, medio o corto
      type: DataTypes.TEXT
    },
    size: {   // Talla
      type: DataTypes.TEXT
    },
/*    userId: {  // id el usuario dueño del vestido
      type: DataTypes.INTEGER,
      field: 'user_id'
    }, */
    createdAt: { // Fecha en qeue se registro el vestido (creacion)
      type: DataTypes.DATE
    },
    updatedAt: {
      type: DataTypes.DATE
    },
    deletedAt: {
      type: DataTypes.DATE
    },
    publicatedAt: {  // Fecha en que fue publicado (puesto en venta)
      type: DataTypes.DATE
    },
    soldAt: { // Fecha en que fue comprado o vendido
      type: DataTypes.DATE
    }
  }, {
    tableName: 'dresses',
    timestamp: true,
    paranoid: true
    // aqui faltan las relaciones
  })

  return Dress
}
