'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class request_update_photo_profile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  request_update_photo_profile.init({
    photo: DataTypes.STRING,
    is_approved: DataTypes.BOOLEAN,
    employee_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'request_update_photo_profile',
  });
  return request_update_photo_profile;
};