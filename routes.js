const express = require("express");
const userModel = require("./models");
const app = express();
const { exec } = require("child_process");
const fs = require('fs');
const path = require('path');
const dir = './reports/allure';



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



function init(ourReport) {
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





                // // STEP 3: Writing to a file
                // fs.writeFile("output.json", JSON.stringify(ourReport), err => {
                //
                //     // Checking for errors
                //     if (err) throw err;
                // });
            }
        });

        return ourReport;
}



// ...
app.post("/run_newman", async (request, response) => {
  let feedFile = 'api.json'


  let ourReport = {
      TF_PASS: 0,
      TF_FAIL: 0,
      PAAS_PASS: 0,
      PAAS_FAIL: 0,
      DSD_PASS: 0,
      DSD_FAIL: 0
  };

    exec( `newman-run  -f ./${feedFile}`, async (error, stdout, stderr) => {
    ourReport = init(ourReport);

    const user = new userModel(ourReport);

    try {
      await user.save();
      response.send(user);
    } catch (error) {
      response.status(500).send(error);
    }
    })
});


// ...
app.get("/users", async (request, response) => {
  const users = await userModel.find({});

  try {
    response.send(users);
  } catch (error) {
    response.status(500).send(error);
  }
});




module.exports = app;
