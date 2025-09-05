import re, os, pathlib

CONSENT_HEAD = """
  <!-- Consent Mode v2 + Google Analytics (GA4) -->
  <script>
    (function() {
      const saved = localStorage.getItem('gt_consent');
      const granted = saved === 'granted';
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('consent', 'default', {
        'ad_storage': granted ? 'granted' : 'denied',
        'analytics_storage': granted ? 'granted' : 'denied',
        'ad_user_data': granted ? 'granted' : 'denied',
        'ad_personalization': granted ? 'granted' : 'denied',
        'functionality_storage': granted ? 'granted' : 'denied',
        'security_storage': 'granted'
      });
      window._gtSetConsent = function(grant){
        localStorage.setItem('gt_consent', grant ? 'granted' : 'denied');
        gtag('consent', 'update', {
          'ad_storage': grant ? 'granted' : 'denied',
          'analytics_storage': grant ? 'granted' : 'denied',
          'ad_user_data': grant ? 'granted' : 'denied',
          'ad_personalization': grant ? 'granted' : 'denied',
          'functionality_storage': grant ? 'granted' : 'denied',
          'security_storage': 'granted'
        });
        const b = document.getElementById('cookie-banner');
        if (b) b.style.display = 'none';
      };
    })();
  </script>

  <script async src="https://www.googletagmanager.com/gtag/js?id=G-FXL2FL3M2M"></script>
  <script>
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-FXL2FL3M2M');
  </script>
"""

BANNER = """
  <!-- Cookie Banner -->
  <style>
    #cookie-banner{position:fixed;bottom:20px;left:20px;right:20px;background:#111827;color:#fff;padding:16px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.3);display:none;z-index:9999;max-width:800px;margin:auto;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
    #cookie-banner .actions{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
    #cookie-banner button{border:0;padding:10px 14px;border-radius:10px;cursor:pointer;font-weight:600}
    #cookie-accept{background:#10b981;color:#031B14}
    #cookie-reject{background:#374151;color:#fff}
    #cookie-text a{color:#93c5fd;text-decoration:underline}
  </style>
  <div id="cookie-banner" role="dialog" aria-live="polite" aria-label="Cookie-Einwilligung">
    <div id="cookie-text">We use cookies for analytics and ads according to our <a href="/privacy.html">Privacy Policy</a>.</div>
    <div class="actions"><button id="cookie-accept">Accept all</button><button id="cookie-reject">Essential only</button></div>
  </div>
  <script>
    (function(){
      const saved=localStorage.getItem('gt_consent');
      if(!saved){const b=document.getElementById('cookie-banner');if(b)b.style.display='block'}
      const acc=document.getElementById('cookie-accept');const rej=document.getElementById('cookie-reject');
      if(acc)acc.onclick=()=>window._gtSetConsent(true);
      if(rej)rej.onclick=()=>window._gtSetConsent(false);
    })();
  </script>
"""

def localize(html, path):
    if 'lang="de"' in html or '/de/' in path:
        return BANNER.replace("We use cookies for analytics and ads according to our <a href=\"/privacy.html\">Privacy Policy</a>.",
                              "Wir verwenden Cookies für Analyse und Werbung gemäß unserer <a href=\"/privacy.html\">Datenschutzerklärung</a>.")\
                     .replace("Accept all","Alle akzeptieren").replace("Essential only","Nur notwendige")
    if 'lang="it"' in html or '/it/' in path:
        return BANNER.replace("We use cookies for analytics and ads according to our <a href=\"/privacy.html\">Privacy Policy</a>.",
                              "Utilizziamo cookie per analisi e pubblicità secondo la nostra <a href=\"/privacy.html\">Informativa sulla privacy</a>.")\
                     .replace("Accept all","Accetta tutto").replace("Essential only","Solo essenziali")
    return BANNER

changed = 0
for root, _, files in os.walk("."):
    for f in files:
        if f.lower().endswith(".html"):
            p = os.path.join(root, f)
            html = pathlib.Path(p).read_text(encoding="utf-8", errors="ignore")
            orig = html
            if "googletagmanager.com/gtag/js?id=G-FXL2FL3M2M" not in html and "</head>" in html:
                html = re.sub(r"</head>", CONSENT_HEAD + "\n</head>", html, count=1, flags=re.IGNORECASE)
            if 'id="cookie-banner"' not in html and re.search(r"<body[^>]*>", html, re.IGNORECASE):
                html = re.sub(r"(<body[^>]*>)", r"\\1\n" + localize(html, p), html, count=1, flags=re.IGNORECASE)
            if html != orig:
                pathlib.Path(p+".bak").write_text(orig, encoding="utf-8")
                pathlib.Path(p).write_text(html, encoding="utf-8")
                changed += 1
                print("Updated:", p)

print("Done. Files changed:", changed)
