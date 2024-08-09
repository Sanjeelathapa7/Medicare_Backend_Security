// importing
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./database/db');
const cors = require('cors');
const cloudinary = require('cloudinary');
const acceptMultimedia = require('connect-multiparty')

var morgan = require('morgan')

// Making express app
const app = express();

app.use(morgan('combined'))
// dotenv config
dotenv.config();

// cloudinary config

cloudinary.config({
    cloud_name: 'dd0w8iwpr',
    api_key: "573982566749449",
    api_secret: "NL3Pi5m17QktJFGQ6W9UuiM0qYI"
});

app.use(acceptMultimedia())

// cors config to accept request from frontend
const corsOptions = {
    origin: true,
    credentials: true,
    optionSuccessStatus: 200
};
app.use(cors(corsOptions))
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
// mongodb connection
connectDB();

// Accepting json data
app.use(express.json());

// creating test route
app.get("/test", (req, res) => {
    res.status(200).json("Hello from server");
})

// user routes
app.use('/api/user', require('./routes/userRoutes'))

//product routes
app.use("/api/product", require("./routes/productRoutes"))
//cart routes
app.use('/api/user', require('./routes/cartRoutes'));
app.use('/api/user', require('./routes/orderRoutes'));

app.use("/api/user", require("./routes/favoriteRoutes"));

// our actual routes
// http://localhost:5000/api/user/create
// http://localhost:5000/api/user/login

// defining port
const PORT = process.env.PORT;
// run the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})