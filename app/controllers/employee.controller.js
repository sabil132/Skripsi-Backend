require("dotenv").config();
const sequelize = require("sequelize");

const responseFormatter = require("../helpers/responseFormatter");
const sendMail = require("../helpers/email");
const { Employee, Position, Unit, Head_Unit } = require("../models");

class EmployeeController {
  static getAllEmployee = async (req, res) => {
    try {
      const employees = await Employee.findAll({
        include: [
          {
            model: Position,
            attributes: ["id", "name"],
          },
          {
            model: Unit,
            attributes: ["id", "name"],
          },
        ],
        attributes: { 
          exclude: ["password", "position_id", "unit_id"] 
        },
      });

      return res.status(200).json(responseFormatter.success(employees, "Product found", res.statusCode));
    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  static getEmployeeById = async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await Employee.findByPk(id, {
        attributes: { exclude: ["password"] },
        include: [
          {
            model: Position,
            attributes: ["id", "name"],
          },
          {
            model: Unit,
            attributes: ["id", "name"],
          },
        ],
      });

      if (!employee) {
        return res.status(404).json(responseFormatter.error(null, "Employee not found", res.statusCode));
      }

      return res.status(200).json(responseFormatter.success(employee, "Employee found", res.statusCode));
    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }

  static getEmployeByUnit = async (req, res) => {
    try {
      const { id } = req.params;

      const headUnit = await Head_Unit.findOne({ where: { unit_id: id } });

      let employees
      if (!headUnit) {
        employees = await Employee.findAll({
          where: { 
            unit_id: id,
          },
          include: [
            {
              model: Position,
              attributes: ["id", "name"],
            },
          ],
          attributes: { 
            exclude: ["password", "position_id", "unit_id"],
          },
        });
      }else{
        employees = await Employee.findAll({
          where: { 
            unit_id: id,
            id: {
              [sequelize.Op.notIn]: [headUnit.employee_id]
            }
          },
          include: [
            {
              model: Position,
              attributes: ["id", "name"],
            },
          ],
          attributes: { 
            exclude: ["password", "position_id", "unit_id"],
          },
        });
      }

      if (!employees) {
        return res.status(404).json(responseFormatter.error(null, "Employee not found", res.statusCode));
      }

      return res.status(200).json(responseFormatter.success(employees, "Employee found", res.statusCode));
    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }

  static createEmployee = async (req, res) => {
    try {
      const { name, placeOfBirth, dateOfBirth, status, gender, dateEntry, phone, email, role, position_id, unit_id } = req.body;
      console.log(req.body.email);
      const clearEmail = email.toLowerCase();

      const emailExist = await Employee.findOne({ where: { email: email } });

      if (emailExist) {
        return res.status(409).json(responseFormatter.error(null, "Email already exist", res.statusCode));
      }

      const employee = await Employee.create({
        name: name,
        place_of_birth: placeOfBirth,
        date_of_birth: dateOfBirth,
        marital_status: status,
        gender: gender,
        date_entry: dateEntry,
        phone: phone,
        email: clearEmail,
        is_active: false,
        role: role,
        position_id: position_id,
        unit_id: unit_id
      });

      const userData = {
        id: employee.dataValues.id,
        name: employee.dataValues.name,
        place_of_birth: employee.dataValues.place_of_birth,
        date_of_birth: employee.dataValues.date_of_birth,
        marital_status: employee.dataValues.marital_status,
        gender: employee.dataValues.gender,
        date_entry: employee.dataValues.date_entry,
        phone: employee.dataValues.phone,
        email: employee.dataValues.email,
        role: employee.dataValues.role
      }

      const mailOptions = {
        from: "BAGUS.10119064 <bagus.10119064@mahasiswa.unikom.ac.id>",
        to: clearEmail,
        subject: "Account Activation",
        html: `<a href='http://localhost:5173/activation?token=${btoa(JSON.stringify(userData))}'>Click this link to activate your account</a>`
      }

      sendMail(mailOptions);

      return res.status(201).json(responseFormatter.success(employee, "Employee created", res.statusCode));
    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }
  
  static updateEmployee = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, placeOfBirth, dateOfBirth, status, gender, dateEntry, phone, email, role, position_id, unit_id } = req.body;

      const employee = await Employee.findByPk(id);

      if (!employee) {
        return res.status(404).json(responseFormatter.error(null, "Employee not found", res.statusCode));
      }

      if (email) {
        if (employee.email !== email) {
          const emailExist = await Employee.findOne({ where: { email: email } });

          if (emailExist) {
            return res.status(409).json(responseFormatter.error(null, "Email already exist", res.statusCode));
          }
        }
      }

      await Employee.update({
        name: name,
        place_of_birth: placeOfBirth,
        date_of_birth: dateOfBirth,
        marital_status: status,
        gender: gender,
        date_entry: dateEntry,
        phone: phone,
        email: email,
        position_id: position_id,
        unit_id: unit_id,
        role: role
      }, {
        where: {
          id
        },
      });

      const retrivied = await Employee.findByPk(id);

      return res.status(200).json(responseFormatter.success(retrivied, "Employee updated", res.statusCode));
    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }

  static deleteEmployee = async (req, res) => {
    try {
      const { id } = req.params;

      const employeeExist = await Employee.findByPk(id);

      if (!employeeExist) {
        return res.status(404).json(responseFormatter.error(employee, "Employee not found", res.statusCode));
      }

      await Employee.destroy({
        where: {
          id
        }
      });

      return res.status(200).json(responseFormatter.success(employeeExist, "Employee deleted", res.statusCode));
    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }
}

module.exports = EmployeeController;