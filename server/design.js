import fs from 'fs/promises';
import path from 'path';

export function buildDesignSystem(prompt = '') {
  const p = prompt.toLowerCase();
  const luxury = /لوکس|luxury|premium|cinematic|حرفه/.test(p);
  const energetic = /ورزش|sport|gym|fitness|فروشگاه/.test(p);
  const soft = /کلینیک|روانشناسی|کودک|beauty|آرایش/.test(p);
  const colors = energetic
    ? { primary:'#7c5cff', secondary:'#00d4ff', accent:'#ff4d8d', surface:'#0b1020', text:'#f7f8ff' }
    : soft
      ? { primary:'#6c63ff', secondary:'#48c6ef', accent:'#f6a6c1', surface:'#0b0d18', text:'#f8f7ff' }
      : { primary:'#8197ff', secondary:'#65e8ff', accent:'#b88cff', surface:'#080a12', text:'#f1f4ff' };
  return {
    name: luxury ? 'Cinematic Premium' : 'Adaptive Premium',
    colors,
    typography:{ display:'clamp(3rem, 8vw, 7rem)', heading:'clamp(1.8rem, 4vw, 3.4rem)', body:'1rem', lineHeight:'1.8' },
    spacing:{ xs:'6px', sm:'10px', md:'16px', lg:'28px', xl:'56px', section:'clamp(72px,10vw,140px)' },
    radius:{ sm:'10px', md:'16px', lg:'28px', pill:'999px' },
    motion:{ durationFast:'220ms', duration:'650ms', durationSlow:'1100ms', easing:'cubic-bezier(.2,.8,.2,1)' },
    effects:{ glass:true, glow:true, reveal:true, magnetic:true, tilt: luxury, parallax: luxury }
  };
}

export function buildAssetManifest(spec, design) {
  const type = spec?.name || 'AI Web Studio Project';
  return {
    strategy:'local-first',
    assets:[
      { id:'brand-mark', type:'svg', path:'assets/brand-mark.svg', purpose:'brand / favicon placeholder' },
      { id:'hero-orb', type:'svg', path:'assets/hero-orb.svg', purpose:'hero visual', generated:true },
      { id:'noise', type:'svg', path:'assets/noise.svg', purpose:'subtle texture', generated:true }
    ],
    rules:{ altText:true, lazyLoading:true, widthHeight:true, decorativeAriaHidden:true, noRemoteAssets:true },
    project:type,
    palette:design.colors
  };
}

export async function writeLocalAssets(projectDir, design) {
  const dir = path.join(projectDir,'assets');
  await fs.mkdir(dir,{recursive:true});
  const c=design.colors;
  const files={
    'brand-mark.svg':`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="${c.primary}"/><stop offset="1" stop-color="${c.secondary}"/></linearGradient></defs><rect width="128" height="128" rx="32" fill="${c.surface}"/><path d="M35 83 57 31l36 22-24 44Z" fill="url(#g)"/><circle cx="86" cy="36" r="9" fill="${c.accent}"/></svg>`,
    'hero-orb.svg':`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700"><defs><radialGradient id="g"><stop stop-color="#fff"/><stop offset=".08" stop-color="${c.secondary}"/><stop offset=".42" stop-color="${c.primary}"/><stop offset="1" stop-color="${c.surface}" stop-opacity="0"/></radialGradient></defs><circle cx="350" cy="350" r="300" fill="url(#g)"/><g fill="none" stroke="${c.secondary}" stroke-opacity=".28"><ellipse cx="350" cy="350" rx="290" ry="100" transform="rotate(-25 350 350)"/><ellipse cx="350" cy="350" rx="290" ry="100" transform="rotate(35 350 350)"/></g></svg>`,
    'noise.svg':`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)" opacity=".025"/></svg>`
  };
  await Promise.all(Object.entries(files).map(([name,data])=>fs.writeFile(path.join(dir,name),data)));
  return files;
}
