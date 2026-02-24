const axios = require('axios');

const CLIENT_ID = '7745b659-d212-4380-87c7-6a08595f541d';
const CLIENT_SECRET = 'WQPQXZD6QC4q7sx1LVoPl9ru9RD9gMkzAtw2bpQW';

async function testApi() {
    try {
        // 1. Get Token
        const tokenResponse = await axios.post('https://api.prokerala.com/token', {
            grant_type: 'client_credentials',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        }, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const token = tokenResponse.data.access_token;
        console.log('Got Token:', token);

        // 2. Try to get Kundli PDF (Using a generic endpoint, testing to see if it exists)
        // Looking at Prokerala PHP SDK or docs, usually endpoints are like v2/astrology/kundli
        // Let's do a simple call to get user profile or list of endpoints
        // Wait, let's just do a dummy request to /v2/astrology/kundli to see what it expects

        // We'll search for their documentation online or just make a request

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testApi();
