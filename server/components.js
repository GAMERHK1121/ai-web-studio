export const COMPONENT_TYPES = ['navbar','hero','section','card-grid','card','cta','footer'];

export function componentContract() {
  return COMPONENT_TYPES.map(type => ({
    type,
    props: type === 'navbar' ? ['brand','links','cta'] : type === 'hero' ? ['eyebrow','title','description','primaryAction','secondaryAction'] : type === 'card' ? ['eyebrow','title','description'] : type === 'footer' ? ['text'] : ['title','description']
  }));
}

export function annotateComponents(html='') {
  let out = html;
  const rules = [
    [/\<header\b(?![^>]*data-component)/i, '<header data-component="navbar"'],
    [/\<section class="hero"(?![^>]*data-component)/i, '<section class="hero" data-component="hero"'],
    [/\<section class="features"(?![^>]*data-component)/i, '<section class="features" data-component="card-grid"'],
    [/\<article\b(?![^>]*data-component)/gi, '<article data-component="card"'],
    [/\<footer\b(?![^>]*data-component)/i, '<footer data-component="footer"']
  ];
  for (const [re,repl] of rules) out = out.replace(re,repl);
  return out;
}

export function extractComponents(html='') {
  const items=[];
  const re=/<([a-z0-9-]+)([^>]*data-component=["']([^"']+)["'][^>]*)>/gi;
  let m, index=0;
  while((m=re.exec(html))){
    const type=m[3];
    if(!COMPONENT_TYPES.includes(type)) continue;
    const id=`${type}-${index++}`;
    const start=m.index;
    const close=`</${m[1]}>`;
    const end=html.indexOf(close,re.lastIndex);
    items.push({id,type,tag:m[1],index:start,selector:`[data-component="${type}"]`,preview: end>=0 ? html.slice(start,Math.min(end+close.length,start+800)) : html.slice(start,start+800)});
  }
  return items;
}
