const fs = require('fs');
const path = require('path');

const dirs = ['app', 'components', 'context'];
const targetUrl = 'http://localhost:5000';
const replacement = '${process.env.NEXT_PUBLIC_API_URL}';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

let allFiles = [];
dirs.forEach(d => {
    allFiles = allFiles.concat(walk(path.join(__dirname, d)));
});

allFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace 'http://localhost:5000...' with `${process.env.NEXT_PUBLIC_API_URL}...`
    // We regex match the quotes to replace single/double quotes with backticks.

    // Pattern 1: 'http://localhost:5000/api/...' -> `${process.env.NEXT_PUBLIC_API_URL}/api/...`
    content = content.replace(/'http:\/\/localhost:5000([^']*)'/g, '`${process.env.NEXT_PUBLIC_API_URL}$1`');

    // Pattern 2: "http://localhost:5000/api/..." -> `${process.env.NEXT_PUBLIC_API_URL}/api/...`
    content = content.replace(/"http:\/\/localhost:5000([^"]*)"/g, '`${process.env.NEXT_PUBLIC_API_URL}$1`');

    // Pattern 3: `http://localhost:5000/api/...` -> `${process.env.NEXT_PUBLIC_API_URL}/api/...`
    content = content.replace(/`http:\/\/localhost:5000([^`]*)`/g, '`${process.env.NEXT_PUBLIC_API_URL}$1`');

    if (original !== content) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
console.log('Done.');
