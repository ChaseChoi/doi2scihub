// ==UserScript==
// @name                DOI to Sci-Hub
// @name:zh-CN          DOI跳转Sci-Hub
// @namespace           https://greasyfork.org/users/692574
// @version             1.0.6
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
// @match               https://pubs.acs.org/doi/abs/*
// @match               http*://*.webofknowledge.com/*
// @match               https://www.thieme-connect.com/products/ejournals/*
// @match               https://pubsonline.informs.org/doi/abs/*
// @match               https://xueshu.baidu.com/usercenter/paper/*
// @match               https://academic.microsoft.com/*
// @match               https://www.nature.com/*
// @require             https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @grant               GM.xmlHttpRequest
// ==/UserScript==
const defaultBaseURL = "https://sci-hub.se";
let sciHubBaseURL;

(function () {
    'use strict';

    GM.xmlHttpRequest({
        method: "GET",
        url: "https://sci-hub.now.sh/",
        onload: function (response) {
            let data = response.responseText;
            sciHubBaseURL = $('li > a[href^="https://sci-hub"]', data).first().attr('href') ?? defaultBaseURL
            sciHubBaseURL += sciHubBaseURL.endsWith("/") ? "" : "/"
            redirectTo(sciHubBaseURL)
        }
    });
})();

function redirectTo(sciHubBaseURL) {

    // hyperlink
    let observer = new MutationObserver(callback);
    const config = { childList: true, subtree: true };
    observer.observe(document, config);

    // Plain text
    let doiRegex = new RegExp('(10\.\\d{4,}/[-._;()/:\\w]+)');
    
    // Thieme Connect
    covertPlainTextDOI('.doi:contains("DOI: 10.")', doiRegex, sciHubBaseURL);

    // Web of Science
    covertPlainTextDOI('.FR_field:contains("DOI:\n10.")', doiRegex, sciHubBaseURL);

    // Baidu Scholar
    covertPlainTextDOI('.doi_wr > .kw_main', doiRegex, sciHubBaseURL);
}

const callback = function(mutationsList, observer) {
    let elements = $('a[href^="https://doi.org/"]');
    if (elements.length) {
        elements.each(function () {
            let doiURL = $(this).attr('href');
            $(this).attr('href', `${sciHubBaseURL}${doiURL}`);
            $(this).css('background-color', '#FFFF00');
        });
    }
};

function covertPlainTextDOI(doiTextLineSelector, regexString, sciHubBaseURL) {
    if ($(doiTextLineSelector).length) {
        let modified = $(doiTextLineSelector).html().replace(regexString, `<a href="${sciHubBaseURL}` + '$1" target="_blank" id="sci-hub-link">$1</a>');
        $(doiTextLineSelector).html(modified);
        $('#sci-hub-link').css('background-color', '#FFFF00');
    }
}
