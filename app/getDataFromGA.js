const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();

const propertyId = "323617358";
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const analyticsDataClient = new BetaAnalyticsDataClient({
    keyFile: "./key-ga.json",
    scopes: "https://www.googleapis.com/auth/analytics.readonly",
});

const formatDate = (date) => {
    const year = date.slice(0, 4);
    const month = date.slice(4, 6);
    const day = date.slice(6);
    const dateString = new Date(year, month - 1, day);
    return dateString.toDateString();
};

async function runReport(startDate, endDate) {
    const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [
            {
                startDate: startDate,
                endDate: endDate,
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
    });

    return response.rows.map((row) => ({
        date: formatDate(row.dimensionValues[0]?.value),
        totalRevenue: row.metricValues[0]?.value,
        totalUsers: row.metricValues[1]?.value,
        purchaserConversionRate: row.metricValues[2]?.value,
        averagePurchaseRevenue: row.metricValues[3]?.value,
        addToCart: row.metricValues[4]?.value,
        transactions: row.metricValues[5]?.value,
    }));
}

async function generateReport(startDate = "7daysAgo", endDate = "today") {
    const prompt2 = `You are a business analyst tasked with analyzing the performance of different sessions by
    comparing the results from two months. The data includes purchase revenue, user conversion rates, average purchase revenue per user, sessions, total users,
    ecommerce purchases, and engagement rates for each session type.
    This is the data from Google Analytics: ${JSON.stringify(await runReport(startDate, endDate))}.
    Based on this data, analyze and provide monthly insights and comparisons for each session type,
    highlighting the strengths, weaknesses, and potential opportunities for improvement. Additionally,
    compare the performance between sessions and identify any significant trends or patterns.
    Provide a comprehensive business analysis and narrate the findings based on the given data.
    Keep everything very short, you can skip any insights and comparison if the data is small and
    not useful and use bullet points where necessary.`;

    const prompt = `I have data for the last 7 days. Generate a summarized business report stating what has changed. And give me tips to improve my business based on the data I provided you with \n\nHere's the data: ${JSON.stringify(
        await runReport(startDate, endDate)
    )}`;
    const gptResponse = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt2,
        max_tokens: 1000,
    });
    return gptResponse.data.choices[0].text;
}

module.exports = {
    generateReport
};