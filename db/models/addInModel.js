const Sequelize = require('sequelize')
const sequelize = require('../conn')

const schema = {
  name: Sequelize.STRING,
  addPrice: Sequelize.INTEGER,
}

module.exports = sequelize.define('addIn', schema, { timestamps: false })