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
            private_key: process.env.PRIVATE_KEY,
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
                name: 'defaultChannelGrouping',
            },
            {
                name: 'sourceMedium',
            },
            {
                name: 'sessionCampaignId',
            },
        ],
        metrics: [
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
                name: 'totalRevenue',
            },
            {
                name: 'userConversionRate',
            },
        ],
    });

    return response.rows.map(row => ({
        channelGrouping: row.dimensionValues[0].value,
        sourceMedium: row.dimensionValues[1].value,
        campaign: row.dimensionValues[2].value,
        sessions: row.metricValues[0].value,
        totalUsers: row.metricValues[1].value,
        engagementRate: row.metricValues[2].value,
        totalRevenue: row.metricValues[3].value,
        userConversionRate: row.metricValues[4].value,
    }));
}

module.exports = getReportGa;
