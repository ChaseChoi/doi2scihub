// ==UserScript==
// @name                DOI to Sci-Hub
// @name:zh-CN          DOI跳转Sci-Hub
// @namespace           https://greasyfork.org/users/692574
// @version             1.0.15
// @description         Highlight DOI link on the current webpage and redirect it to Sci-Hub.
// @description:zh-CN   高亮当前页面的DOI链接，并重定向至Sci-Hub。
// @author              Chase Choi
// @license             MIT
// @match               https://www.sciencedirect.com/*
// @match               https://onlinelibrary.wiley.com/doi/*
// @match               https://academic.oup.com/*
// @match               https://journals.sagepub.com/*
// @match               https://link.springer.com/*
// @match               https://ieeexplore.ieee.org/*
// @match               https://www.ingentaconnect.com/*
// @match               https://pubs.acs.org/doi/*
// @match               http*://*.webofknowledge.com/*
// @match               https://www.webofscience.com/wos/*
// @match               https://www.thieme-connect.com/products/ejournals/*
// @match               https://pubsonline.informs.org/doi/abs/*
// @match               https://xueshu.baidu.com/usercenter/paper/*
// @match               https://academic.microsoft.com/*
// @match               https://www.nature.com/*
// @match               https://*.sciencemag.org/*
// @match               https://pubs.rsc.org/*
// @match               https://schlr.cnki.net/Detail/index/*
// @match               https://schlr.cnki.net//Detail/index/*
// @match               https://www.tandfonline.com/*
// @match               https://www.jstor.org/*
// @require             https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @grant               GM.xmlHttpRequest
// ==/UserScript==

// global variables
const defaultBaseURL = "https://sci-hub.se";
let sciHubBaseURL;
const doiRegex = new RegExp('(10\.\\d{4,}/[-._;()/:\\w]+)');

(function () {
    'use strict';

    GM.xmlHttpRequest({
        method: "GET",
        url: "https://sci-hub.now.sh/",
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
}

const callback = function(mutationsList, observer) {
    
    // Web of Science New Interface
    if (!$('#sci-hub-link').length) {
        convertPlainTextDOI('span#FullRTa-DOI');
    }

    let elements = $('a[href^="https://doi.org/"]');
    if (elements.length) {
        elements.each(function () {
            let doiURL = $(this).attr('href');
            $(this).attr('href', `${sciHubBaseURL}${doiURL}`);
            $(this).css('background-color', '#FFFF00');
        });
    }
};

function convertPlainTextDOI(doiTextLineSelector) {
    if ($(doiTextLineSelector).length) {
        let modified = $(doiTextLineSelector).html().replace(doiRegex, `<a href="${sciHubBaseURL}` + '$1" target="_blank" id="sci-hub-link">$1</a>');
        $(doiTextLineSelector).html(modified);
        $('#sci-hub-link').css('background-color', '#FFFF00');
    }
}
