const fallbackHeader = `
<div class="brand">ムク</div>
<div class="nav-links">
    <a href="index.html">トップ</a>
    <a href="guide.html">遊び方</a>
    <a href="updates.html">更新ルール</a>
    <a href="faq.html">FAQ</a>
</div>
`;

const fallbackFooter = `
<div>ムク | 定期更新RPG</div>
<div class="footer-links">
    <a href="index.html">トップ</a>
    <a href="guide.html">遊び方</a>
</div>
`;

async function injectPartial(targetId, path, fallbackHtml) {
    const target = document.getElementById(targetId);
    if (!target) {
        return;
    }
    try {
        const res = await fetch(path, { cache: 'no-cache' });
        if (!res.ok) {
            target.innerHTML = fallbackHtml;
            return;
        }
        target.innerHTML = await res.text();
    } catch (error) {
        // ローカルファイルでの閲覧時はfetchが失敗するためフォールバックを使う
        target.innerHTML = fallbackHtml;
    }
}

injectPartial('site-header', 'partials/header.html', fallbackHeader);
injectPartial('site-footer', 'partials/footer.html', fallbackFooter);
