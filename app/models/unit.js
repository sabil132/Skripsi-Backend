'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Unit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Employee, {
        foreignKey: {
          name: 'id'
        },
      })

      this.hasOne(models.Head_Unit, {
        foreignKey: {
          name: 'unit_id'
        }
      });
    }
  }
  Unit.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Unit',
  });
  return Unit;
};