
const fs = require('fs');
const path = require('path');
const { exec } = require("child_process");
const dir = './reports/allure';


let feedFile = 'api.json'


exec(`newman-run  -f ./${feedFile}`, (error, stdout, stderr) => {

  const ourReport = {
      TF_PASS: 0,
      TF_FAIL: 0,
      PAAS_PASS: 0,
      PAAS_FAIL: 0,
      DSD_PASS: 0,
      DSD_FAIL: 0
  };


function getObjectNames(requestName) {
    let data = requestName.split(" ");
    let existingComponents = [];
    data.forEach((component) => {
        if (component == '@paas' || component == '@PAAS') {
            if (!existingComponents.includes('PAAS')) {
                existingComponents.push("PAAS");
            }
        }

        if (component == '@tf' || component == '@TF') {
            if (!existingComponents.includes('TF')) {
                existingComponents.push("TF");
            }
        }

        if (component == '@dsd' || component == '@DSD') {
            if (!existingComponents.includes('DSD')) {
                existingComponents.push("DSD");
            }
        }
    })


    return existingComponents;
}

function init() {
    let count = 0;
    fs.readdirSync(dir)
        .filter(name => path.extname(name) === '.json')
        .map(name => {
            if (name.includes('-result.json')) {

                count++;
                let fileName = path.join(dir, name);

                var allureReport = JSON.parse(fs.readFileSync(fileName, 'utf8'));



                let labels = getObjectNames(allureReport.name);

                // Check For Failure
                let isFailed = !(allureReport.status == 'passed')
                // Update the Components
                if (isFailed) {
                    labels.forEach((label) => {
                        ourReport[label + '_FAIL'] = ourReport[label + '_FAIL'] + 1;
                    })
                }
                else {
                    labels.forEach((label) => {
                        ourReport[label + '_PASS'] = ourReport[label + '_PASS'] + 1;
                    })
                }





                // STEP 3: Writing to a file
                fs.writeFile("output.json", JSON.stringify(ourReport), err => {

                    // Checking for errors
                    if (err) throw err;
                });
            }
        });
}


init();


})
