const sequelize = require("sequelize");

const responseFormatter = require("../helpers/responseFormatter");
const { Head_Unit } = require("../models");

class HeadUnitController extends Controller
{
  static getAllHeadUnits = async (req, res) =>
  {
    try {
      const headUnits = await Head_Unit.findAll();

      return res.status(200).json(responseFormatter.success(headUnits, "Head units retrieved", res.statusCode));
    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }

  static getHeadUnitById = async (req, res) =>
  {
    try {
      const { id } = req.params;
      const headUnit = await Head_Unit.findByPk(id);

      if (!headUnit) {
        return res.status(404).json(responseFormatter.error(null, "Head unit not found", res.statusCode));
      }

      return res.status(200).json(responseFormatter.success(headUnit, "Head unit retrieved", res.statusCode));
    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }

  static createHeadUnit = async (req, res) =>
  {
    try {
      const { unit_id, employee_id } = req.body;

      const employeeHasAssign = await Head_Unit.findOne({
        where: {
          employee_id: employee_id
        }
      });

      if (employeeHasAssign) {
        return res.status(409).json(responseFormatter.error(null, "Employee already has assign", res.statusCode));
      }

      const headUnit = await Head_Unit.create({
        unit_id: unit_id,
        employee_id: employee_id,
      });

      return res.status(201).json(responseFormatter.success(headUnit, "Head unit created", res.statusCode));
    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }

  static updateHeadUnit = async (req, res) => {
    try {
      const { id } = req.params;
      const { unit_id, employee_id } = req.body;

      const headUnit = await Head_Unit.findByPk(id);

      if (!headUnit) {
        return res.status(404).json(responseFormatter.error(null, "Head unit not found", res.statusCode));
      }

      const employeeHasAssign = await Head_Unit.findOne({
        where: {
          employee_id: employee_id
        }
      });

      if (employeeHasAssign) {
        return res.status(409).json(responseFormatter.error(null, "Employee already has assign", res.statusCode));
      }

      await Head_Unit.update({
        unit_id: unit_id,
        employee_id: employee_id,
      }, {
        where: {
          id: id
        }
      });

      const retrivied = await Head_Unit.findByPk(id);

      return res.status(200).json(responseFormatter.success(retrivied, "Head unit updated", res.statusCode));
    } catch (error) {
      
    }
  }

  static deleteHeadUnit = async (req, res) => {
    try {
      const { id } = req.params;

      const headUnitExist = await Head_Unit.findByPk(id);

      if (!headUnitExist) {
        return res.status(404).json(responseFormatter.error(null, "Head unit not found", res.statusCode));
      }

      await Head_Unit.destroy({
        where: {
          id: id
        }
      });

      const retrivied = await Head_Unit.findByPk(id);

      return res.status(200).json(responseFormatter.success(headUnitExist, "Head unit deleted", res.statusCode));
    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }
}

module.exports = HeadUnitController;