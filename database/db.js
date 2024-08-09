//steps
//import (if needed)
const mongoose = require('mongoose');
 
//list of functions
//function ma pahila type then name
//connect to database
const connectToDB = () => {
    mongoose.connect(process.env.DB_URL).then(() => {
        console.log('Connected to Database');
    })
}
 
 
//export
module.exports = connectToDB;