const nodemailer = require('nodemailer');

const verifyEmail = async (user, pass, url, name, toMail, subject, mailMsg) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: user,
            pass: pass
        }
    });
    const mailOptions = {
        from: 'legendtonystark1@gmail.com',
        to: toMail,
        subject: subject,
        html: `<h1>Email Confirmation</h1>
        <h2>Hello ${name}</h2>
        <p>Thank you for subscribing. ${mailMsg} by clicking on the following link</p>
        <a href=${url}> Click here</a>
        </div>`};
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

module.exports = verifyEmail;