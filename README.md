# scrapper
## Web scrapper for nairaland post in nodejs
### Installing
Download and run
```
npm install
```
### Code Process
Requirements
```
NodeJs Express Server
Cheerio - scrape html
bluebird - run promises on asynchronous functions
json2csv - Convert Json to CSV
fs - file system parser
```
### Process
```
Cheerio grabs HTML and each post is cataloged in a array of texts. array will be passed through functions to grab required fields
```

### Functions

```
extractEmails - get emails from each text using REGEX
extractPhones - get phone numbers from each text using REGEX
extractAddresses - get location from each text using string manipulation
extractSpecialization - get specialization from each text using string manipulation
extractBusiness - get business from each text using string manipulation
```

NB: Project still has kinks as much of this data is bad data. 
