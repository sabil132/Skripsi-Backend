require('dotenv').config()

const nodemailer = require('nodemailer')
const googleapis = require('googleapis')

const oauth2Client = new googleapis.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URL)
oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })

async function sendMail({ from, to, subject, html}) {
  try {
    const accessToken = await oauth2Client.getAccessToken()

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'bagus.10119064@mahasiswa.unikom.ac.id',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken
      }
    })

    const mailOptions = {
      from: from,
      to: to,
      subject: subject,
      html: html
    }

    const result = await transport.sendMail(mailOptions)
    return result
  } catch (error) {
    return error 
  }
}

module.exports = sendMail
