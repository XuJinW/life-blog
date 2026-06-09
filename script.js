// 公用函数：获取 URL 参数
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// 加载文章列表到 index.html
async function loadPostList() {
    const container = document.getElementById('postsList');
    if (!container) return;
    try {
        const res = await fetch('posts.json');
        const posts = await res.json();
        if (!posts.length) {
            container.innerHTML = '<p>暂无文章，先去写几篇吧~</p>';
            return;
        }
        // 按日期倒序
        posts.sort((a,b) => new Date(b.date) - new Date(a.date));
        let html = '';
        for (let post of posts) {
            html += `
                <article class="post-card">
                    <h2><a href="post.html?id=${post.id}">${escapeHtml(post.title)}</a></h2>
                    <span class="post-date">${formatDate(post.date)}</span>
                    <div class="post-summary">${escapeHtml(post.summary)}</div>
                    <a href="post.html?id=${post.id}" class="read-more">阅读全文 →</a>
                </article>
            `;
        }
        container.innerHTML = html;
        // 绑定搜索功能
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const cards = document.querySelectorAll('.post-card');
                cards.forEach(card => {
                    const title = card.querySelector('h2')?.innerText.toLowerCase() || '';
                    const summary = card.querySelector('.post-summary')?.innerText.toLowerCase() || '';
                    if (title.includes(term) || summary.includes(term)) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        }
    } catch (err) {
        container.innerHTML = '<p>加载文章失败，请检查网络或刷新。</p>';
        console.error(err);
    }
}

// 加载单篇文章详情到 post.html
async function loadPostDetail() {
    const container = document.getElementById('postDetail');
    if (!container) return;
    const id = getQueryParam('id');
    if (!id) {
        container.innerHTML = '<p>没有指定文章 ID。</p>';
        return;
    }
    try {
        const res = await fetch('posts.json');
        const posts = await res.json();
        const post = posts.find(p => p.id == id);
        if (!post) {
            container.innerHTML = '<p>文章不存在。</p>';
            return;
        }
        document.title = `${post.title} | 生活拾贝`;
        // 渲染文章内容（包括标题、日期、正文）
container.innerHTML = `
    <h1>${escapeHtml(post.title)}</h1>
    <div class="post-meta">📅 ${formatDate(post.date)}</div>
    <div class="post-content">${post.content}</div>
    <div class="post-footer">
        <button id="likeBtn" class="like-btn">
            ❤️ <span id="likeCount">0</span> 个赞
        </button>
    </div>
`;


    } catch (err) {
        container.innerHTML = '<p>加载文章失败。</p>';
        console.error(err);
    }
}
// 在 loadPostDetail 函数末尾添加
loadGiscusComments();
// 辅助函数
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth()+1}月${date.getDate()}日`;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// 根据当前页面执行不同的加载函数
if (window.location.pathname.includes('post.html')) {
    loadPostDetail();
} else {
    loadPostList();
}
function loadGiscusComments() {
    const container = document.getElementById('giscus-container');
    if (!container) return;
    // 避免重复加载
    if (container.hasChildNodes()) return;
    
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'XuJinW/life-blog');      // 替换成你的仓库
    script.setAttribute('data-repo-id', 'R_kgDOS1T9Ng');        // 从 giscus.app 获取
    script.setAttribute('data-category', 'Announcements');
    script.setAttribute('data-category-id', 'DIC_kwDOS1T9Ns4C-0i7'); // 从 giscus.app 获取
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'preferred_color_scheme');
    script.setAttribute('data-lang', 'zh-CN');
    script.crossOrigin = 'anonymous';
    script.async = true;
    container.appendChild(script);
}