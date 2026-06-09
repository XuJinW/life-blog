// ==================== 加载首页配置 ====================
async function loadHomeConfig() {
    try {
        const res = await fetch('config.json');
        if (!res.ok) throw new Error('config.json 不存在，使用默认配置');
        const config = await res.json();
        applyConfig(config);
    } catch (err) {
        console.warn('使用默认配置', err);
        applyDefaultConfig();
    }
}

function applyConfig(config) {
    const bgContainer = document.getElementById('bgContainer');
    const heroContainer = document.getElementById('heroText');

    // 1. 背景
    if (config.background.type === 'image') {
        bgContainer.style.backgroundImage = `url(${config.background.value})`;
        bgContainer.style.backgroundColor = 'transparent';
    } else {
        bgContainer.style.backgroundColor = config.background.value || '#fef9f0';
        bgContainer.style.backgroundImage = 'none';
    }

    // 2. 文案
    if (heroContainer) {
        const text = config.hero.text || '记录生活，漫笔时光';
        heroContainer.innerHTML = `<h2>${escapeHtml(text).replace(/\n/g, '<br>')}</h2>`;
        // 设置垂直位置
        const pos = config.hero.position || 'center';
        heroContainer.style.position = 'relative';
        if (pos === 'top') {
            heroContainer.style.marginTop = '5vh';
            heroContainer.style.marginBottom = '2rem';
        } else if (pos === 'center') {
            heroContainer.style.marginTop = '20vh';
            heroContainer.style.marginBottom = '2rem';
        } else if (pos === 'bottom') {
            heroContainer.style.marginTop = '40vh';
            heroContainer.style.marginBottom = '5rem';
        } else if (pos.includes('%') || pos.includes('px')) {
            // 自定义像素或百分比
            heroContainer.style.marginTop = pos;
        } else {
            heroContainer.style.marginTop = '10vh';
        }
    }
}

function applyDefaultConfig() {
    const bgContainer = document.getElementById('bgContainer');
    bgContainer.style.backgroundColor = '#fef9f0';
    const heroContainer = document.getElementById('heroText');
    if (heroContainer) {
        heroContainer.innerHTML = '<h2>记录生活，漫笔时光</h2>';
        heroContainer.style.marginTop = '15vh';
    }
}

// ==================== 原有函数（保持不变） ====================
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

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
        // 搜索功能
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
        container.innerHTML = `
            <h1>${escapeHtml(post.title)}</h1>
            <div class="post-meta">📅 ${formatDate(post.date)}</div>
            <div class="post-content">${post.content}</div>
        `;
    } catch (err) {
        container.innerHTML = '<p>加载文章失败。</p>';
        console.error(err);
    }
}

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

// ==================== 页面启动 ====================
if (window.location.pathname.includes('post.html')) {
    loadPostDetail();
} else {
    loadHomeConfig();  // 先加载背景和文案配置
    loadPostList();    // 再加载文章列表
}