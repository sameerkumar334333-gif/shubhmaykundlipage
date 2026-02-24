const axios = require('axios');
const CLIENT_ID = '7745b659-d212-4380-87c7-6a08595f541d';
const CLIENT_SECRET = 'WQPQXZD6QC4q7sx1LVoPl9ru9RD9gMkzAtw2bpQW';
async function run() {
  try {
    const tokenResponse = await axios.post('https://api.prokerala.com/token', {
      grant_type: 'client_credentials', client_id: CLIENT_ID, client_secret: CLIENT_SECRET
    }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    const token = tokenResponse.data.access_token;
    
    // Test endpoint
    const res = await axios.get('https://api.prokerala.com/v2/location?q=Mumbai', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(res.data);
  } catch(e) { console.error("Error:", e.response ? Object.keys(e.response) : e.message); if(e.response) { console.log("Status:", e.response.status, e.response.statusText); } }
}
run();
