// requires
const fs = require("fs");
const { JSDOM } = require("jsdom");
const csv = require("csvtojson");

// paths and file names
const htmlFileName = "index.html";
const htmlFileNameAppended = "index-translated.html";
const htmlFilePath = "./" + htmlFileName;
const csvFilePath = "./translations.csv";

// global variables
let csvContent, tagIndex, globalDocument;

// read csv
csv()
    .fromFile(csvFilePath)
    .then(jsonObj => {
        csvContent = jsonObj;
        tagIndex = csvContent[csvContent.length - 1].id.slice(4) * 1;
        readHtml();
    });

/**
 * Reads the HTML file and creates a JSDOM object
 */
const readHtml = () => {
    fs.readFile(htmlFilePath, (err, data) => {
        if (err) throw err;
        processFile(new JSDOM(data));
    });
};

/**
 * Processes file
 * @param {object} dom JSDOM document HTML
 */
const processFile = dom => {
    globalDocument = dom.window.document;
    readFile(globalDocument.body);
    // fs.writeFile(htmlFileNameAppended, globalDocument.documentElement.outerHTML, () => {
    //     console.log("Complete");
    // });
};

/**
 * Reads through the file and each html child
 * @param {object} html JSDOM document HTML
 */
const readFile = html => {
    if (html.childElementCount !== 0) {
        for (let i = 0; i < html.children.length; i++) {
            readFile(html.children[i]);
        }
    } else {
        console.log("Text:", html.textContent);
        checkCsv(html);
        // html.innerHTML = html.textContent + "1";
        // console.log(html.textContent);
    }
};

const checkCsv = html => {
    let tagId;
    for (let i = 0; i < csvContent.length; i++) {
        if (html.textContent === csvContent[i].en) {
            // console.log("Check:", "Exists");
            tagId = csvContent[i].id;
            return;
        }
    }

    if (tagId !== undefined) {
        let span = globalDocument.createElement("span");
        span.setAttribute("id", tagId);
        span.innerHTML = html.textContent;
        html.innerHTML = "";
        html.appendChild(span);
        return;
    }
    // console.log("Check", "Does not exist");
};
