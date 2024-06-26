const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');

const jsonFilePath = 'bkp_output.json';
const csvFilePath = 'output.csv';

// Function to clean up the CSV file
function cleanUpCsvFile(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`${filePath} has been deleted.`);
    } else {
        console.log(`${filePath} does not exist, no need to delete.`);
    }
}

// Main function to read JSON and write CSV
function jsonToCsv() {
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the JSON file:', err);
            return;
        }

        try {
            const jsonData = JSON.parse(data);

            // Prepare data for CSV
            const csvData = [];

            jsonData.forEach(account => {
                const accountNumber = account.accountNumber;
                const results = account.data.actor.nrql.results;

                results.forEach(result => {
                    csvData.push({
                        accountNumber,
                        facet: result.facet,
                        GBytes: result.GBytes,
                        entityName: result["entity.name"]
                    });
                });
            });

            // Define CSV fields
            const fields = ['accountNumber', 'facet', 'GBytes', 'entityName'];
            const opts = { fields };

            // Convert to CSV
            const parser = new Parser(opts);
            const csv = parser.parse(csvData);

            // Write CSV file
            fs.writeFile(csvFilePath, csv, (err) => {
                if (err) {
                    console.error('Error writing the CSV file:', err);
                    return;
                }

                console.log('CSV file successfully created.');
            });

        } catch (err) {
            console.error('Error parsing the JSON data:', err);
        }
    });
}

// Clean up the CSV file before running the main function
cleanUpCsvFile(csvFilePath);
jsonToCsv();
