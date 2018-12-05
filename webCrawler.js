var request = require('request');
var success = [];
var skipped = [];
var invalid = [];

// Started off with site that I use and know that has links
var internet = ["https://www.cbssports.com"];

// put in as a limit for pages to visit when testing to see result
var visitCount = 0;

webCrawler();

function webCrawler() {
    if(internet.length > 0 && visitCount < 10){
        // Get next link to visit
        var linkToVisit = internet.pop();
        if(skipped.includes(linkToVisit)) {
            // Already skipped so call web crawl
            webCrawler();
        } else if(success.includes(linkToVisit) || invalid.includes(linkToVisit)){
            // Has been vistied so add to skipped and continue web crawl
            skipped.push(linkToVisit);
            webCrawler();
        } else {
            visitCount++;
            checkPage(linkToVisit);
        }
    } else {
        console.log({
            'succes': success,
            'skipped': skipped,
            'invalid': invalid
        });
        return {
            'succes': success,
            'skipped': skipped,
            'invalid': invalid
        }
    }
}

function checkPage(link) {
    request.get(link, function(error, response, body){
        if(error || response.statusCode !== 200) {
            invalid.push(link);
            webCrawler();
        } else {
            // Success visit put into success
            success.push(link);
            link = new URL(link);
            getLinksFromPage(body, link.protocol, link.hostname);
            webCrawler();
        } 
    });
}

function getLinksFromPage(page, protocol, hostname) {
    var links = page.match(/href="([^\'\"]+)/g);
    if(links){
        links.forEach(element => {
            // remove href=" from the links
            element = element.replace(/href="/g, '');
            // check if relative link
            if(!element.includes('https') && !element.includes('http')){
                element = protocol + '//' + hostname + element;
            }
            internet.push(element);
        });
    }
}
