// ==UserScript==
// @name                DOI to Sci-Hub
// @name:zh-CN          DOI跳转Sci-Hub
// @namespace           https://greasyfork.org/users/692574
// @version             1.0.21
// @description         Highlight DOI link on the current webpage and redirect it to Sci-Hub.
// @description:zh-CN   高亮当前页面的DOI链接，并重定向至Sci-Hub。
// @author              Chase Choi
// @license             MIT
// @match               https://*.sciencemag.org/*
// @match               http*://*.webofknowledge.com/*
// @match               https://academic.oup.com/*
// @match               https://academic.microsoft.com/*
// @match               https://ieeexplore.ieee.org/*
// @match               https://journals.sagepub.com/*
// @match               https://link.springer.com/*
// @match               https://onlinelibrary.wiley.com/doi/*
// @match               https://pubmed.ncbi.nlm.nih.gov/*
// @match               https://pubs.rsc.org/*
// @match               https://pubs.acs.org/doi/*
// @match               https://pubsonline.informs.org/doi/abs/*
// @match               https://schlr.cnki.net/Detail/index/*
// @match               https://schlr.cnki.net//Detail/index/*
// @match               https://xueshu.baidu.com/usercenter/paper/*
// @match               https://www.ingentaconnect.com/*
// @match               https://www.jstor.org/*
// @match               https://www.nature.com/*
// @match               https://www.ncbi.nlm.nih.gov/*
// @match               https://www.sciencedirect.com/*
// @match               http://www.socolar.com/*
// @match               https://www.scinapse.io/*
// @match               https://www.science.org/*
// @match               https://www.tandfonline.com/*
// @match               https://www.thieme-connect.com/products/ejournals/*
// @match               https://www.webofscience.com/wos/*
// @require             https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @grant               GM.xmlHttpRequest
// ==/UserScript==

// global variables
const defaultBaseURL = "https://sci-hub.se";
let sciHubBaseURL;
const doiRegex = new RegExp('(10\.\\d{4,}/[-._;()/:\\w]+)');
const completePrefix = ['http://dx.doi.org/', 'https://doi.org/', 'https://dx.doi.org/'];
const partialPrefix = ['//dx.doi.org/'];

(function () {
    'use strict';

    GM.xmlHttpRequest({
        method: "GET",
        url: "https://sci-hub.41610.org/",
        onload: function (response) {
            let data = response.responseText;
            sciHubBaseURL = $('li > a[href^="https://sci-hub"]', data).first().attr('href') ?? defaultBaseURL
            sciHubBaseURL += sciHubBaseURL.endsWith("/") ? "" : "/"
            redirectToSciHub()
        }
    });
})();

function redirectToSciHub() {

    // hyperlink
    
    convertHrefDOI(completePrefix, true);
    convertHrefDOI(partialPrefix, false);

    let observer = new MutationObserver(callback);
    const config = { childList: true, subtree: true };
    observer.observe(document, config);

    // Plain text
    
    // Thieme Connect
    convertPlainTextDOI('.doi:contains("DOI: 10.")');

    // Science
    convertPlainTextDOI('.meta-line:contains("DOI: 10.")');

    // Web of Science
    convertPlainTextDOI('.FR_field:contains("DOI:")');

    // Baidu Scholar
    convertPlainTextDOI('.doi_wr > .kw_main');

    // CNKI Scholar
    convertPlainTextDOI('.doc-doi > a');

    // PubMed
    convertPlainTextDOI('span:contains("doi: 10")');
}

const callback = function(mutationsList, observer) {
    
    if (!$('#sci-hub-link').length) {
        // Web of Science New Interface
        convertPlainTextDOI('span#FullRTa-DOI');
        
        // scinapse
        convertPlainTextDOI('span[class*="doiInPaperShow_doiContext"]');
    }

    convertHrefDOI(completePrefix, true);
    convertHrefDOI(partialPrefix, false);
};

function convertPlainTextDOI(doiTextLineSelector) {
    if ($(doiTextLineSelector).length) {
        let modified = $(doiTextLineSelector).html().replace(doiRegex, `<a href="${sciHubBaseURL}` + '$1" target="_blank" id="sci-hub-link">$1</a>');
        $(doiTextLineSelector).html(modified);
        $('#sci-hub-link').css('background-color', '#FFFF00');
    }
}

function convertHrefDOI(prefixArray, isComplete) {
    prefixArray.forEach((prefix) => {
        let elements = $(`a[href^="${prefix}"]`);
        if (elements.length) {
            let doi = "";
            elements.each(function () {
                if (isComplete == false) {
                    doi = $(this).text();    
                } else {
                    doi = $(this).attr('href');
                }
                $(this).attr('href', `${sciHubBaseURL}${doi}`);
                $(this).css('background-color', '#FFFF00');
            });
        }
    })
}
