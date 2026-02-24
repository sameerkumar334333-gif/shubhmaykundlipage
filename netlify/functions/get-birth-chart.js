const axios = require('axios');

const CLIENT_ID = '7745b659-d212-4380-87c7-6a08595f541d';
const CLIENT_SECRET = 'WQPQXZD6QC4q7sx1LVoPl9ru9RD9gMkzAtw2bpQW';

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const datetime = event.queryStringParameters.datetime;
        const coordinates = event.queryStringParameters.coordinates;

        if (!datetime || !coordinates) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing datetime or coordinates parameter' })
            };
        }

        // 1. Get OAuth Token
        const tokenResponse = await axios.post('https://api.prokerala.com/token', {
            grant_type: 'client_credentials',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        }, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const token = tokenResponse.data.access_token;

        // 2. Fetch the Astrology Chart SVG from Prokerala API
        // Style: north-indian (Common in Vedic Astrology)
        const chartUrl = `https://api.prokerala.com/v2/astrology/chart?ayanamsa=1&coordinates=${coordinates}&datetime=${encodeURIComponent(datetime)}&chart_type=rasi&chart_style=north-indian&format=svg`;

        const chartResponse = await axios.get(chartUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: true,
                svg: chartResponse.data // The SVG string
            })
        };

    } catch (error) {
        console.error('Chart Proxy Error:', error.response ? JSON.stringify(error.response.data) : error.message);

        return {
            statusCode: error.response ? error.response.status : 500,
            body: JSON.stringify({
                error: error.message,
                details: error.response ? error.response.data : 'Internal server error fetching chart'
            })
        };
    }
};
