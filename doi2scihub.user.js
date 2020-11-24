// ==UserScript==
// @name                DOI to Sci-Hub
// @name:zh-CN          DOI跳转Sci-Hub
// @namespace           https://greasyfork.org/users/692574
// @version             1.0.4
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
// @require             https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @grant               GM.xmlHttpRequest
// ==/UserScript==

(function () {
    'use strict';

    const defaultBaseURL = "https://sci-hub.se";
    let sciHubBaseURL;

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
    let elements = $('a[href^="https://doi.org/"]');
    elements.each(function () {
        let doiURL = $(this).attr('href');
        $(this).attr('href', `${sciHubBaseURL}${doiURL}`);
        $(this).css('background-color', '#FFFF00');
    });

    // Plain text
    let doiRegex = new RegExp('(10\.\\d{4,}/[-._;()/:\\w]+)');
    covertPlainTextDOI('.doi:contains("DOI: 10.")', doiRegex, sciHubBaseURL);
    covertPlainTextDOI('.FR_field:contains("DOI:\n10.")', doiRegex, sciHubBaseURL);
}

function covertPlainTextDOI(doiTextLineSelector, regexString, sciHubBaseURL) {
    if ($(doiTextLineSelector).length) {
        let modified = $(doiTextLineSelector).html().replace(regexString, `<a href="${sciHubBaseURL}` + '$1" target="_blank" id="sci-hub-link">$1</a>');
        $(doiTextLineSelector).html(modified);
        $('#sci-hub-link').css('background-color', '#FFFF00');
    }
}