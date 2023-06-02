'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Employees', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      place_of_birth: {
        type: Sequelize.STRING
      },
      date_of_birth: {
        type: Sequelize.DATEONLY
      },
      marital_status: {
        type: Sequelize.ENUM('Single', 'Married', 'Widow', 'Widower')
      },
      gender: {
        type: Sequelize.ENUM('Male', 'Female')
      },
      date_entry: {
        type: Sequelize.DATEONLY
      },
      phone: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      photo: {
        type: Sequelize.STRING
      },
      role: {
        type: Sequelize.STRING
      },
      is_active: {
        type: Sequelize.BOOLEAN
      },
      position_id: {
        type: Sequelize.INTEGER,
      },
      unit_id: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Employees');
  }
};