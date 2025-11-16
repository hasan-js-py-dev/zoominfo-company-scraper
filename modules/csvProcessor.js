// modules/csvProcessor.js

const path = require('path');
const fs = require('fs');
const Papa = require('papaparse');


async function csvProcessor() {

    const filePath = path.join(__dirname, "..", 'input.csv');


// check csv file
     if (!fs.existsSync(filePath)) {

        throw new Error("❌ File not found");

    }

    console.log("✅ CSV path:", filePath);

    // Read CSV file as string

    const fileData = fs.readFileSync(filePath, 'utf-8');

    // Parse with PapaParse

    const parsed = Papa.parse(fileData, {
        header: true,
        skipEmptyLines: true
    })


    // check headers

    const headers = parsed.meta.fields;

    const expectedHeaders = ["url_number", 'url'];

    for (const header of expectedHeaders ) {

        if(!headers.includes(header)) {
         throw new Error(`❌ Missing required header: ${header}`);

        }
    }


     console.log("✅ Headers are valid:", headers);


    console.log("✅ Rows parsed:", parsed.data);


    return parsed.data;
    
}


module.exports = csvProcessor;