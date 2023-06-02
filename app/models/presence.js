'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Presence extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Employee, {
        foreignKey: {
          name: 'employee_id'
        }
      })

      this.hasOne(models.Detail_Presence_Clock_In, {
        foreignKey: {
          name: 'presence_id'
        }
      });

      this.hasOne(models.Detail_Presence_Clock_Out, {
        foreignKey: {
          name: 'presence_id'
        }
      });
    }
  }
  Presence.init({
    date: DataTypes.DATEONLY,
    working_hours: DataTypes.INTEGER,
    employee_id: DataTypes.DOUBLE
  }, {
    sequelize,
    modelName: 'Presence',
  });
  return Presence;
};