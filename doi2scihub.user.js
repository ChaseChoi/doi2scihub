// ==UserScript==
// @name                DOI to Sci-Hub
// @name:zh-CN          DOI跳转Sci-Hub
// @namespace           https://greasyfork.org/users/692574
// @version             1.0.0
// @description         Highlight DOI link on the current webpage and redirect it to Sci-Hub.
// @description:zh-CN   高亮当前页面的DOI链接，并重定向至Sci-Hub。
// @author              Chase Choi
// @license             MIT
// @match               https://www.sciencedirect.com/*
// @match               https://onlinelibrary.wiley.com/doi/*
// @match               https://academic.oup.com/*
// @match               https://journals.sagepub.com/*
// @match               https://link.springer.com/*
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
            sciHubBaseURL = $('a[href^="https://sci-hub"]', data).first().attr('href') ?? defaultBaseURL
            redirectTo(sciHubBaseURL)
        }
    });
})();

function redirectTo(sciHubBaseURL) {
    let elements = $('a[href^="https://doi.org/"]');

    elements.each(function () {
        let doiURL = $(this).attr('href');
        $(this).attr('href', `${sciHubBaseURL}${doiURL}`);
        $(this).css('background-color', '#FFFF00');
    });
}