/* Hides the "Powered by Netlify" badge on the deployed site.
 *
 * Netlify turned the badge on by default for new Free-plan projects on
 * 2026-08-19. It is injected at the edge, after our HTML leaves the repo, and
 * rendered in an isolated frame so no stylesheet of ours can reach inside it.
 * The frame's host element still sits in our document, though, so we drop the
 * host and the frame goes with it.
 *
 * This is a stopgap. The real switch is in the Netlify UI:
 *   Project configuration > General > Powered by Netlify badge
 * Turning it off there is permitted on the Free plan, removes the badge for
 * every visitor with no flash, and makes this file unnecessary — delete it and
 * its three <script> tags once that's done.
 */
(function () {
    'use strict';

    var NETLIFY = /netlify/i;

    /* Nothing in this project references Netlify by name outside netlify.toml,
       so matching the word is safe here — but never hand back something that
       wraps real page content. */
    function isBadge(el) {
        if (!el || el.nodeType !== 1) { return false; }
        if (el === document.documentElement || el === document.body) { return false; }
        if (el.querySelector && el.querySelector('main, header, footer, .maindivblock')) { return false; }

        if (el.tagName === 'IFRAME') { return NETLIFY.test(el.getAttribute('src') || ''); }
        if (NETLIFY.test(el.tagName)) { return true; }
        if (NETLIFY.test(el.id || '')) { return true; }

        /* className is an SVGAnimatedString on SVG elements, not a string. */
        return NETLIFY.test(typeof el.className === 'string' ? el.className : '');
    }

    function drop(el) {
        if (isBadge(el) && el.parentNode) { el.parentNode.removeChild(el); }
    }

    function sweep() {
        var nodes = document.querySelectorAll('body > *, iframe');
        for (var i = 0; i < nodes.length; i++) { drop(nodes[i]); }
    }

    /* The badge can land before or after this file runs, and Netlify may
       re-inject it, so watch rather than sweeping once. */
    if (window.MutationObserver) {
        new MutationObserver(function (records) {
            for (var i = 0; i < records.length; i++) {
                var added = records[i].addedNodes;
                for (var j = 0; j < added.length; j++) { drop(added[j]); }
            }
        }).observe(document.documentElement, { childList: true, subtree: true });
    }

    sweep();
    document.addEventListener('DOMContentLoaded', sweep);
    window.addEventListener('load', sweep);
})();
