'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Employee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Presence, {
        foreignKey: {
          name: 'id'
        }
      })

      this.hasOne(models.Head_Unit, {
        foreignKey: {
          name: 'id'
        }
      });

      this.belongsTo(models.Position, {
        foreignKey: {
          name: 'position_id'
        }
      })

      this.belongsTo(models.Unit, {
        foreignKey: {
          name: 'unit_id'
        }
      })
    }
  }
  Employee.init({
    name: DataTypes.STRING,
    place_of_birth: DataTypes.STRING,
    date_of_birth: DataTypes.DATEONLY,
    marital_status: DataTypes.ENUM('Single', 'Married', 'Widow', 'Widower'),
    gender: DataTypes.ENUM('Male', 'Female'),
    date_entry: DataTypes.DATEONLY,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    photo: DataTypes.STRING,
    is_active: DataTypes.BOOLEAN,
    role: DataTypes.ENUM('Administrator', 'Staff'),
    position_id: DataTypes.INTEGER,
    unit_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Employee',
  });
  return Employee;
};