const nodemailer = require('nodemailer');

const sendEmail = async (user, pass, url, name, toMail, subject, mailMsg) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: user,
            pass: pass
        }
    });
    const mailOptions = {
        from: user,
        to: toMail,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
              <h1 style="text-align: center; color: #333333;">${mailMsg}</h1>
              <h2 style="text-align: center; color: #333333;">Hello ${name}</h2>
              <p style="text-align: center; color: #333333;">Thank you for joining! Please ${mailMsg} by clicking on the following button:</p>
              <div style="text-align: center; margin-bottom: 20px;">
                <a href=${url} style="display: inline-block; padding: 10px 20px; background-color: #337ab7; color: #ffffff; text-decoration: none; border-radius: 5px;">Click here to ${mailMsg}</a>
              </div>
            </div>
          </div>
        `
      };
      
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                resolve(false); // or use rejcet(false) but then you will have to handle errors
            }
            else {
                console.log('Email sent: ' + info.response);
                resolve(true);
            }
        });
    }
    );
}

module.exports = sendEmail;