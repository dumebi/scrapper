let express = require('express');
let fs = require('fs');
let request = require('request');
let cheerio = require('cheerio');
let app     = express();
let Promise = require('bluebird');
let json2csv = require('json2csv');
let newLine= "\r\n";

let fields = ['email', 'phone', 'address', 'specialization', 'business'];

let scrapes = [];
let scrape = {email:"", phone:"", address:"", specialization:"", business:""};
let count = 0;


function extractEmails (text)
{
    //scrape[count].email = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
    scrape.email = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
    //scrapes[count] = scrape;
    return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
}

function extractPhones (text)
{
    //scrape[count].phone = text.match(/(\d{9,})/gi);
    scrape.phone = text.match(/(\d{9,})/gi);
    //scrapes[count] = scrape;
    return text.match(/(\d{9,})/gi);
}

function extractAddresses (text)
{
    let res = text.split("<br>");
    let str = "null";
    Promise.each(res,function(r){
        if(r.toLowerCase().includes("location") || r.toLowerCase().includes(" state")){
            str = r.toLowerCase().substring(r.toLowerCase().indexOf("location") - 1);
            if(str.toLowerCase().includes(" 08") || str.toLowerCase().includes(" mobile")){
                str = str.toLowerCase().substring(0, str.toLowerCase().indexOf("08") - 1);
                str = str.toLowerCase().substring(0, str.toLowerCase().indexOf("mobile") - 1);
            }
        }
        callbackAddress(str);
    }).then(function(){
        //scrape[count].address = str;

            //console.log(str);

    });
}

function callbackAddress(str){
    scrape.address = str;
    //scrapes[count] = scrape;
}

function extractSpecialization (text)
{
    let res = text.split("<br>");
    let str = "null";
    Promise.each(res,function(r){
        if(r.toLowerCase().includes(" specialisation") || r.toLowerCase().includes(" specialization")){
            str = r.toLowerCase().substring(r.toLowerCase().indexOf(" specialisation")) || r.toLowerCase().substring(r.toLowerCase().indexOf(" specialization")) || r.toLowerCase().substring(r.toLowerCase().indexOf(" specialization"));
            if(str.toLowerCase().includes(" location")){
                str = str.toLowerCase().substring(0, str.toLowerCase().indexOf("location") - 1);
                //str = str.toLowerCase().substring(0, str.toLowerCase().indexOf("mobile") - 1);
            }
        }
        callbackSpecialization(str);
    }).then(function(){
        //scrape[count].specialization = str

        //console.log(str);
    });
}

function callbackSpecialization(str){
    scrape.specialization = str;
    //scrapes[count] = scrape;
}

function extractBusiness (text)
{
    let res = text.split("<br>");
    let str = "null";
    Promise.each(res,function(r){
        console.log(r);
        if(r.toLowerCase().includes("agrobosco") || r.toLowerCase().includes("centre")){
             str = r.toLowerCase().substring(r.toLowerCase().indexOf("agrobosco")) || r.toLowerCase().substring(r.toLowerCase().indexOf("centre"));
            if(str.toLowerCase().includes("agrobosco") || str.toLowerCase().includes("centre")){
                str = str.toLowerCase().substring(0, str.toLowerCase().indexOf("agrobosco") - 1);
                str = str.toLowerCase().substring(0, str.toLowerCase().indexOf("centre") - 1);
            }
            console.log(str);
        }
        callbackBusiness(str);
    }).then(function(){
        //scrape[count].business = str;

        //console.log(str);
    });
}

function callbackBusiness(str){
    scrape.business = str;
    //scrapes[count] = scrape;
}


app.get('/scrape', function(req, res){
    // The URL we will scrape from - in our example Anchorman 2.

    url = 'http://www.nairaland.com/2222332/nairaland-farmers-contact-details';

    // The structure of our request call
    // The first parameter is our URL
    // The callback function takes 3 parameters, an error, response status code and the html

    request(url, function(error, response, html){

        // First we'll check to make sure no errors occurred when making the request

        if(!error){
            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

            let $ = cheerio.load(html);
            process($);

        }
    })
});

function process($){

    // Finally, we'll define the variables we're going to capture

    $('td.l.w.pd').each(function() {
        let message = $('div.narrow', this).html();

        extractEmails(message);
        extractPhones(message);
        extractAddresses(message);
        extractSpecialization(message);
        extractBusiness(message);

        count++;
        callBack()
    });
}

function callBack() {
    let toCsv = {
        data: scrape,
        fields: fields,
        hasCSVColumnTitle: false
    };
    fs.stat('file.csv', function (err, stat) {
        if (err == null) {
            console.log('File exists');

            //write the actual data and end with newline
            var csv = json2csv(toCsv) + newLine;

            fs.appendFile('file.csv', csv, function (err) {
                if (err) throw err;
                console.log('The "data to append" was appended to file!');
            });
        }
        else {
            //write the headers and newline
            console.log('New file, just writing headers');
            fields = (fields + newLine);

            fs.writeFile('file.csv', fields, function (err, stat) {
                if (err) throw err;
                console.log('file saved');
            });
        }
    });
}

app.listen('8081');

console.log('Listening on port 8081');

exports = module.exports = app;