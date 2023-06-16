const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const { GoogleAuth } = require('google-auth-library');
require('dotenv').config();

const propertyId = "323617358";

async function getReportGa(startDate, endDate) {
    const auth = new GoogleAuth({
        keyFile: 'key-ga.json',
        scopes: 'https://www.googleapis.com/auth/analytics.readonly',
    });

    const authClient = await auth.getClient();

    const analyticsDataClient = new BetaAnalyticsDataClient({
        credentials: {
            client_email: process.env.CLIENT_EMAIL,
            private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
    });

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
                name: 'deviceCategory',
            },
            {
                name: 'date',
            },
        ],
        metrics: [
            {
                name: 'totalRevenue',
            },
            {
                name: 'sessions',
            },
            {
                name: 'totalUsers',
            },
            {
                name: 'engagementRate',
            },
            {
                name: 'addToCarts',
            },
        ],
    });

    return response.rows.map(row => ({
        totalRevenue: "€ " + Math.round(row.metricValues[0]?.value * 100) / 100 , // Rounded to two decimal places
        sessions: row.metricValues[1]?.value,
        totalUsers: row.metricValues[2]?.value,
        engagementRate: row.metricValues[3]?.value,
        channelGrouping: row.dimensionValues[0]?.value,
        sourceMedium: row.dimensionValues[1]?.value,
    }));
}

module.exports = getReportGa;
