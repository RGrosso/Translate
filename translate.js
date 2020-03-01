const fs = require("fs");
const { JSDOM } = require("jsdom");
const csv = require("csvtojson");

const htmlFileName = "index.html";
const htmlFileNameAppended = "index-translated.html";
const htmlFilePath = "./" + htmlFileName;
const csvFilePath = "./translations.csv";

let csvContent, tagIndex, globalDocument;
csv()
    .fromFile(csvFilePath)
    .then(jsonObj => {
        csvContent = jsonObj;
        tagIndex = csvContent[csvContent.length - 1].id.slice(4) * 1;
        readHtml();
    });

const readHtml = () => {
    fs.readFile(htmlFilePath, (err, data) => {
        if (err) throw err;
        processFile(new JSDOM(data));
    });
};

const processFile = dom => {
    globalDocument = dom.window.document;
    readFile(globalDocument.body);
    fs.writeFile(htmlFileNameAppended, globalDocument.documentElement.outerHTML, () => {
        console.log("Complete");
    });
};

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
            console.log("Check:", "Exists");
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
    console.log("Check", "Does not exist");
};
