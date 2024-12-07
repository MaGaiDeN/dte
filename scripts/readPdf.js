import fs from 'fs';
import PDFParser from 'pdf2json';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pdfPath = join(__dirname, '..', 'dist', 'assets', 'reto_de_meditación_de__30_dias_lección_1.pdf');

const pdfParser = new PDFParser();

pdfParser.on("pdfParser_dataReady", pdfData => {
    pdfData.Pages.forEach((page, index) => {
        console.log(`\n--- PÁGINA ${index + 1} ---\n`);
        const text = decodeURIComponent(page.Texts.map(text => text.R[0].T).join(' '));
        console.log(text);
    });
});

pdfParser.loadPDF(pdfPath);
