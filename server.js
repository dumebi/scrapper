let express = require('express');
let fs = require('fs');
let request = require('request');
let cheerio = require('cheerio');
let app     = express();
let _ = require('lodash');
let json2csv = require('json2csv');
let newLine= "\r\n";

let fields = ['email', 'phone', 'address', 'specialization', 'business'];

function extractEmails (text)
{
    //scrapes[count].email = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
    //scrape.email = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
    //console.log(scrape.email);
    //scrapes[count] = scrape;
    return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
}

function extractPhones (text)
{
    return text.match(/(\d{9,})/gi);
}

function extractAddresses (text)
{
    let res = text.split("<br>");
    let str = "null";

    for (var i = 0; i < res.length; i++){
        if(res[i].toLowerCase().includes("location") || res[i].toLowerCase().includes(" state")){
            str = res[i].toLowerCase().substring(res[i].toLowerCase().indexOf("location") - 1);
            if(str.toLowerCase().includes(" 08") || str.toLowerCase().includes(" mobile")){
                str = str.toLowerCase().substring(0, str.toLowerCase().indexOf("08") - 1);
                str = str.toLowerCase().substring(0, str.toLowerCase().indexOf("mobile") - 1);
            }
        }

    }
    //console.log(str);
    return str;
}

function extractSpecialization (text)
{
    let res = text.split("<br>");
    let str = "null";
    for (var i = 0; i < res.length; i++){
        if(res[i].toLowerCase().includes(" specialisation") || res[i].toLowerCase().includes(" specialization")){
            str = res[i].toLowerCase().substring(res[i].toLowerCase().indexOf(" specialisation")) || res[i].toLowerCase().substring(res[i].toLowerCase().indexOf(" specialization")) || res[i].toLowerCase().substring(res[i].toLowerCase().indexOf(" specialization"));
            if(str.toLowerCase().includes(" location")){
                str = str.toLowerCase().substring(0, str.toLowerCase().indexOf("location") - 1);
                //str = str.toLowerCase().substring(0, str.toLowerCase().indexOf("mobile") - 1);
            }
        }
    }
    //console.log(str);
    return str;
}



function extractBusiness (text)
{
    let res = text.split("<br>");
    let str = "null";
    for (var i = 0; i < res.length; i++){
        if(res[i].toLowerCase().includes("agrobosco") || res[i].toLowerCase().includes("centre")){
             str = res[i].toLowerCase().substring(res[i].toLowerCase().indexOf("agrobosco")) || res[i].toLowerCase().substring(res[i].toLowerCase().indexOf("centre"));
            if(str.toLowerCase().includes("agrobosco") || str.toLowerCase().includes("centre")){
                str = str.toLowerCase().substring(0, str.toLowerCase().indexOf("agrobosco") - 1);
                str = str.toLowerCase().substring(0, str.toLowerCase().indexOf("centre") - 1);
            }
        }
    }
   // console.log(str);
    return str;
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
            process();
            extract($);

        }
    })
});

function process(){
    let links_ = [];

        for (var i = 1; i <= 62; i++) {
            url = 'http://www.nairaland.com/2222332/nairaland-farmers-contact-details/'+i;
            request(url, function(error, response, html){
                if(!error){
                    let $ = cheerio.load(html);
                    extract($);

                }
            })
        }
    console.log(links_);

}

function extract($){
    $('td.l.w.pd').each(function() {
        let message = $('div.narrow', this).html();

        let email = extractEmails(message);
        let phone = extractPhones(message);
        let address = extractAddresses(message);
        let spec = extractSpecialization(message);
        let business = extractBusiness(message);

        let scrape = {"email":email,"phone":phone,"address":address,"specialization":spec,"business":business};

        console.log("scrape");
        console.log(scrape);
        callBack(scrape)
    });
}
function callBack(scrape) {
    let toCsv = {
        data: scrape,
        fields: fields,
        hasCSVColumnTitle: false
    };
    fs.stat('file.csv', function (err, stat) {
        if (err == null) {
            //console.log('File exists');

            //write the actual data and end with newline
            let csv = newLine + json2csv(toCsv);
            //console.log(toCsv);

            fs.appendFile('file.csv', csv, function (err) {
                if (err) throw err;
                //console.log('The "data to append" was appended to file!');
            });
        }
        else {
            //write the headers and newline
            //console.log('New file, just writing headers');
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