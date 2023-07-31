const sequelize = require("sequelize");

const responseFormatter = require("../helpers/responseFormatter");
const { Position, Employee } = require("../models");

class PositionController {
  static getAllPosition = async (req, res) => {
    try {
      const positions = await Position.findAll({
        where: sequelize.where(
          sequelize.fn('lower', sequelize.col('Position.name')),{[sequelize.Op.like]: `%${req.query.name.toLowerCase() || ''}%`}
        )
      });

      
      return res.status(200).json(responseFormatter.success(positions, "Position found", res.statusCode));
    } catch (error) {
      console.log(error);
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }

  static getPositionById = async (req, res) => {
    try {
      const { id } = req.params;
      const position = await Position.findByPk(id);

      if (!position) {
        return res.status(404).json(responseFormatter.error(null, "Position not found", res.statusCode));
      }

      return res.status(200).json(responseFormatter.success(position, "Position found", res.statusCode));
    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }

  static createPosition = async (req, res) => {
    try {
      const { name } = req.body;

      const positionExist = await Position.findOne({ 
        where: { 
          name: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), 'LIKE', '%' + name.toLowerCase() + '%') 
        } 
      });

      if (positionExist) {
        return res.status(409).json(responseFormatter.error(null, "Position name already exist", res.statusCode));
      }

      const position = await Position.create({
        name: name
      });

      return res.status(201).json(responseFormatter.success(position, "Position created", res.statusCode));
    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }

  static updatePosition = async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const positionExist = await Position.findByPk(id);

      if (!positionExist) {
        return res.status(404).json(responseFormatter.error(null, "Position not found", res.statusCode));
      }

      if(name !== positionExist.name) {      
        const positionNameExist = await Position.findOne({ 
          where: { 
            name: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), name.toLowerCase()) 
          } 
        });

        if (positionNameExist) {
          return res.status(409).json(responseFormatter.error(null, "Position name already exist", res.statusCode));
        }
      }

      await Position.update({
        name: name
      }, {
        where: {
          id: id
        }
      });

      const retrivied = await Position.findByPk(id);

      return res.status(200).json(responseFormatter.success(retrivied, "Position updated", res.statusCode));
    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }

  static deletePosition = async (req, res) => {
    try {
      const { id } = req.params;

      const positionExist = await Position.findByPk(id);

      if (!positionExist) {
        return res.status(404).json(responseFormatter.error(null, "Position not found", res.statusCode));
      }

      const positionIsUser = await Employee.findOne({
        where: {
          position_id: id
        }
      });

      if (positionIsUser) {
        return res.status(409).json(responseFormatter.error(null, "Position already used", res.statusCode));
      }
      
      await Position.destroy({
        where: {
          id: id
        }
      });

      return res.status(200).json(responseFormatter.success(positionExist, "Position deleted", res.statusCode));
    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }
}

module.exports = PositionController;