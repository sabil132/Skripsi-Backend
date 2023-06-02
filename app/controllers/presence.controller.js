const moment = require('moment')
const { fn, col, literal, where } = require("sequelize");

const cloudinary = require("../config/cloudinary");
const responseFormatter = require("../helpers/responseFormatter");
const { Presence, Detail_Presence_Clock_In, Detail_Presence_Clock_Out, Employee, Position, Unit } = require("../models");

class PresenceController {
  static getAllPresenceGroupByUserId = async (req, res) => {
    try {
      const month = req.body.month

      const presence = await Presence.findAll({
        include: [
          {
            model: Employee,
            attributes: ['id', 'name']
          },
        ],
        attributes: [
          [fn('sum', col('working_hours')), 'total_working_hours'],
          [fn("date_trunc", 'month', col("date")), 'month'],
          [fn("date_trunc", 'year', col("date")), 'year'],
        ],
        group: ['month', 'year', 'Employee.id'],
        where: where(literal('to_char("Presence"."date", \'YYYY-MM\')'), month ? month : moment().format('YYYY-MM'))
      });

      const response = presence.map((item) => {
        return {
          total_working_hours: item.dataValues.total_working_hours,
          month: moment(item.dataValues.month).format('MMMM'),
          year: moment(item.dataValues.year).format('YYYY'),
          employee: {
            id: item.Employee.id,
            name: item.Employee.name
          }
        }
      })

      return res.status(200).json(responseFormatter.success(response, "Presence found", res.statusCode));
    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }

  static getAllPresenceByUserId = async (req, res) => {
    try {
      const { userId, month } = req.params;
      
      const existUserPresence = await Presence.findOne({
        where: {
          employee_id : userId
        }
      });

      if (!existUserPresence) {
        return res.status(404).json(responseFormatter.error(null, "Presence not found", res.statusCode));
      }
      
      const employee = await Employee.findByPk(userId, {
        include: [
          {
            model: Position,
            attributes: ['name']
          },
          {
            model: Unit,
            attributes: ['name']
          },
        ]
      });

      const presence = await Presence.findAll({
        include: [
          {
            model: Detail_Presence_Clock_In,
            attributes: ['clock_in', 'note', 'photo', 'latitude', 'longitude']
          },
          {
            model: Detail_Presence_Clock_Out,
            attributes: ['clock_out', 'note', 'photo', 'latitude', 'longitude']
          },
        ],
        where: [
          where(literal('"Presence"."employee_id"'), userId),
          where(literal('to_char("Presence"."date", \'YYYY-MM\')'), month ? month : moment().format('YYYY-MM')),
        ],
        order: [
          ['date', 'DESC']
        ]
      });

      const response = {
        id: employee.id,
        name: employee.name,
        unit: employee.Unit.name,
        position: employee.Position.name,
        date_entry: employee.date_entry,
        presence: presence.map((item) => {
          return {
            id: item.id,
            date: item.date,
            clock_in: moment(item.Detail_Presence_Clock_In.clock_in).format('HH:mm'),
            clock_out: item.Detail_Presence_Clock_Out? moment(item.Detail_Presence_Clock_Out.clock_out).format('HH:mm') : null,
            working_hours: item.working_hours,
          }
        })
      }

      return res.status(200).json(responseFormatter.success(response, "Presence found", res.statusCode));
    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }

  static getPresenceById = async (req, res) => {
    try {
      const { id } = req.params;

      const presence = await Presence.findOne({
        include: [
          {
            model: Detail_Presence_Clock_In,
            attributes: ['clock_in', 'note', 'photo', 'latitude', 'longitude']
          },
          {
            model: Detail_Presence_Clock_Out,
            attributes: ['clock_out', 'note', 'photo', 'latitude', 'longitude']
          },
        ],
        where: {
          id: id
        }
      });

      if (!presence) {
        return res.status(404).json(responseFormatter.error(null, "Presence not found", res.statusCode));
      }

      const response = {
        id: presence.id,
        date: presence.date,
        working_hours: presence.working_hours,
        presence_in: {
          clock_in: moment(presence.Detail_Presence_Clock_In.clock_in).format('HH:mm'),
          note: presence.Detail_Presence_Clock_In.note,
          photo: presence.Detail_Presence_Clock_In.photo,
          latitude: presence.Detail_Presence_Clock_In.latitude,
          longitude: presence.Detail_Presence_Clock_In.longitude,
        },
        presence_out:  {
          clock_out: presence.Detail_Presence_Clock_Out ? moment(presence.Detail_Presence_Clock_Out.clock_out).format('HH:mm') : null,
          note: presence.Detail_Presence_Clock_Out ? presence.Detail_Presence_Clock_Out.note : null,
          photo: presence.Detail_Presence_Clock_Out ? presence.Detail_Presence_Clock_Out.photo : null,
          latitude: presence.Detail_Presence_Clock_Out ? presence.Detail_Presence_Clock_Out.latitude : null,
          longitude: presence.Detail_Presence_Clock_Out ? presence.Detail_Presence_Clock_Out.longitude : null,
        },
      }

      return res.status(200).json(responseFormatter.success(response, "Presence found", res.statusCode));
    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }

  static getPresenceByUserIdAndDate = async (req, res) => {
    try {
      const { userId } = req.params;

      const existUserPresence = await Presence.findOne({
        include: [
          {
            model: Detail_Presence_Clock_In,
            attributes: ['clock_in', 'note', 'photo', 'latitude', 'longitude']
          },
          {
            model: Detail_Presence_Clock_Out,
            attributes: ['clock_out', 'note', 'photo', 'latitude', 'longitude']
          },
        ],
        where: {
          employee_id : userId,
          date: moment().format('YYYY-MM-DD')
        }
      });

      if (!existUserPresence) {
        return res.status(404).json(responseFormatter.error(null, "Presence not found", res.statusCode));
      }

      const response = {
        id: existUserPresence.id,
        date: existUserPresence.date,
        working_hours: existUserPresence.working_hours,
        presence_in: {
          clock_in: moment(existUserPresence.Detail_Presence_Clock_In.clock_in).format('HH:mm'),
          note: existUserPresence.Detail_Presence_Clock_In.note,
          photo: existUserPresence.Detail_Presence_Clock_In.photo,
          latitude: existUserPresence.Detail_Presence_Clock_In.latitude,
          longitude: existUserPresence.Detail_Presence_Clock_In.longitude,
        },
        presence_out:  {
          clock_out: existUserPresence.Detail_Presence_Clock_Out ? moment(existUserPresence.Detail_Presence_Clock_Out.clock_out).format('HH:mm') : null,
          note: existUserPresence.Detail_Presence_Clock_Out ? existUserPresence.Detail_Presence_Clock_Out.note : null,
          photo: existUserPresence.Detail_Presence_Clock_Out ? existUserPresence.Detail_Presence_Clock_Out.photo : null,
          latitude: existUserPresence.Detail_Presence_Clock_Out ? existUserPresence.Detail_Presence_Clock_Out.latitude : null,
          longitude: existUserPresence.Detail_Presence_Clock_Out ?existUserPresence.Detail_Presence_Clock_Out.longitude : null,
        },
      }

      return res.status(200).json(responseFormatter.success(response, "Presence found", res.statusCode));
    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }
        

  static createPresence = async (req, res) => {
    try {
      const { employee_id, note, latitude, longitude } = req.body;

      const presence = await Presence.create({
        date: moment().format('YYYY-MM-DD'),
        employee_id: employee_id
      });

      let presence_in;
      if(presence) {
        // upload photo to cloudinary
        let url = '';
        const uploader = async (path) => await cloudinary.uploads(path, 'Presence');

        const newPath = await uploader(req.file.path)
        url = newPath.url

        presence_in = await Detail_Presence_Clock_In.create({
          clock_in: moment(),
          note: note,
          photo: url,
          latitude: latitude,
          longitude: longitude,
          presence_id: presence.id
        });
      }

      const response = {
        id: presence.id,
        date: presence.date,
        clock_in: moment(presence_in.clock_in).format('HH:mm:ss'),
        note: presence_in.note,
        photo: presence_in.photo,
        latitude: presence_in.latitude,
        longitude: presence_in.longitude,
      }

      return res.status(201).json(responseFormatter.success(response, "Presence created", res.statusCode));
    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }

  static updatePresence = async (req, res) => {
    try {
      const {note, latitude, longitude } = req.body;
      const { id } = req.params;

      // check presence exist
      const presenceExist = await Presence.findByPk(id);
      
      if (!presenceExist) {
        return res.status(404).json(responseFormatter.error(null, "Presence not found", res.statusCode));
      }

      // Get presence in
      const presence_in = await Detail_Presence_Clock_In.findOne({
        where: {
          presence_id: id
        }
      });

      // calculate working hours
      const clock_in = moment(presence_in.clock_in);
      const clock_out = moment();
      const diff = moment.duration(clock_out.diff(clock_in));

      // update presence
      const presence = await Presence.update({
        working_hours: diff.asHours().toFixed(1),
      },{
        where: {
          id: id
        }
      })

      // upload photo to cloudinary
      let url = '';
      const uploader = async (path) => await cloudinary.uploads(path, 'Presence');

      const newPath = await uploader(req.file.path)
      url = newPath.url

      // insert presence out
      const presence_out = await Detail_Presence_Clock_Out.create({
        clock_out: clock_out,
        note: note,
        photo: url,
        latitude: latitude,
        longitude: longitude,
        presence_id: id
      });

      const response = {
        id: presenceExist.id,
        date: presenceExist.date,
        clock_out: moment(presence_out.clock_out).format('HH:mm:ss'),
        note: presence_out.note,
        photo: presence_out.photo,
        latitude: presence_out.latitude,
        longitude: presence_out.longitude,
      }
      
      return res.status(200).json(responseFormatter.success(response, "Presence updated", res.statusCode));
    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }
}

module.exports = PresenceController;
