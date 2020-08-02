const nodemailer = require('nodemailer');

function sentMail(address,subject,message){
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'info.flashchat@gmail.com',
          pass: 'Proximity@1999'
        }
      });
      
      var mailOptions = {
        from: 'info.flashchat@gmail.com',
        to: address,
        subject: subject,
        html: message
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}

module.exports = {sentMail};
