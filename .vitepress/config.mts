import { defineConfig } from 'vitepress'

export default defineConfig({
  srcDir: 'src',
  base: '/',
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: true,
  appearance: 'dark',

  themeConfig: {
    search: { provider: 'local' }
  },

  head: [
    ['meta', { name: 'theme-color', content: '#1a1b26' }],
    ['meta', { property: 'og:title', content: 'JonathanWu517' }],
    ['meta', { property: 'og:description', content: '个人主页、作品集与博客。' }],
    ['script', {}, `
      (function(){
        var key='__vp_scroll';
        var now=Date.now();
        var saved=sessionStorage.getItem(key);
        if(saved){ try{ var s=JSON.parse(saved); if(now-s.t<3e4){ window.scrollTo(0,s.y); } }catch(e){} sessionStorage.removeItem(key); }
        window.addEventListener('beforeunload',function(){ sessionStorage.setItem(key,JSON.stringify({y:window.scrollY,t:now})); });
      })();
    `],
    ['script', {}, `
      (function(){
        var d=document;
        var modal=d.createElement('div');
        modal.id='wechat-modal';
        modal.style.cssText='display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:9999;align-items:center;justify-content:center';
        modal.onclick=function(e){if(e.target===modal)modal.style.display='none'};
        modal.innerHTML='<div style="background:var(--vp-c-bg);border-radius:16px;padding:32px;text-align:center;max-width:320px;box-shadow:0 8px 32px rgba(0,0,0,0.3)"><img src="/wechat-qr.jpg" style="width:220px;border-radius:12px;display:block;margin:0 auto"><p style="margin:16px 0 0;font-size:16px;font-weight:600;color:var(--vp-c-text-1)">微信公众号</p><p style="margin:4px 0 0;font-size:13px;color:var(--vp-c-text-2)">扫码关注，获取更多技术分享</p></div>';
        d.body.appendChild(modal);

        function addAll(el){
          if(el.querySelector('.nav-icon')) return;
          // 微信图标
          var wechat = d.createElement('a');
          wechat.className = 'VPSocialLink nav-icon';
          wechat.href = 'javascript:void(0)';
          wechat.title = '微信公众号';
          wechat.onclick = function(){ modal.style.display='flex'; return false; };
          wechat.innerHTML = '<div class="vp-social-link-icon" style="width:18px;height:18px"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/></svg></div>';
          el.appendChild(wechat);

          // ORCID图标
          var orcid = d.createElement('a');
          orcid.className = 'VPSocialLink nav-icon';
          orcid.href = 'https://orcid.org/0009-0004-9958-5797';
          orcid.target = '_blank';
          orcid.rel = 'noopener';
          orcid.title = 'ORCID';
          orcid.innerHTML = '<div class="vp-social-link-icon" style="width:18px;height:18px"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" stroke-width="2"/><text x="12" y="16.5" text-anchor="middle" font-size="11" font-weight="bold" font-family="sans-serif" fill="currentColor">iD</text></svg></div>';
          el.appendChild(orcid);
        }
        var t = setInterval(function(){
          var el = d.querySelector('.VPSocialLinks');
          if(el){ clearInterval(t); addAll(el); }
        }, 100);
        setTimeout(function(){ clearInterval(t); }, 15000);
      })();
    `]
  ],

  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'Jonathan',
      description: '个人主页、作品集与博客。',

      themeConfig: {
        siteTitle: 'Jonathan',

        nav: [
          { text: '首页', link: '/' },
          { text: '关于', link: '/about' },
          { text: '项目', link: '/projects/' },
          { text: '博客', link: '/posts/' },
          { text: '荣誉', link: '/honors/' },
          { text: '论文', link: '/papers/' }
        ],

        socialLinks: [
          { icon: 'github', link: 'https://github.com/JonathanWu517' }
        ],

        outline: { level: [2, 3] },

        footer: {
          message: '使用 VitePress 和 GitHub Pages 构建',
          copyright: '© 2026 JonathanWu517'
        }
      }
    },

    en: {
      label: 'English',
      lang: 'en-US',
      dir: 'en',
      title: 'Jonathan',
      description: 'Personal website, portfolio, and blog.',

      themeConfig: {
        siteTitle: 'Jonathan',

        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'About', link: '/en/about' },
          { text: 'Projects', link: '/en/projects/' },
          { text: 'Blog', link: '/en/posts/' },
          { text: 'Honors', link: '/en/honors/' },
          { text: 'Papers', link: '/en/papers/' }
        ],

        socialLinks: [
          { icon: 'github', link: 'https://github.com/JonathanWu517' }
        ],

        outline: { level: [2, 3] },

        footer: {
          message: 'Built with VitePress & GitHub Pages',
          copyright: '© 2026 JonathanWu517'
        }
      }
    }
  }
})
