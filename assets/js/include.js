/* ==========================================================================
   IKSEZ — HTML partial loader
   --------------------------------------------------------------------------
   Usage:  <div data-include="components/header.html"></div>
   The placeholder element is REPLACED by the partial's markup.

   Nested includes are supported (a partial may itself contain data-include).
   When every include is resolved, `components:loaded` fires on document.

   Requires the site to be served over http(s) — any normal static host works
   (Apache, Nginx, IIS, cPanel, S3, GitHub Pages...). It will NOT work by
   double-clicking the file from disk (file://) because fetch() is blocked
   there by the browser. Run `npx serve` or any local server to preview.
   ========================================================================== */
(function () {
  'use strict';

  var cache = new Map();

  function fetchPartial(url) {
    if (!cache.has(url)) {
      cache.set(url, fetch(url, { cache: 'no-cache' }).then(function (res) {
        if (!res.ok) throw new Error(url + ' → HTTP ' + res.status);
        return res.text();
      }));
    }
    return cache.get(url);
  }

  function resolve(root) {
    var nodes = Array.prototype.slice.call(root.querySelectorAll('[data-include]'));
    if (!nodes.length) return Promise.resolve();

    return Promise.all(nodes.map(function (node) {
      var url = node.getAttribute('data-include');

      return fetchPartial(url)
        .then(function (html) {
          var tpl = document.createElement('template');
          tpl.innerHTML = html.trim();
          var frag = tpl.content;

          // Pass data-* props from the placeholder into the partial via
          // {{token}} substitution in both text and attributes, e.g.
          // <div data-include="components/page-hero.html" data-title="About us">
          var props = node.dataset;
          if (Object.keys(props).length > 1) {
            var fill = function (str) {
              return str.replace(/\{\{(\w+)\}\}/g, function (m, key) {
                return key in props ? props[key] : '';
              });
            };

            var walker = document.createTreeWalker(frag, NodeFilter.SHOW_TEXT);
            var textNodes = [];
            while (walker.nextNode()) textNodes.push(walker.currentNode);
            textNodes.forEach(function (t) {
              if (t.nodeValue.indexOf('{{') > -1) t.nodeValue = fill(t.nodeValue);
            });

            frag.querySelectorAll('*').forEach(function (el) {
              Array.prototype.slice.call(el.attributes).forEach(function (attr) {
                if (attr.value.indexOf('{{') > -1) el.setAttribute(attr.name, fill(attr.value));
              });
            });

            // strip elements marked optional that ended up empty
            frag.querySelectorAll('[data-if]').forEach(function (el) {
              if (!props[el.dataset.if]) el.remove();
            });
          }

          node.replaceWith(frag);
        })
        .catch(function (err) {
          console.error('[include] ' + err.message);
          node.innerHTML =
            '<div style="padding:1rem;border:1px dashed #c00;color:#c00;font:14px/1.5 sans-serif">' +
            'Could not load <code>' + url + '</code>. Serve the site over http:// rather than opening the file directly.' +
            '</div>';
        });
    })).then(function () {
      // handle includes that arrived inside the partials we just injected
      return resolve(root);
    });
  }

  function boot() {
    resolve(document).then(function () {
      document.dispatchEvent(new CustomEvent('components:loaded'));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
