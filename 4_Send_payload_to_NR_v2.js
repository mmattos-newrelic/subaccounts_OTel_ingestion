const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

// Define the path to the CSV file
const csvFilePath = path.resolve(__dirname, 'target_account.csv');
const inputFilePath = path.resolve(__dirname, 'output.json');

// Function to read the CSV file and extract the license key and account ID
function getCredentialsFromCSV(filePath) {
    return new Promise((resolve, reject) => {
        const credentials = {};

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                credentials.licenseKey = row.licenseKey;
                credentials.accountId = row.accountId;
            })
            .on('end', () => {
                if (credentials.licenseKey && credentials.accountId) {
                    resolve(credentials);
                } else {
                    reject('CSV file does not contain required fields.');
                }
            })
            .on('error', (error) => {
                reject(`Error reading CSV file: ${error.message}`);
            });
    });
}

// Function to execute the command with the extracted credentials
async function executeCommand() {
    try {
        const { licenseKey, accountId } = await getCredentialsFromCSV(csvFilePath);
        const command = `gzip -c ${inputFilePath} | curl -X POST -H "Content-Type: application/json" ` +
            `-H "Api-Key: ${licenseKey}" -H "Content-Encoding: gzip" ` +
            `https://insights-collector.newrelic.com/v1/accounts/${accountId}/events --data-binary @-`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
        });
    } catch (error) {
        console.error(`Failed to execute command: ${error}`);
    }
}

// Execute the command
executeCommand();
