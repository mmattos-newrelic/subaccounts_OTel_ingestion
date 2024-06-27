# subaccounts_OTel_ingestion

Sample code to bring services ingestion info by subaccount

- This code was built using node.js,
- You must execute all the project files in the same directory (you can create it wherever you want),
- The 'accounts_keys.csv' file hosts the account numbers and account API keys of all the accounts that you want to collect data,
- Update the 'target_account.csv' with the account number and the ingest license key of the account that will receive the data from the integration (usually the Master Account);
- What do you need?
Access to a New Relic account with the "integration management" permission;
node.js v20.9.0
npm (local): 
├── csv-parser@3.0.0
├── esm@3.2.25
├── fs@0.0.1-security
├── got@14.0.0
├── graphql-request@6.1.0
├── json2csv@6.0.0-alpha.2
└── node-fetch@2.7.0
npm (global):
├── corepack@0.20.0
└── npm@10.1.0

- After downloading all the *.js files to your local directory and installing all the npm packages above, you only need to run the start.js file using the command > node start.js,
- How do you see your data?
Go to your destination New Relic account, go to 'Query Builder,' and run this query > select * from Otel_Ingestion. You'll check whether your data was received. You can use this table to create any dashboards you want.

Note: every time you run this script, the data created in the target account will bring information from the last 1 hour. We recommend building a job to run this integration every hour so you can have consistent information in your New Relic database.
