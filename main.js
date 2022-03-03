const { exec } = require("child_process");
var fs = require('fs');

let feedFile = 'api.json'
let reportFIle = './reports/json/JsonPlaceHolder.postman_collection.json.json'

exec(`sudo newman-run  -f ./${feedFile}`, (error, stdout, stderr) => {

    // NOW GENERATE YOUR OWN REPORT FILE JSON FILE 

    var allureReport = JSON.parse(fs.readFileSync(reportFIle, 'utf8'));

    let ourReport = {
        TF_PASS : 0,
        TF_FAIL:0,
        PAAS_PASS:0,
        PAAS_FAIL:0,
        DSD_PASS:0,
        DSD_FAIL:0
    };


    allureReport.run.executions.forEach((request)=>{
            // Get Labels
            console.log(request.item.name)
            let labels = getObjectNames(request.item.name);

            // Check For Failure
            let isFailed = false;
            request.assertions.forEach((assertion) => {
                if(assertion.error) {
                    isFailed = true;
                }
            })

            // Update the Components
            if(isFailed) {
                labels.forEach((label)=>{
                    ourReport[label+'_FAIL'] =  ourReport[label+'_FAIL']+ 1;
                })
            }
            else {
                labels.forEach((label)=>{
                    ourReport[label+'_PASS'] =  ourReport[label+'_PASS'] + 1;
                })
            }
    })


    console.log(ourReport)

    // STEP 3: Writing to a file
    fs.writeFile("output.json", JSON.stringify(ourReport), err => {
        
        // Checking for errors
        if (err) throw err; 
    
        console.log("Done writing"); // Success
    });

});


function getObjectNames(requestName) {
    let data  = requestName.split(" ");
    let existingComponents = [];
    data.forEach((component)=>{
        if(component == '@paas' || component == '@PAAS') {
            if(!existingComponents.includes('PAAS')) {
                existingComponents.push("PAAS");
            }
        }

        if(component == '@tf' || component == '@TF') {
            if(!existingComponents.includes('TF')) {
                existingComponents.push("TF");
            }
        }

        if(component == '@dsd' || component == '@DSD') {
            if(!existingComponents.includes('DSD')) {
                existingComponents.push("DSD");
            }
        }
    })


    return existingComponents;
}