const APK_LINK = 'https://github.com';
const VIRAL_STAMP = `\n\n🛡️ *Verified Offline by BolMizan Sovereign OS (Sakrand, Sindh)*\n📲 Free Offline Khata, Parchi & Scam Shield App:\n${APK_LINK}`;

export function installViralGrowthInterceptor(): void {
  const w = window as unknown as { __BOLMIZAN_VIRAL_INSTALLED__?: boolean };
  if (w.__BOLMIZAN_VIRAL_INSTALLED__) return;
  w.__BOLMIZAN_VIRAL_INSTALLED__ = true;

  // 1. Auto-append viral verification footer to every WhatsApp (wa.me) link opened by the app
  const origOpen = window.open.bind(window);
  window.open = (url?: string | URL, target?: string, features?: string): Window | null => {
    if (url) {
      let urlStr = url.toString();
      if (urlStr.includes('wa.me') && urlStr.includes('text=') && !urlStr.includes('mahtabjk123-afk')) {
        urlStr += encodeURIComponent(VIRAL_STAMP);
      }
      return origOpen(urlStr, target, features);
    }
    return origOpen(url, target, features);
  };

  // 2. Auto-append viral stamp to native Android Share API calls
  if (navigator.share) {
    const origShare = navigator.share.bind(navigator);
    navigator.share = async (data?: ShareData): Promise<void> => {
      if (data && data.text && !data.text.includes('mahtabjk123-afk')) {
        data = { ...data, text: data.text + VIRAL_STAMP };
      }
      return origShare(data);
    };
  }
}