const nodemailer = require('nodemailer');

const resetCode = Math.floor(1000 + Math.random() * 8000);

const mailConfig = () => {
    console.log(process.env.USEREMAIL)
    console.log(process.env.PASSWORD)
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.USEREMAIL,
            pass: process.env.PASSWORD,
        },
    });
    
    return transporter;
}

module.exports = {
    resetCode,
    mailConfig
}