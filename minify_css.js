const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
if (styleMatch) {
    let css = styleMatch[1];
    css = css.replace(/\/\*[\s\S]*?\*\//g, ''); // Remove comments
    css = css.replace(/[\n\r]+/g, ' '); // Remove newline characters specifically
    css = css.replace(/\s+/g, ' '); // Compress remaining whitespace
    css = css.replace(/\s*{\s*/g, '{');
    css = css.replace(/\s*}\s*/g, '}');
    css = css.replace(/\s*:\s*/g, ':');
    css = css.replace(/\s*;\s*/g, ';');
    css = css.replace(/\s*,\s*/g, ',');
    
    html = html.replace(/<style>[\s\S]*?<\/style>/, `<style>${css}</style>`);
    fs.writeFileSync('index.html', html);
    console.log('Minified inline CSS inside index.html successfully!');
} else {
    console.log('No <style> block found');
}
