'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Head_Unit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Unit, {
        foreignKey: {
          name: 'id'
        }
      });

      this.belongsTo(models.Employee, {
        foreignKey: {
          name: 'employee_id'
        }
      });
    }
  }
  Head_Unit.init({
    unit_id: DataTypes.INTEGER,
    employee_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Head_Unit',
  });
  return Head_Unit;
};