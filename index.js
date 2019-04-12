    
// !/usr/bin/env node

// Linkedin Company Data Bot
// __ Description: Bot gathering companies information from Linkedin using headless Chrome with Puppeteer
// __ Status: Prototype
// __ Author: Remy Thellier
// __ Email: remythellier@gmail.com
// __ Licence: MIT

var fs = require('fs');
const puppeteer = require('puppeteer');
var prompt = require('prompt');
var csv = require('fast-csv');

var companiesData = [];

// used for prompt
var schema = {
  properties: {
    linkedinEmail: {
      required: true
    },
    linkedinPassword: {
      required: true,
      hidden: true
    },
    CSVfileName: {
      required: true
    }
  }
};

function start(){
	prompt.start();
	prompt.get(schema, function (err, result) {   
    console.log('Command-line input received:');
    console.log('  Linkedin email : ' + result.linkedinEmail);
    console.log('  CSV file name (in the /input folder) : ' + result.CSVfileName);
    var CSVpath = "./" + result.CSVfileName;
    console.log('  path : ' + CSVpath);
    readCSV(CSVpath);
    run(result.linkedinEmail, result.linkedinPassword);
  });
}

function readCSV(CSVpath){
  csv.fromPath(CSVpath, {headers: true, delimiter:';'})
     .on('data', function(data){
       companiesData.push({'link': data.link});
     })
     .on('end', function(data){
       console.log("finished reading");
       console.log(companiesData);
     })
}

function writeCSV(CSVfileName, data){
  csv
    .writeToPath(CSVfileName, 
    data,
    {headers: true, delimiter:'|'})
    .on("finish", function(){
        console.log("done!");
    });
}

// fixing the missing dash at the end of some URLs in the input file
function addLastDash(url_tested){
  if (url_tested.charAt(url_tested.length-1) == "/"){
    return url_tested
  }else{
    return url_tested + "/"
  }
}

async function run(linkedinEmail, linkedinPassword) {
  const browser = await puppeteer.launch({slowMo: 250}); // add {slowMo: 250} to slow down the bot
  const page = await browser.newPage(); 
  await page.goto('https://linkedin.com');
  await page.waitFor(200);
  var loginSelector ="#login-email";
  var passwordSelector = "#login-password";
  var submitLoginSelector = "#login-submit";
  await page.click(loginSelector);
  await page.keyboard.type(linkedinEmail);
  await page.waitFor(200);
  await page.click(passwordSelector);
  await page.keyboard.type(linkedinPassword);
  await page.waitFor(100);
  await page.click(submitLoginSelector);
  await page.waitForNavigation();
  console.log('Identified!');
  var dataToBeExported = [];
  var allCategories = [];
  for (let company of companiesData) {
    companyURL = addLastDash(company.link) + "about/";
    await page.goto(companyURL);
    await page.waitFor(150);
    let pageContent = await page.evaluate(() => {
      categories = [];
      function setDefaultVal(value, defaultValue){
        return (value === undefined) ? defaultValue : value;
      }
      function setDefaultValOrSetInnerText(value, defaultValue){
        return (value === undefined) ? defaultValue : value.innerText;
      } 
      result = {};
      let name = setDefaultValOrSetInnerText(document.getElementsByClassName('org-top-card-summary__title')[0], "na");
      let employeesOnLinkedin = setDefaultValOrSetInnerText(document.getElementsByClassName('v-align-middle')[0], "na");
      let employees = "na";
      if (employeesOnLinkedin != "na") {
        employees = employeesOnLinkedin.slice(employeesOnLinkedin.indexOf("all ") + 4, employeesOnLinkedin.indexOf("employees"));
      }
      console.log(employeesOnLinkedin + " ///// " + employees);
      let blurb = setDefaultValOrSetInnerText(document.getElementsByClassName('white-space-pre-wrap')[0], "na");
      let detailsCat = setDefaultVal(document.getElementsByClassName('org-page-details__definition-term'), "na");
      let detailsContent = setDefaultVal(document.getElementsByClassName('org-page-details__definition-text'), "na");
      result['name'] = name;
      result['employeesOnLinkedin'] = employees;
      result['blurb'] = blurb;
      if (detailsCat !== "na"){
        for (let i = 0; i < detailsCat.length; i++ ){
          result[detailsCat[i].innerText] = detailsContent[i].innerText;
          if (!categories[detailsCat[i].innerText]){
            categories.push(detailsCat[i].innerText);
          }
        }   
      }
      return {result: result, categories: categories}; 
    });

    dataToBeExported.push(pageContent.result);
    for (let category in pageContent.categories){
      if (!allCategories.includes(pageContent.categories[category])){
        allCategories.push(pageContent.categories[category]);
      }
    }
  };

  for (let company in dataToBeExported){
    for (let category in allCategories){
      if (!company[allCategories[category]]){
        company[allCategories[category]] = "na";
      }
    }
  }
  console.log(JSON.stringify("---------------   Data collected ------------------"));
  var cleanResult = JSON.stringify(dataToBeExported).replace(/\\n/g, '').replace(/\\r/g, '');
  console.log(cleanResult);

  browser.close();

  writeCSV("export.csv", JSON.parse(cleanResult));
}

start();