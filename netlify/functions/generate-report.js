const axios = require('axios');
const PDFDocument = require('pdfkit');

const CLIENT_ID = '7745b659-d212-4380-87c7-6a08595f541d';
const CLIENT_SECRET = 'WQPQXZD6QC4q7sx1LVoPl9ru9RD9gMkzAtw2bpQW';

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const payload = JSON.parse(event.body);
        const { datetime, place, coordinates, name = "Client" } = payload;

        if (!datetime || !place || !coordinates) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required parameters: datetime, place, coordinates' })
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

        // 2. Fetch Astrology Data (Assuming we want basic Kundli details to put in the PDF)
        const dataResponse = await axios.get(`https://api.prokerala.com/v2/astrology/kundli?ayanamsa=1&coordinates=${coordinates}&datetime=${encodeURIComponent(datetime)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const kundliData = dataResponse.data.data;

        // 3. Generate PDF Document Using PDFKit
        // We return it a Base64 string so the frontend can download it easily
        return new Promise((resolve) => {
            const doc = new PDFDocument({ margin: 50 });
            let buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve({
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        success: true,
                        pdf_base64: pdfData.toString('base64'),
                        raw_data: kundliData // Useful for frontend debug
                    })
                });
            });

            // --- PREMIUM PDF DESIGN ---
            const pageWidth = doc.page.width;
            const pageHeight = doc.page.height;
            const gold = '#c7a962';
            const maroon = '#2d080e';
            const textDark = '#333333';
            const textMuted = '#666666';

            // Helper to draw border on newly added pages
            doc.on('pageAdded', () => {
                doc.lineWidth(2).rect(20, 20, pageWidth - 40, pageHeight - 40).stroke(gold);
                doc.lineWidth(1).rect(25, 25, pageWidth - 50, pageHeight - 50).stroke(maroon);
            });

            // Draw border on first page
            doc.lineWidth(2).rect(20, 20, pageWidth - 40, pageHeight - 40).stroke(gold);
            doc.lineWidth(1).rect(25, 25, pageWidth - 50, pageHeight - 50).stroke(maroon);

            // Cover / Header
            doc.moveDown(3);
            doc.font('Times-Bold').fillColor(maroon).fontSize(36).text('ShubhMay', { align: 'center' });
            doc.moveDown(0.2);
            doc.font('Times-Roman').fontSize(16).fillColor(gold).text('PREMIUM PERSONALIZED KUNDLI', { align: 'center', characterSpacing: 2 });

            // Separator Line
            doc.moveDown(1.5);
            doc.moveTo(100, doc.y).lineTo(pageWidth - 100, doc.y).lineWidth(1).stroke(gold);
            doc.moveDown(2);

            // User Info Box
            const boxTop = doc.y;
            doc.rect(50, boxTop, pageWidth - 100, 110).fillOpacity(0.05).fill(maroon).stroke();
            doc.fillOpacity(1);

            doc.font('Times-Bold').fillColor(maroon).fontSize(14).text('BIRTH DETAILS', 65, boxTop + 15);
            doc.font('Helvetica').fontSize(11).fillColor(textDark);

            const dateDisplay = new Date(datetime).toLocaleString();

            // Left Column
            doc.text(`Name:`, 65, boxTop + 40, { continued: true }).font('Helvetica-Bold').text(` ${name}`);
            doc.font('Helvetica').text(`Gender:`, 65, boxTop + 60, { continued: true }).font('Helvetica-Bold').text(` ${payload.gender || 'Not specified'}`);
            doc.font('Helvetica').text(`Place:`, 65, boxTop + 80, { continued: true }).font('Helvetica-Bold').text(` ${place}`);

            // Right Column
            doc.font('Helvetica').text(`Date & Time:`, 300, boxTop + 40, { continued: true }).font('Helvetica-Bold').text(` ${dateDisplay} (Sandbox)`);
            doc.font('Helvetica').text(`Coordinates:`, 300, boxTop + 60, { continued: true }).font('Helvetica-Bold').text(` ${coordinates}`);

            doc.y = boxTop + 130; // Move below the box

            // Astrological Details Box
            const nakshatra = kundliData && kundliData.nakshatra_details && kundliData.nakshatra_details.nakshatra ? kundliData.nakshatra_details.nakshatra.name : 'N/A';
            const rashi = kundliData && kundliData.nakshatra_details && kundliData.nakshatra_details.chandra_rasi ? kundliData.nakshatra_details.chandra_rasi.name : 'N/A';
            const sunSign = kundliData && kundliData.nakshatra_details && kundliData.nakshatra_details.soorya_rasi ? kundliData.nakshatra_details.soorya_rasi.name : 'N/A';
            const zodiac = kundliData && kundliData.nakshatra_details && kundliData.nakshatra_details.zodiac ? kundliData.nakshatra_details.zodiac.name : 'N/A';
            const gana = kundliData && kundliData.nakshatra_details && kundliData.nakshatra_details.additional_info ? kundliData.nakshatra_details.additional_info.ganam : 'N/A';
            const nadi = kundliData && kundliData.nakshatra_details && kundliData.nakshatra_details.additional_info ? kundliData.nakshatra_details.additional_info.nadi : 'N/A';

            doc.moveDown(1);
            doc.font('Times-Bold').fillColor(maroon).fontSize(16).text('BASIC ASTROLOGICAL PROFILE', 50, doc.y);
            doc.moveDown(0.5);

            const astroBoxTop = doc.y;
            doc.rect(50, astroBoxTop, pageWidth - 100, 130).lineWidth(0.5).stroke(gold);

            // Col 1
            doc.font('Helvetica-Bold').fontSize(10).fillColor(textDark)
                .text('Nakshatra (Star):', 65, astroBoxTop + 15)
                .font('Helvetica').fillColor(textMuted).text(nakshatra, 65, astroBoxTop + 30)

                .font('Helvetica-Bold').fillColor(textDark).text('Chandra Rashi (Moon):', 65, astroBoxTop + 55)
                .font('Helvetica').fillColor(textMuted).text(rashi, 65, astroBoxTop + 70)

                .font('Helvetica-Bold').fillColor(textDark).text('Gana:', 65, astroBoxTop + 95)
                .font('Helvetica').fillColor(textMuted).text(gana, 65, astroBoxTop + 110);

            // Col 2
            doc.font('Helvetica-Bold').fillColor(textDark)
                .text('Soorya Rashi (Sun Sign):', 300, astroBoxTop + 15)
                .font('Helvetica').fillColor(textMuted).text(sunSign, 300, astroBoxTop + 30)

                .font('Helvetica-Bold').fillColor(textDark).text('Zodiac Sign:', 300, astroBoxTop + 55)
                .font('Helvetica').fillColor(textMuted).text(zodiac, 300, astroBoxTop + 70)

                .font('Helvetica-Bold').fillColor(textDark).text('Nadi:', 300, astroBoxTop + 95)
                .font('Helvetica').fillColor(textMuted).text(nadi, 300, astroBoxTop + 110);

            doc.y = astroBoxTop + 150;

            // Mangal Dosha
            if (kundliData && kundliData.mangal_dosha) {
                doc.moveDown(1);
                doc.font('Times-Bold').fillColor(maroon).fontSize(16).text('MANGAL DOSHA ANALYSIS', 50, doc.y);
                doc.moveDown(0.5);
                const hasDosha = kundliData.mangal_dosha.has_dosha;
                const doshaColor = hasDosha ? '#da3633' : '#238636'; // Red if yes, Green if no
                doc.font('Helvetica-Bold').fontSize(14).fillColor(doshaColor).text(hasDosha ? 'Manglik Dosha Present' : 'No Manglik Dosha', 50, doc.y);
                if (kundliData.mangal_dosha.description) {
                    doc.moveDown(0.2);
                    doc.font('Helvetica').fontSize(11).fillColor(textMuted).text(kundliData.mangal_dosha.description, 50, doc.y, { width: pageWidth - 100, align: 'justify' });
                }
            }

            // Next Page for Yogas
            doc.addPage();

            doc.moveDown(2);
            doc.font('Times-Bold').fillColor(maroon).fontSize(20).text('KEY YOGA ANALYSIS', { align: 'center' });
            doc.moveDown(0.5);
            doc.font('Helvetica-Oblique').fontSize(11).fillColor(textMuted).text('Yogas are specific planetary combinations in your chart that yield profound results in your life path, career, and wealth.', { align: 'center', width: pageWidth - 100, x: 50 });
            doc.moveDown(2);

            let yogaY = doc.y;
            if (kundliData && kundliData.yoga_details && kundliData.yoga_details.length > 0) {
                kundliData.yoga_details.forEach(yoga => {
                    if (doc.y > pageHeight - 150) {
                        doc.addPage();
                        doc.moveDown(2);
                    }
                    doc.rect(50, doc.y, pageWidth - 100, 60).fillOpacity(0.02).fill(gold).stroke(gold);
                    doc.fillOpacity(1);
                    doc.font('Helvetica-Bold').fontSize(12).fillColor(maroon).text(yoga.name, 65, doc.y + 10);
                    doc.font('Helvetica').fontSize(10).fillColor(textDark).text(yoga.description, 65, doc.y + 5, { width: pageWidth - 130 });
                    doc.moveDown(1.5);
                    doc.x = 50; // Reset X
                });
            } else {
                doc.font('Helvetica').fontSize(11).fillColor(textDark).text('No specific major yogas returned in this brief summary.', 50, doc.y);
            }

            // Conclusion / CTA
            doc.addPage();
            doc.moveDown(5);
            doc.font('Times-Bold').fillColor(maroon).fontSize(24).text('The Path Forward', { align: 'center' });
            doc.moveDown(1);
            doc.font('Helvetica').fontSize(12).fillColor(textDark)
                .text("This automated reading highlights the fundamental building blocks of your astrological chart. However, astrology is highly nuanced. A single yoga or dosha does not define your destiny without looking at the exact degrees, mahadashas, and divisional charts (like Navamsa).", { align: 'center', width: pageWidth - 160, x: 80 });
            doc.moveDown(1);
            doc.font('Helvetica-Bold').fillColor(gold)
                .text("For crucial life decisions regarding your Startup, Career, or Marriage, consult Expert Astrologer Ashutosh for a detailed, handcrafted blueprint.", { align: 'center', width: pageWidth - 160, x: 80 });

            // Footer
            const footerY = pageHeight - 40;
            doc.font('Helvetica').fontSize(9).fillColor(textMuted).text('Generated securely by ShubhMay AI | Powered by Prokerala Sandbox', 0, footerY, { align: 'center' });

            doc.end();
        });

    } catch (error) {
        console.error('API Proxy Error:', error.response ? JSON.stringify(error.response.data) : error.message);

        return {
            statusCode: error.response ? error.response.status : 500,
            body: JSON.stringify({
                error: error.message,
                details: error.response ? error.response.data : 'Internal server error'
            })
        };
    }
};
