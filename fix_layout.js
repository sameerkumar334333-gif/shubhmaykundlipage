const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

if (!html.includes('.desktop-only')) {
    html = html.replace('</style>', `
        @media (min-width: 901px) {
            .mobile-only { display: none !important; }
        }
        @media (max-width: 900px) {
            .desktop-only { display: none !important; }
        }
    </style>`);
}

// Extract Image using start limit
const imageStart = html.indexOf('<div class="mockup-img-container floating-anim"');
const imageEnd = html.indexOf('</div>', imageStart) + 6;
const imageStr = html.substring(imageStart, imageEnd);

// Extract Price Card using start and end limit
const priceStart = html.indexOf('<div class="impact-price-wrapper"');
const priceSubString = html.substring(priceStart);
// Look for closing pattern "Manually Prepared PDF</div></div></div>"
const priceSearchEndMatch = priceSubString.match(/Manually Prepared PDF[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
const priceStr = priceSubString.substring(0, priceSearchEndMatch.index + priceSearchEndMatch[0].length);

let mobileImageStr = imageStr.replace('class="mockup-img-container floating-anim"', 'class="mockup-img-container floating-anim mobile-only"');
let desktopImageStr = imageStr.replace('class="mockup-img-container floating-anim"', 'class="mockup-img-container floating-anim desktop-only"');

let mobilePriceStr = priceStr.replace('class="impact-price-wrapper"', 'class="impact-price-wrapper mobile-only"');
let desktopPriceStr = priceStr.replace('class="impact-price-wrapper"', 'class="impact-price-wrapper desktop-only"');

// 1. Swap Mobile versions into original spots
html = html.replace(imageStr, mobileImageStr);
html = html.replace(priceStr, mobilePriceStr);

// 2. Erase Astro Badge
html = html.replace(/<!-- Overlapping Astro Badge -->[\s\S]*?AstroGuru Ashutosh<\/strong>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, '');

// 3. Inject Desktop Price into Left Column (Before Trust Chips)
html = html.replace('<!-- Trust Chips -->', desktopPriceStr + '\n                    <!-- Trust Chips -->');

// 4. Inject Desktop Image into Right Column (Before Mobile Price Wrapper)
html = html.replace('<!-- Price Wrapper inserted in place of PNG -->', '<!-- Price Wrapper inserted in place of PNG -->\n' + desktopImageStr);

fs.writeFileSync('index.html', html);
console.log('Update Complete.');
