const fs = require('fs');
const path = require('path');

const dirs = ['app', 'components', 'context'];

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

    // Pattern to look for: ${process.env.NEXT_PUBLIC_API_URL}/api/...
    // Replace with: ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/...

    // We only want to replace it if it's not already wrapped in the fallback
    if (!content.includes("NEXT_PUBLIC_API_URL || 'http://localhost:5000'") && !content.includes('NEXT_PUBLIC_API_URL || "http://localhost:5000"')) {
        content = content.replace(/\$\{process\.env\.NEXT_PUBLIC_API_URL\}/g, "${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}");
    }

    if (original !== content) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file} with fallback`);
    }
});
console.log('Fallback script complete.');
