const fs = require('fs');
const file = 'controllers/productController.js';
let content = fs.readFileSync(file, 'utf8');

// The messed up lines currently look something like:
//         const product = await prisma.product.findUnique({
//             where: { id: Number(req.params.id) },
//             include: { 
//                 category: { select: { id: true, name: true } }, 
//                 collection: { select: { id: true, name: true } } 
//         if (product) {
//             res.json(formatProduct(product));
//         } else {

const correctLines = `
        const product = await prisma.product.findUnique({
            where: { id: Number(req.params.id) },
            include: { 
                category: { select: { id: true, name: true } }, 
                collection: { select: { id: true, name: true } } 
            },
        });

        if (product) {
            res.json(formatProduct(product));
        } else {
`;

content = content.replace(/const product = await prisma\.product\.findUnique\(\{[\s\S]*?\} else \{/, correctLines.trim() + ' {');
fs.writeFileSync(file, content);
console.log("Fixed!");
