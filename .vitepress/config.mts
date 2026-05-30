import { defineConfig } from 'vitepress'

export default defineConfig({
  srcDir: 'src',
  base: '/',
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: true,

  themeConfig: {
    search: { provider: 'local' },

    siteTitle: 'Jonathan',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'About', link: '/about' },
      { text: 'Projects', link: '/projects/' },
      { text: 'Blog', link: '/posts/' },
      { text: 'Honors', link: '/honors/' },
      { text: 'Papers', link: '/papers/' }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/JonathanWu517' }
    ],

    outline: { level: [2, 3] },

    footer: {
      message: 'Built with VitePress & GitHub Pages',
      copyright: '© 2026 JonathanWu517'
    }
  },

  head: [
    ['meta', { name: 'theme-color', content: '#f5f6fa' }],
    ['meta', { property: 'og:title', content: 'JonathanWu517' }],
    ['meta', { property: 'og:description', content: 'Personal website, portfolio, and blog.' }],
    ['link', { rel: 'preload', href: '/school-bg.png', as: 'image' }],
    ['link', { rel: 'preload', href: '/school-badge.png', as: 'image' }],
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
        function init(){
          var d=document;
          if(d.getElementById('sakura-cvs')) return;
          var cvs=d.createElement('canvas');
          cvs.id='sakura-cvs';
          cvs.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9998';
          d.body.appendChild(cvs);
          var ctx=cvs.getContext('2d');
          var W=window.innerWidth,H=window.innerHeight;
          var dpr=Math.min(window.devicePixelRatio||1,2);
          cvs.width=W*dpr;cvs.height=H*dpr;cvs.style.width=W+'px';cvs.style.height=H+'px';
          ctx.setTransform(dpr,0,0,dpr,0,0);
          var COLORS=['#c0c8e0','#b0b8d8','#c8cfe8','#a8b4d4','#d0d5e8','#b8c0d8'];
          var MIN_P=15,MAX_P=25,petals=[];
          function r(a,b){return a+Math.random()*(b-a);}
          function mkP(yo){yo=yo||r(-H,0);return{x:r(0,W),y:yo,sz:r(8,20),sp:r(0.3,1.2),sw:r(20,60),sws:r(0.006,0.02),ph:r(0,Math.PI*2),rot:r(0,Math.PI*2),rs:r(-0.012,0.012),op:r(0.25,0.55),cl:COLORS[Math.floor(r(0,COLORS.length))],vx:0,vy:0,bst:false};}
          function draw(p){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.globalAlpha=p.op;ctx.fillStyle=p.cl;var s=p.sz;ctx.beginPath();ctx.moveTo(0,-s*0.5);ctx.bezierCurveTo(s*0.35,-s*0.15,s*0.35,s*0.15,0,s*0.5);ctx.bezierCurveTo(-s*0.35,s*0.15,-s*0.35,-s*0.15,0,-s*0.5);ctx.fill();ctx.restore();}
          function burst(x,y){var n=Math.floor(r(6,11));for(var i=0;i<n;i++){var a=r(0,Math.PI*2);var f=r(2,6);var p={x:x,y:y,sz:r(6,14),sp:r(0.2,0.8),sw:r(15,45),sws:r(0.01,0.03),ph:r(0,Math.PI*2),rot:r(0,Math.PI*2),rs:r(-0.04,0.04),op:r(0.4,0.75),cl:COLORS[Math.floor(r(0,COLORS.length))],vx:Math.cos(a)*f,vy:Math.sin(a)*f-2,bst:true};petals.push(p);if(petals.length>60)petals.shift();}}
          function resize(){W=window.innerWidth;H=window.innerHeight;cvs.width=W*dpr;cvs.height=H*dpr;cvs.style.width=W+'px';cvs.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0);}
          function anim(){ctx.clearRect(0,0,W,H);for(var i=petals.length-1;i>=0;i--){var p=petals[i];if(p.bst){p.x+=p.vx;p.y+=p.vy;p.vx*=0.95;p.vy*=0.95;p.vy+=0.05;if(Math.abs(p.vx)<0.1&&Math.abs(p.vy)<0.25){p.bst=false;p.sp=r(0.2,0.8);}}else{p.y+=p.sp;p.x+=Math.sin(p.ph)*p.sw*0.02;}p.ph+=p.sws;p.rot+=p.rs;draw(p);if(p.y>H+40)petals.splice(i,1);}while(petals.length<MIN_P)petals.push(mkP(-40));requestAnimationFrame(anim);}
          for(var i=0;i<MAX_P;i++)petals.push(mkP(r(-H,H)));
          anim();
          window.addEventListener('resize',resize);
          window.addEventListener('click',function(e){burst(e.clientX,e.clientY);});
        }
        if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
        else init();
      })();
    `],
    ['script', {}, `
      (function(){
        function setupModal(){
          var modal=d.createElement('div');
          modal.id='wechat-modal';
          modal.style.cssText='display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:9999;align-items:center;justify-content:center';
          modal.onclick=function(e){if(e.target===modal)modal.style.display='none'};
          modal.innerHTML='<div style="background:var(--vp-c-bg);border-radius:16px;padding:32px;text-align:center;max-width:320px;box-shadow:0 8px 32px rgba(0,0,0,0.3)"><img src="/wechat-qr.jpg" style="width:220px;border-radius:12px;display:block;margin:0 auto"><p style="margin:16px 0 0;font-size:16px;font-weight:600;color:var(--vp-c-text-1)">WeChat Official Account</p><p style="margin:4px 0 0;font-size:13px;color:var(--vp-c-text-2)">Scan to follow for tech sharing</p></div>';
          d.body.appendChild(modal);
          return modal;
        }
        var modal;
        if(d.body){ modal=setupModal(); }
        else{ d.addEventListener('DOMContentLoaded',function(){ modal=setupModal(); }); }

        function addIcons(el){
          if(el.querySelector('.nav-icon')) return;
          var wechat = d.createElement('a');
          wechat.className = 'VPSocialLink nav-icon';
          wechat.href = 'javascript:void(0)';
          wechat.title = 'WeChat Official Account';
          wechat.onclick = function(){ modal.style.display='flex'; return false; };
          wechat.innerHTML = '<div class="vp-social-link-icon" style="width:18px;height:18px"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/></svg></div>';
          el.appendChild(wechat);

          var orcid = d.createElement('a');
          orcid.className = 'VPSocialLink nav-icon';
          orcid.href = 'https://orcid.org/0009-0004-9958-5797';
          orcid.target = '_blank';
          orcid.rel = 'noopener';
          orcid.title = 'ORCID';
          orcid.innerHTML = '<div class="vp-social-link-icon" style="width:18px;height:18px"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" stroke-width="2"/><text x="12" y="16.5" text-anchor="middle" font-size="11" font-weight="bold" font-family="sans-serif" fill="currentColor">iD</text></svg></div>';
          el.appendChild(orcid);
        }

        var tries = 0;
        var t = setInterval(function(){
          var el = d.querySelector('.VPSocialLinks');
          if(el){ clearInterval(t); addIcons(el); return; }
          if(++tries > 60){ clearInterval(t); }
        }, 200);
      })();
    `]
  ],

  lang: 'en-US',
  title: 'Jonathan',
  description: 'Personal website, portfolio, and blog.'
})
