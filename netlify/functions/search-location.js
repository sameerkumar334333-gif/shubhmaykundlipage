const axios = require('axios');

const CLIENT_ID = '7745b659-d212-4380-87c7-6a08595f541d';
const CLIENT_SECRET = 'WQPQXZD6QC4q7sx1LVoPl9ru9RD9gMkzAtw2bpQW';

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const keyword = event.queryStringParameters.keyword;
    if (!keyword) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Keyword required' }) };
    }

    try {
        // 1. Get OAuth Token (in production, we should cache this)
        const tokenResponse = await axios.post('https://api.prokerala.com/token', {
            grant_type: 'client_credentials',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        }, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const token = tokenResponse.data.access_token;

        // 2. Search Location
        const locationResponse = await axios.get(`https://api.prokerala.com/v2/location/search?keyword=${encodeURIComponent(keyword)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(locationResponse.data)
        };

    } catch (error) {
        console.error('Location Proxy Error:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch location' })
        };
    }
};
