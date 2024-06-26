const { GraphQLClient, gql } = require('graphql-request');
const fs = require('fs');
const csv = require('csv-parser'); // to read the CSV file

// GraphQL endpoint URL
const endpoint = 'https://api.newrelic.com/graphql';

// Paths to CSV and JSON files
const csvFilePath = 'accounts_keys.csv'; // Replace with your actual CSV file path
const jsonFilePath = 'bkp_output.json'; // Replace with your desired JSON file path

// Your GraphQL query template
const queryTemplate = (accountNumber) => gql`
  {
    actor {
      nrql(
        accounts: ${accountNumber}
        async: true
        query: "SELECT bytecountestimate()/10e8 as 'GBytes' from Span,SpanEvent where instrumentation.provider = 'opentelemetry' LIMIT 200 facet entity.name"
        timeout: 5
      ) {
        results
        totalResult
      }
    }
  }
`;

// Function to read CSV file
const readCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

// Function to read JSON file safely
const readJSONFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return data ? JSON.parse(data) : [];
    }
    return [];
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return [];
  }
};

// Function to write JSON file safely
const writeJSONFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing JSON file:', error);
  }
};

// Function to clean the JSON file content
const cleanJSONFile = (filePath) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    console.log('JSON file cleaned:', filePath);
  } catch (error) {
    console.error('Error cleaning JSON file:', error);
  }
};

// Main function to execute the GraphQL queries
const executeQueries = async () => {
  try {
    const records = await readCSV(csvFilePath); // Use the CSV file path variable

    // Clean the JSON file before proceeding
    cleanJSONFile(jsonFilePath); // Use the JSON file path variable

    // Read existing output file content
    let existingData = readJSONFile(jsonFilePath); // Use the JSON file path variable

    // Iterate over each record from the CSV
    for (const record of records) {
      const apiKey = record.apiKey;
      const accountNumber = record.accountNumber;
      
      // Headers to send
      const headers = {
        'Content-Type': 'application/json',
        'API-Key': apiKey
      };

      // Create a GraphQL client with custom headers
      const client = new GraphQLClient(endpoint, { headers });

      // GraphQL query for the current account number
      const query = queryTemplate(accountNumber);

      try {
        // Execute the GraphQL query
        const data = await client.request(query);

        // Append new data to the existing data
        existingData.push({ accountNumber, data });

        // Write the updated data to the JSON file
        writeJSONFile(jsonFilePath, existingData); // Use the JSON file path variable
        console.log('Query result for account', accountNumber, 'saved to', jsonFilePath); // Use the JSON file path variable
      } catch (error) {
        console.error('Error executing the GraphQL query for account', accountNumber, ':', error);
      }
    }
  } catch (error) {
    console.error('Error reading the CSV file:', error);
  }
};

// Execute the main function
executeQueries();
