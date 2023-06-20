const express = require("express");
require('dotenv').config();
const { generateReport } = require('./app/getDataFromGA');

const app = express();
const port = 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.get("/report", async (req, res) => {
    const dateRange = req.query.dateRange;
    
    try {
        const reportData = await generateReport(dateRange);
        res.json({ reportData });
    } catch (error) {
        res.status(500).json({ error: "Failed to generate the report." });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});
