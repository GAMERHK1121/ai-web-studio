export function auditFiles(files = {}) {
  const html = files['index.html'] || '';
  const css = files['style.css'] || '';
  const js = files['app.js'] || '';
  const checks = [];
  const add = (id, label, category, pass, detail, weight=1) => checks.push({id,label,category,pass,detail,weight});
  add('doctype','DOCTYPE','Technical',/^\s*<!doctype html>/i.test(html),'HTML5 doctype is present.',2);
  add('viewport','Viewport meta','SEO',/name=["']viewport["']/i.test(html),'Responsive viewport metadata.',2);
  add('title','Unique title','SEO',/<title>[^<]{5,}/i.test(html),'A meaningful title tag exists.',2);
  add('description','Meta description','SEO',/name=["']description["']/i.test(html),'Meta description is present.',2);
  add('canonical','Canonical URL','SEO',/rel=["']canonical["']/i.test(html),'Canonical link is present.',1);
  add('og','Open Graph','SEO',/property=["']og:title["']/i.test(html),'Open Graph title is present.',1);
  add('schema','Structured data','GEO',/application\/ld\+json/i.test(html),'JSON-LD structured data is present.',2);
  add('semantic','Semantic headings','AEO',/<h1[\s>]/i.test(html) && /<h2[\s>]/i.test(html),'H1/H2 hierarchy supports answer extraction.',2);
  add('answer','Answer-ready content','AEO',/answer|سوال|پاسخ|چه کاری|چگونه/i.test(html),'Contains a direct-answer style content block.',2);
  add('lang','Language metadata','GEO',/<html[^>]+lang=["'][^"']+["']/i.test(html),'Document language is declared.',1);
  add('rtl','Direction metadata','GEO',/<html[^>]+dir=["']rtl["']/i.test(html),'RTL direction is declared.',1);
  add('responsive','Responsive CSS','Performance',/@media/i.test(css),'Responsive breakpoint rules exist.',2);
  add('motion','Motion system','UX',/@keyframes|transition:|animation:/i.test(css),'CSS motion/transition rules exist.',1);
  add('js','JavaScript boot','Technical',js.trim().length>10,'Client-side JavaScript is present.',1);
  add('a11y','Accessible labels','Accessibility',/aria-|alt=["']/i.test(html),'At least one accessibility attribute is present.',1);
  add('robots','Robots file','SEO',Boolean(files['robots.txt']),'robots.txt is generated.',1);
  add('sitemap','Sitemap','SEO',Boolean(files['sitemap.xml']),'sitemap.xml is generated.',1);
  const earned=checks.reduce((n,c)=>n+(c.pass?c.weight:0),0), total=checks.reduce((n,c)=>n+c.weight,0);
  return {score:Math.round(earned/total*100),checks,summary:{passed:checks.filter(c=>c.pass).length,total:checks.length}};
}
