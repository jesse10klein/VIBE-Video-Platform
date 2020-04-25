var nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'vibevideoservice@gmail.com',    
    pass: 'Ernas123'
  }
})

function getMailOptions(user, link) {

  const mailOptions = {
    from: 'vibevideoservice@gmail.com',
    to: user.userEmail,
    subject: `Password recovery request`,
    text: `Dear ${user.username}. \n\n
            You are recieving this email as you have recently requested that your password be reset. If you did not send this request please disregard this email and change your password on our website \n\n
            If you did send this request, please click the following link: ${link}`
  }
  return mailOptions;
}

function sendRecoveryEmail(user, link) {
  const mailOptions = getMailOptions(user, link);
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email send: ' + info.response);
    }
  })
}

module.exports = {sendRecoveryEmail}