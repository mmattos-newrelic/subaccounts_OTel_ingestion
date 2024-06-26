const fs = require('fs');
const csv = require('csv-parser');

const csvFilePath = 'output.csv';
const jsonFilePath = 'output.json';

// Function to clean up the JSON file
function cleanUpJsonFile(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`${filePath} has been deleted.`);
    } else {
        console.log(`${filePath} does not exist, no need to delete.`);
    }
}

// Main function to read CSV and write JSON
function csvToJson() {
    const results = [];

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
          // Transform CSV data to desired JSON format
          const jsonData = results.map(item => ({
              eventType: "Otel_Ingestion",
              facet: item.facet,
              GBytes: parseFloat(item.GBytes),
              entityName: item.entityName,
              accountNumber: parseFloat(item.accountNumber),
          }));

          // Write JSON file
          fs.writeFile(jsonFilePath, JSON.stringify(jsonData, null, 2), (err) => {
              if (err) {
                  console.error('Error writing the JSON file:', err);
                  return;
              }

              console.log('JSON file successfully created.');
          });
      });
}

// Clean up the JSON file before running the main function
cleanUpJsonFile(jsonFilePath);
csvToJson();
