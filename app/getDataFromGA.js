const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const { Configuration, OpenAIApi } = require("openai");
const { DateTime } = require('luxon');
require('dotenv').config();

const propertyId = "323617358";
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const analyticsDataClient = new BetaAnalyticsDataClient({
    keyFile: "key-ga.json",
    scopes: "https://www.googleapis.com/auth/analytics.readonly",
});

const formatDate = (date) => {
    if (typeof date !== 'string') {
        date = date.toISOString().slice(0, 10); // Convert to YYYY-MM-DD format
    }

    const year = date.slice(0, 4);
    const month = date.slice(5, 7);
    const day = date.slice(8, 10);

    return `${year}-${month}-${day}`;
};

async function runReport(startDate, endDate) {
    const request = {
        property: `properties/${propertyId}`,
        dateRanges: [
            {
                startDate: formatDate(startDate),
                endDate: formatDate(endDate),
            },
        ],
        dimensions: [
            {
                name: "deviceCategory",
            },
            {
                name: "date",
            },
        ],
        metrics: [
            {
                name: "totalRevenue",
            },
            {
                name: "sessions",
            },
            {
                name: "totalUsers",
            },
            {
                name: "engagementRate",
            },
            {
                name: "addToCarts",
            },
        ],
    };

    try {
        const [response] = await analyticsDataClient.runReport(request);

        const dimensionHeaders = response.dimensionHeaders.map((header) => header.name);
        const metricHeaders = response.metricHeaders.map((header) => header.name);
        const rows = response.rows.map((row) => ({
            dimensions: row.dimensionValues.map((value) => value.value),
            metrics: row.metricValues.map((value) => value.value),
        }));

        return rows.map((row) => {
            const rawDateValue = row.dimensions[1];
            const parsedDate = DateTime.fromFormat(rawDateValue, 'yyyy-MM-dd');
            const formattedDate = parsedDate.isValid ? parsedDate.toFormat('yyyy-MM-dd') : rawDateValue;
            const rowData = [...row.metrics];
            const revenue = parseFloat(rowData[0]);

            return {
                date: formattedDate,
                sessions: rowData[1],
                newUsers: rowData[2],
                totalRevenue: revenue,
                transactions: rowData[3],
                checkouts: rowData[4],
            };
        });
    } catch (error) {
        console.error('Error retrieving Google Analytics data:', error);
        throw error;
    }
}

async function generateReport(dateRange, res) {
    const today = new Date();

    let startDate, endDate, prompt;

    switch (dateRange) {
        case "7days":
            const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            startDate = formatDate(sevenDaysAgo);
            endDate = formatDate(today);
            break;
        case "30days":
            const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            startDate = formatDate(thirtyDaysAgo);
            endDate = formatDate(today);
            break;
        case "90days":
            const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
            startDate = formatDate(ninetyDaysAgo);
            endDate = formatDate(today);
            break;
    }

    const reportData = await runReport(startDate, endDate);

    prompt = `You are a business analyst tasked with analyzing the performance of different sessions by comparing the results from the past ${dateRange}. The data includes total Revenue, sessions, total Users, engagement Rate, add To Carts. This is the data from Google Analytics: ${JSON.stringify(
        reportData
    )}. Based on this data, analyze and provide monthly insights and comparisons for each session type, highlighting the strengths, weaknesses, and potential opportunities for improvement. Additionally, compare the performance between sessions and identify any significant trends or patterns. Provide a comprehensive business analysis and narrate the findings based on the given data. Keep everything very short, you can skip any insights and comparison if the data is small and not useful and use bullet points where necessary.`;

    const gptResponse = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 200,
    });

    return gptResponse.data.choices[0].text;
}

module.exports = {
    generateReport
};
