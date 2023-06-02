'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Detail_Presence_Clock_In extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Presence, {
        foreignKey: {
          name: 'id'
        }
      });
    }
  }
  Detail_Presence_Clock_In.init({
    clock_in: DataTypes.DATE,
    note: DataTypes.STRING,
    photo: DataTypes.STRING,
    latitude: DataTypes.DOUBLE,
    longitude: DataTypes.DOUBLE,
    presence_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Detail_Presence_Clock_In',
  });
  return Detail_Presence_Clock_In;
};