const express = require("express");
require('dotenv').config();

const getReportGa = require('./app/getDataFromGA');


const app = express();
const port = 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});


let startDate = "2023-01-01";
let endDate = "2023-01-07"

async function runReport() {
    try {
        const reportData = await getReportGa(startDate, endDate);
        // Use the reportData as needed
        console.log(reportData);
    } catch (error) {
        // Handle any errors that occurred during the report retrieval
        console.error(error);
    }
}



runReport();
