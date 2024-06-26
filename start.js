const { spawn } = require('child_process');
const fs = require('fs');

// Function to execute a script and check for file existence
function executeScript(scriptPath, fileToCheck) {
    return new Promise((resolve, reject) => {
        const script = spawn('node', [scriptPath]);

        let stderrData = ''; // Variable to accumulate stderr output

        script.stdout.on('data', (data) => {
            console.log(`${scriptPath} stdout: ${data}`);
        });

        script.stderr.on('data', (data) => {
            stderrData += data.toString(); // Accumulate stderr output
            console.error(`${scriptPath} stderr: ${data}`);
        });

        script.on('close', (code) => {
            console.log(`${scriptPath} exited with code ${code}`);
            if (code !== 0) {
                reject(`${scriptPath} exited with non-zero code ${code}`);
            } else if (fs.existsSync(fileToCheck)) {
                console.log(`${fileToCheck} has been created.`);
                if (stderrData) {
                    console.error(`${scriptPath} encountered an error: ${stderrData}`);
                }
                resolve();
            } else {
                reject(`${fileToCheck} was not created.`);
            }
        });
    });
}

// Scripts to execute sequentially with their corresponding files to check
const scripts = [
    { scriptPath: './1_backup_Mult_v3.js', fileToCheck: './bkp_output.json' },
    { scriptPath: './2_create_csv_file_v2.js', fileToCheck: './output.csv' },
    { scriptPath: './3_csv_to_json_payload_v2.js', fileToCheck: './output.json' },
    { scriptPath: './4_Send_payload_to_NR_v2.js', fileToCheck: null }  // No file to check after this script
];

// Function to execute scripts sequentially
async function executeScripts() {
    for (let i = 0; i < scripts.length; i++) {
        const { scriptPath, fileToCheck } = scripts[i];
        console.log(`Executing script: ${scriptPath}`);
        try {
            await executeScript(scriptPath, fileToCheck);
        } catch (error) {
            console.error(error);
            break; // Stop execution if any script fails
        }
    }
}

// Start executing scripts sequentially
executeScripts().then(() => {
    console.log('All scripts executed successfully.');
}).catch((error) => {
    console.error('Script execution failed:', error);
});
