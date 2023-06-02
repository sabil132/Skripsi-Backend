const sequelize = require("sequelize");

const responseFormatter = require("../helpers/responseFormatter");
const { Unit, Head_Unit, Employee } = require("../models");

class UnitController {
  static getAllUnit = async (req, res) => {
    try {

      const unit = await Unit.findAll({
        include: [
          {
            model: Head_Unit,
            attributes: ['id'],
            include: [
              {
                model: Employee,
                attributes: ['id', 'name']
              }
            ]
          }
        ]
      });

      return res.status(200).json(responseFormatter.success(unit, "Unit found", res.statusCode));
    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }

  static getUnitById = async (req, res) => {
    try {
      const { id } = req.params;
      const unit = await Unit.findByPk(id, {
        include: [
          {
            model: Head_Unit,
            attributes: ['id'],
            include: [
              {
                model: Employee,
                attributes: ['id', 'name']
              }
            ]
          }
        ]
      });

      if (!unit) {
        return res.status(404).json(responseFormatter.error(null, "Unit not found", res.statusCode));
      }

      return res.status(200).json(responseFormatter.success(unit, "Unit found", res.statusCode));
    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }

  static createUnit = async (req, res) => {
    try {
      const { name } = req.body;

      const unitExist = await Unit.findOne({ 
        where: { 
          name: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), 'LIKE', '%' + name.toLowerCase() + '%') 
        } 
      });

      if (unitExist) {
        return res.status(409).json(responseFormatter.error(null, "Unit name already exist", res.statusCode));
      }

      const unit = await Unit.create({
        name: name
      });

      return res.status(201).json(responseFormatter.success(unit, "Unit created", res.statusCode));
    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }

  static updateUnit = async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const unitExist = await Unit.findByPk(id);

      if (!unitExist) {
        return res.status(404).json(responseFormatter.error(null, "Unit not found", res.statusCode));
      }

      if(name !== unitExist.name) {
        const unitNameExist = await Unit.findOne({ 
          where: { 
            name: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), name.toLowerCase()) 
          } 
        });

        if (unitNameExist) {
          return res.status(409).json(responseFormatter.error(null, "Unit name already exist", res.statusCode));
        }
      }

      await Unit.update({
        name: name
      }, {
        where: {
          id: id
        },
      });

      const retrivied = await Unit.findByPk(id);

      return res.status(200).json(responseFormatter.success(retrivied, "Unit updated", res.statusCode));
    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }

  static deleteUnit = async (req, res) => {
    try {
      const { id } = req.params;

      const unitExist = await Unit.findByPk(id);

      if (!unitExist) {
        return res.status(404).json(responseFormatter.error(null, "Unit not found", res.statusCode));
      }

      await Unit.destroy({
        where: {
          id
        }
      });

      return res.status(200).json(responseFormatter.success(unitExist, "Unit deleted", res.statusCode));
    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }
}

module.exports = UnitController;