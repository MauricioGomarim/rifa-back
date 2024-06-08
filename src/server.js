require("express-async-errors");


const express = require('express');
const app = express();
const routes = require("./routes");
const cors = require("cors")

const AppError = require("./utils/AppError");


app.use(cors({origin: '*'}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("./static"));


app.use(routes)

app.use((error, request, response, next) => {
    // Client error
    if(error instanceof AppError) {
        return response.status(error.statusCode).json({
            status: "error",
            message: error.message
        });
    }
    console.error(error);
    // Server error
    return response.status(500).json({
        status: "error",
        message: "Internal Server Error"
    })
})

// Running port
const PORT =  3000;
app.listen(PORT, () => console.log(`Server is running on Port ${PORT}`));