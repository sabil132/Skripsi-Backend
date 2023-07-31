require("dotenv").config();
const sequelize = require("sequelize");
const fs = require("fs");
const Jimp = require("jimp");

const cloudinary = require("../config/cloudinary");
const responseFormatter = require("../helpers/responseFormatter");
const sendMail = require("../helpers/email");
const {
  Employee,
  Position,
  Unit,
  Head_Unit,
  request_update_photo_profile,
} = require("../models");

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
          exclude: ["password", "position_id", "unit_id"],
        },
        where: {
          deletedAt:{
            [sequelize.Op.is]: null 
          },
          name: {
            [sequelize.Op.iLike]: `%${req.query.name}%`,
          }
        }
      });

      return res
        .status(200)
        .json(
          responseFormatter.success(employees, "Employee found", res.statusCode)
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
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
        return res
          .status(404)
          .json(
            responseFormatter.error(null, "Employee not found", res.statusCode)
          );
      }

      return res
        .status(200)
        .json(
          responseFormatter.success(employee, "Employee found", res.statusCode)
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  static getEmployeByUnit = async (req, res) => {
    try {
      const { id } = req.params;

      const headUnit = await Head_Unit.findOne({ where: { unit_id: id } });

      let employees;
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
      } else {
        employees = await Employee.findAll({
          where: {
            unit_id: id,
            id: {
              [sequelize.Op.notIn]: [headUnit.employee_id],
            },
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
        return res
          .status(404)
          .json(
            responseFormatter.error(null, "Employee not found", res.statusCode)
          );
      }

      return res
        .status(200)
        .json(
          responseFormatter.success(employees, "Employee found", res.statusCode)
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  static createEmployee = async (req, res) => {
    try {
      const {
        name,
        placeOfBirth,
        dateOfBirth,
        status,
        gender,
        dateEntry,
        phone,
        email,
        role,
        position_id,
        unit_id,
      } = req.body;
      const clearEmail = email.toLowerCase();

      const emailExist = await Employee.findOne({ where: { email: email } });

      if (emailExist) {
        return res
          .status(409)
          .json(
            responseFormatter.error(null, "Email already exist", res.statusCode)
          );
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
        unit_id: unit_id,
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
        role: employee.dataValues.role,
      };

      const mailOptions = {
        from: "BAGUS.10119064 <bagus.10119064@mahasiswa.unikom.ac.id>",
        to: clearEmail,
        subject: "Account Activation",
        html: `<a href='http://localhost:5173/activation?token=${btoa(
          JSON.stringify(userData)
        )}'>Click this link to activate your account</a>`,
      };

      sendMail(mailOptions);

      return res
        .status(201)
        .json(
          responseFormatter.success(
            employee,
            "Employee created",
            res.statusCode
          )
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  static updateEmployee = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        placeOfBirth,
        dateOfBirth,
        status,
        gender,
        dateEntry,
        phone,
        email,
        role,
        position_id,
        unit_id,
        active,
      } = req.body;

      const employee = await Employee.findByPk(id);

      if (!employee) {
        return res
          .status(404)
          .json(
            responseFormatter.error(null, "Employee not found", res.statusCode)
          );
      }

      if (email) {
        if (employee.email !== email) {
          const emailExist = await Employee.findOne({
            where: { email: email },
          });

          if (emailExist) {
            return res
              .status(409)
              .json(
                responseFormatter.error(
                  null,
                  "Email already exist",
                  res.statusCode
                )
              );
          }
        }
      }

      if (req.file) {
        // mirror image
        Jimp.read(req.file.path).then(image => {
          image.flip(true, false).write(`public/img/processing/${req.file.filename.split('.')[0]}-mirror.jpg`);
        }).then(() => {
          setTimeout(async () => {
            let url = "";
            const uploader = async (path) =>
            await cloudinary.uploads(path, "Profile");

            const newPath = await uploader(`public/img/processing/${req.file.filename.split('.')[0]}-mirror.jpg`);
            url = newPath.url;

            const saved = await request_update_photo_profile.create({
              photo: url,
              is_approved: false,
              employee_id: id,
            });

            fs.unlink(`public/img/processing/${req.file.filename.split('.')[0]}-mirror.jpg`, (err) => {
              if (err) {
                return err
              }
            });

            // get user by position
            const user = await Employee.findOne({
              include: [
                {
                  model: Position,
                  attributes: ["id", "name"],
                  where: {
                    name: "HRD",
                  }
                },

              ]
            });

            if (saved) {

              fs.unlink(req.file.path, (err) => {
                if (err) {
                  return err
                }
              });

              const mailOptions = {
                from: "BAGUS.10119064 <bagus.10119064@mahasiswa.unikom.ac.id>",
                to: user.email,
                subject: "Request Update Photo Profile",
                html: `
                <!DOCTYPE HTML
                PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
              <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
                xmlns:o="urn:schemas-microsoft-com:office:office">
              
              <head>
              
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta name="x-apple-disable-message-reformatting">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <title></title>
              
                <style type="text/css">
                  @media only screen and (min-width: 620px) {
                    .u-row {
                      width: 600px !important;
                    }
              
                    .u-row .u-col {
                      vertical-align: top;
                    }
              
                    .u-row .u-col-50 {
                      width: 300px !important;
                    }
              
                    .u-row .u-col-100 {
                      width: 600px !important;
                    }
              
                  }
              
                  @media (max-width: 620px) {
                    .u-row-container {
                      max-width: 100% !important;
                      padding-left: 0px !important;
                      padding-right: 0px !important;
                    }
              
                    .u-row .u-col {
                      min-width: 320px !important;
                      max-width: 100% !important;
                      display: block !important;
                    }
              
                    .u-row {
                      width: 100% !important;
                    }
              
                    .u-col {
                      width: 100% !important;
                    }
              
                    .u-col>div {
                      margin: 0 auto;
                    }
                  }
              
                  body {
                    margin: 0;
                    padding: 0;
                  }
              
                  table,
                  tr,
                  td {
                    vertical-align: top;
                    border-collapse: collapse;
                  }
              
                  p {
                    margin: 0;
                  }
              
                  .ie-container table,
                  .mso-container table {
                    table-layout: fixed;
                  }
              
                  * {
                    line-height: inherit;
                  }
              
                  a[x-apple-data-detectors='true'] {
                    color: inherit !important;
                    text-decoration: none !important;
                  }
              
                  table,
                  td {
                    color: #000000;
                  }
              
                  #u_body a {
                    color: #0000ee;
                    text-decoration: underline;
                  }
                </style>
              
                <link href="https://fonts.googleapis.com/css?family=Playfair+Display:400,700" rel="stylesheet" type="text/css">
                <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css">
              
              </head>
              
              <body class="clean-body u_body"
                style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: rgb(231, 231, 231);color: #000000">
                <table id="u_body"
                  style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: rgb(231, 231, 231);width:100%"
                  cellpadding="0" cellspacing="0">
                  <tbody>
                    <tr style="vertical-align: top">
                      <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
              
              
                        <div class="u-row-container" style="padding: 0px;background-color: transparent">
                          <div class="u-row"
                            style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                            <div
                              style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                              <div class="u-col u-col-100"
                                style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                                <div style="height: 100%;width: 100% !important;">
                                  <div
                                    style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
              
                                    <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                      cellspacing="0" width="100%" border="0">
                                      <tbody>
                                        <tr>
                                          <td
                                            style="overflow-wrap:break-word;word-break:break-word;padding:5px;font-family:'Montserrat',sans-serif;"
                                            align="left">
              
                                            <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%"
                                              style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 0px solid #BBBBBB;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                              <tbody>
                                                <tr style="vertical-align: top">
                                                  <td
                                                    style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                    <span>&#160;</span>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
              
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
              
              
              
                        <div class="u-row-container" style="padding: 0px;background-color: transparent">
                          <div class="u-row"
                            style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
                            <div
                              style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                              <div class="u-col u-col-100"
                                style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                                <div style="height: 100%;width: 100% !important;">
                                  <div
                                    style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
              
                                    <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                      cellspacing="0" width="100%" border="0">
                                      <tbody>
                                        <tr>
                                          <td
                                            style="overflow-wrap:break-word;word-break:break-word;padding:40px 10px 10px;font-family:'Montserrat',sans-serif;"
                                            align="left">
              
                                            <div
                                              style="font-size: 14px; line-height: 140%; text-align: center; word-wrap: break-word;">
                                              <p style="line-height: 140%; font-size: 14px;"><span
                                                  style="line-height: 33.6px; font-size: 24px; font-family: 'Playfair Display', serif;"><span
                                                    style="line-height: 33.6px; font-size: 24px;"><strong>Hello, `+ user.name +`</strong></span></span></p>
                                            </div>
              
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
              
                                    <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                      cellspacing="0" width="100%" border="0">
                                      <tbody>
                                        <tr>
                                          <td
                                            style="overflow-wrap:break-word;word-break:break-word;padding:0px 10px 40px;font-family:'Montserrat',sans-serif;"
                                            align="left">
              
                                            <div
                                              style="font-size: 14px; line-height: 140%; text-align: center; word-wrap: break-word;">
                                              <p style="font-size: 14px; line-height: 140%;">There are employee request to change
                                                photo profile. please see detail on below</p>
                                            </div>
              
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
              
                                    <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                      cellspacing="0" width="100%" border="0">
                                      <tbody>
                                        <tr>
                                          <td
                                            style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Montserrat',sans-serif;"
                                            align="left">
              
                                            <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%"
                                              style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #BBBBBB;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                              <tbody>
                                                <tr style="vertical-align: top">
                                                  <td
                                                    style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                    <span>&#160;</span>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
              
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
              
              
              
                          <div class="u-row-container" style="padding: 0px;background-color: transparent">
                            <div class="u-row"
                              style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
                              <div
                                style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
              
                                <div class="u-col u-col-100"
                                  style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                                  <div style="height: 100%;width: 100% !important;">
                                    <div
                                      style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
              
                                      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                        cellspacing="0" width="100%" border="0">
                                        <tbody>
                                          <tr>
                                            <td
                                              style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Montserrat',sans-serif;"
                                              align="left">
              
                                              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                <tr>
                                                  <td style="padding-right: 0px;padding-left: 0px;" align="center">
              
                                                    <img align="center" border="0"
                                                      src="`+ url +`"
                                                      alt="" title=""
                                                      style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 100%;max-width: 580px;"
                                                      width="580" />
              
                                                  </td>
                                                </tr>
                                              </table>
              
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
              
                                      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                        cellspacing="0" width="100%" border="0">
                                        <tbody>
                                          <tr>
                                            <td
                                              style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Montserrat',sans-serif;"
                                              align="left">
              
                                              <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0"
                                                width="100%"
                                                style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #BBBBBB;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                <tbody>
                                                  <tr style="vertical-align: top">
                                                    <td
                                                      style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                      <span>&#160;</span>
                                                    </td>
                                                  </tr>
                                                </tbody>
                                              </table>
              
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
              
                                      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                        cellspacing="0" width="100%" border="0">
                                        <tbody>
                                          <tr>
                                            <td
                                              style="overflow-wrap:break-word;word-break:break-word;padding:30px 30px 40px;font-family:'Montserrat',sans-serif;"
                                              align="left">
              
                                              <div
                                                style="font-size: 14px; line-height: 160%; text-align: center; word-wrap: break-word;">
                                                <div>
                                                  <div>if you approved click button approved, if you not approved click button
                                                    rejected.
                                                  </div>
                                                </div>
                                              </div>
              
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
              
              
              
                          <div class="u-row-container" style="padding: 0px;background-color: transparent">
                            <div class="u-row"
                              style="padding-bottom: 30px; Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
                              <div
                                style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                                <div class="u-col u-col-50"
                                  style="max-width: 320px;min-width: 300px;display: table-cell;vertical-align: top;">
                                  <div style="background-color: #ffffff;height: 100%;width: 100% !important;">
                                    <div
                                      style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                        cellspacing="0" width="100%" border="0">
                                        <tbody>
                                          <tr>
                                            <td
                                              style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Montserrat',sans-serif;"
                                              align="left">
                                              <div align="center">
                                                <a href="http://localhost:5173/request/`+ saved.id +`?status=false" target="_blank" class="v-button"
                                                  style="box-sizing: border-box;display: inline-block;font-family:'Montserrat',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #2f872c; border-radius: 4px;-webkit-border-radius: 4px; -moz-border-radius: 4px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;font-size: 14px;">
                                                  <span style="display:block;padding:10px 20px;line-height:120%;"><span
                                                      style="font-size: 22px; line-height: 26.4px;">Rejected</span></span>
                                                </a>
                                              </div>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                                <div class="u-col u-col-50"
                                  style="max-width: 320px;min-width: 300px;display: table-cell;vertical-align: top;">
                                  <div
                                    style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                                    <div
                                      style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                                      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                        cellspacing="0" width="100%" border="0">
                                        <tbody>
                                          <tr>
                                            <td
                                              style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Montserrat',sans-serif;"
                                              align="left">
                                              <div align="center">
                                                <a href="http://localhost:5173/request/`+ saved.id +`?status=true" target="_blank" class="v-button"
                                                  style="box-sizing: border-box;display: inline-block;font-family:'Montserrat',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #2f872c; border-radius: 4px;-webkit-border-radius: 4px; -moz-border-radius: 4px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;font-size: 14px;">
                                                  <span style="display:block;padding:10px 20px;line-height:120%;"><span
                                                      style="font-size: 22px; line-height: 26.4px;">Approved</span></span>
                                                </a>
                                              </div>
              
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
              
              
              
                          <div class="u-row-container" style="padding: 0px;background-color: transparent">
                            <div class="u-row"
                              style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #2f872c;">
                              <div
                                style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                                <div class="u-col u-col-100"
                                  style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                                  <div style="height: 100%;width: 100% !important;">
                                    <div
                                      style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
              
                                      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                        cellspacing="0" width="100%" border="0">
                                        <tbody>
                                          <tr>
                                            <td
                                              style="overflow-wrap:break-word;word-break:break-word;padding:20px 10px 10px;font-family:'Montserrat',sans-serif;"
                                              align="left">
              
                                              <div
                                                style="font-size: 14px; color: #ffffff; line-height: 140%; text-align: center; word-wrap: break-word;">
                                                <p style="font-size: 14px; line-height: 140%;"><span
                                                    style="font-size: 14px; line-height: 19.6px; font-family: Montserrat, sans-serif;"><strong><span
                                                        style="line-height: 19.6px; font-size: 14px;">FOLLOW&nbsp; US&nbsp;
                                                        ON</span></strong></span></p>
                                              </div>
              
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
              
                                      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                        cellspacing="0" width="100%" border="0">
                                        <tbody>
                                          <tr>
                                            <td
                                              style="overflow-wrap:break-word;word-break:break-word;padding:0px 10px 20px;font-family:'Montserrat',sans-serif;"
                                              align="left">
              
                                              <div align="center">
                                                <div style="display: table; max-width:125px;">
                                                  <table align="left" border="0" cellspacing="0" cellpadding="0" width="32"
                                                    height="32"
                                                    style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 10px">
                                                    <tbody>
                                                      <tr style="vertical-align: top">
                                                        <td align="left" valign="middle"
                                                          style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                                          <a href="https://facebook.com/" title="Facebook" target="_blank">
                                                            <img
                                                              src="https://cdn.tools.unlayer.com/social/icons/circle-white/facebook.png"
                                                              alt="Facebook" title="Facebook" width="32"
                                                              style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                                                          </a>
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                                                  <table align="left" border="0" cellspacing="0" cellpadding="0" width="32"
                                                    height="32"
                                                    style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 10px">
                                                    <tbody>
                                                      <tr style="vertical-align: top">
                                                        <td align="left" valign="middle"
                                                          style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                                          <a href="https://instagram.com/" title="Instagram" target="_blank">
                                                            <img
                                                              src="https://cdn.tools.unlayer.com/social/icons/circle-white/instagram.png"
                                                              alt="Instagram" title="Instagram" width="32"
                                                              style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                                                          </a>
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                                                  <table align="left" border="0" cellspacing="0" cellpadding="0" width="32"
                                                    height="32"
                                                    style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 0px">
                                                    <tbody>
                                                      <tr style="vertical-align: top">
                                                        <td align="left" valign="middle"
                                                          style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                                          <a href="https://twitter.com/" title="Twitter" target="_blank">
                                                            <img
                                                              src="https://cdn.tools.unlayer.com/social/icons/circle-white/twitter.png"
                                                              alt="Twitter" title="Twitter" width="32"
                                                              style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                                                          </a>
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                                                </div>
                                              </div>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
              
              
              
                          <div class="u-row-container" style="padding: 0px;background-color: transparent">
                            <div class="u-row"
                              style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                              <div
                                style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                                <div class="u-col u-col-100"
                                  style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                                  <div style="height: 100%;width: 100% !important;">
                                    <div
                                      style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
              
                                      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                                        cellspacing="0" width="100%" border="0">
                                        <tbody>
                                          <tr>
                                            <td
                                              style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Montserrat',sans-serif;"
                                              align="left">
              
                                              <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0"
                                                width="100%"
                                                style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 0px solid #BBBBBB;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                <tbody>
                                                  <tr style="vertical-align: top">
                                                    <td
                                                      style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                      <span>&#160;</span>
                                                    </td>
                                                  </tr>
                                                </tbody>
                                              </table>
              
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
              
              
                      </td>
                    </tr>
                  </tbody>
                </table>
              </body>
              
              </html>
                `,
              };

              sendMail(mailOptions);
            }
          }, 200);
        }) 
      }

      await Employee.update(
        {
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
          role: role,
          is_active: active,
        },
        {
          where: {
            id,
          },
        }
      );

      const retrivied = await Employee.findByPk(id);

      if (req.file) {
        return res
          .status(200)
          .json(
            responseFormatter.success(
              retrivied,
              "Your profile has been updated, but your photo profile is still pending",
              res.statusCode
            )
          );
      } else {
        return res
          .status(200)
          .json(
            responseFormatter.success(
              retrivied,
              "Your profile has been updated",
              res.statusCode
            )
          );
      }
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  static updatePhotoProfile = async (req, res) => {
    try {
      const { id } = req.params;
      const { is_approved } = req.body;

      const request = await request_update_photo_profile.findByPk(id);

      if (!request) {
        return res
          .status(404)
          .json(
            responseFormatter.error(null, "Request not found", res.statusCode)
          );
      }

      await request_update_photo_profile.update({
          is_approved: is_approved === "true" ? true : false,
        }, {
          where: {
            id: request.id,
          },
        }
      );

      const employee = await Employee.findByPk(request.employee_id);

      if (is_approved === "true") {
        await Employee.update(
          {
            photo: request.photo,
          },
          {
            where: {
              id: request.employee_id,
            },
          }
        );

        const mailOptions = {
          from: "BAGUS.10119064 <bagus.10119064@mahasiswa.unikom.ac.id>",
          to: employee.email,
          subject: "Request Update Photo Profile Approved",
          html: `<p>Your request to update photo profile has been approved</p>`,
        };

        sendMail(mailOptions);
      } else {
        const mailOptions = {
          from: "BAGUS.10119064 <bagus.10119064@mahasiswa.unikom.ac.id>",
          to: employee.email,
          subject: "Request Update Photo Profile Rejected",
          html: `<p>Your request to update photo profile has been rejected</p>`,
        };

        sendMail(mailOptions);
      }

      const newRequest = await request_update_photo_profile.findByPk(id);

      const response = {
        id: newRequest.id,
        employee_id: newRequest.employee_id,
        name: employee.name,
        photo: newRequest.photo,
        is_approved: newRequest.is_approved,
      }

      return res
        .status(200)
        .json(
          responseFormatter.success(response, "Request updated", res.statusCode)
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  static deleteEmployee = async (req, res) => {
    try {
      const { id } = req.params;

      const employeeExist = await Employee.findByPk(id);

      if (!employeeExist) {
        return res
          .status(404)
          .json(
            responseFormatter.error(
              employee,
              "Employee not found",
              res.statusCode
            )
          );
      }

      // update employe deleted
      await Employee.update(
        {
          deletedAt: new Date(),
        },
        {
          where: {
            id,
          },
        }
      );
      

      return res
        .status(200)
        .json(
          responseFormatter.success(
            employeeExist,
            "Employee deleted",
            res.statusCode
          )
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };
}

module.exports = EmployeeController;
