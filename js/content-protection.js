(function () {
  'use strict';

  const WATERMARK_TEXT = "CJ's Tech Notes · cj0510.github.io";

  function closestElement(node) {
    if (!node) return null;
    return node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  }

  function isCodeSelection(selection) {
    const start = closestElement(selection.anchorNode);
    const end = closestElement(selection.focusNode);
    return Boolean(
      (start && start.closest('pre, code, .highlight')) ||
      (end && end.closest('pre, code, .highlight'))
    );
  }

  function appendAttribution(event) {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || isCodeSelection(selection)) return;

    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    const title = document.querySelector('article h1, #board h1, .post-title')?.textContent.trim()
      || document.title.replace(/\s*[·-]\s*CJ's Tech Notes\s*$/, '')
      || document.title;
    const attribution = `\n\n—— 本文节选自《${title}》\n作者：CJ1018\n原文：${window.location.href}`;

    event.preventDefault();
    event.clipboardData.setData('text/plain', selectedText + attribution);

    if (selection.rangeCount) {
      const container = document.createElement('div');
      container.appendChild(selection.getRangeAt(0).cloneContents());
      const escapedTitle = title.replace(/[&<>"']/g, function (char) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
      });
      const safeUrl = window.location.href.replace(/[&<>"']/g, function (char) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
      });
      container.insertAdjacentHTML(
        'beforeend',
        `<p>—— 本文节选自《${escapedTitle}》<br>作者：CJ1018<br>原文：<a href="${safeUrl}">${safeUrl}</a></p>`
      );
      event.clipboardData.setData('text/html', container.innerHTML);
    }
  }

  function protectArticleImages() {
    document.querySelectorAll('.markdown-body img').forEach(function (img) {
      img.draggable = false;
      img.addEventListener('dragstart', function (event) { event.preventDefault(); });

      if (img.closest('.cj-watermarked-image')) return;

      const wrapper = document.createElement('span');
      wrapper.className = 'cj-watermarked-image';
      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(img);

      const watermark = document.createElement('span');
      watermark.className = 'cj-image-watermark';
      watermark.setAttribute('aria-hidden', 'true');
      watermark.textContent = WATERMARK_TEXT;
      wrapper.appendChild(watermark);
    });
  }

  document.addEventListener('copy', appendAttribution);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', protectArticleImages);
  } else {
    protectArticleImages();
  }
})();
