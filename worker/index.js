const MODEL='@cf/qwen/qwen3-30b-a3b-fp8';
const cors={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'Content-Type',
  'Access-Control-Allow-Methods':'GET,POST,OPTIONS'
};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json',...cors}});

function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function fallbackPlan(prompt){const id=`project-${Date.now()}`;return {id,name:'AI Website Project',description:prompt,pages:['Home','About','Services','Contact'],features:['Responsive UI','SEO metadata','Accessible navigation','Modern animations','Production-ready structure'],threeD:true,designSystem:{name:'Warm Minimal',colors:{primary:'#c96d47',background:'#f7f7f5'},effects:{motion:true}}};}
function fallbackFiles(spec){const title=spec?.name||'AI Website';const desc=spec?.description||'A modern production website.';return [{name:'index.html',content:`<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${esc(desc)}"><title>${esc(title)}</title><link rel="stylesheet" href="style.css"></head><body><header class="nav"><strong>${esc(title)}</strong><nav><a href="#home">Home</a><a href="#services">Services</a><a href="#about">About</a><a href="#contact">Contact</a></nav></header><main><section id="home" class="hero"><span>AI Web Studio</span><h1>${esc(title)}</h1><p>${esc(desc)}</p><a class="cta" href="#contact">Get started</a></section><section id="services"><h2>Services</h2><div class="grid"><article>Strategy</article><article>Design</article><article>Development</article></div></section><section id="about"><h2>About</h2><p>Built with semantic HTML, responsive CSS and a clean production structure.</p></section><section id="contact"><h2>Contact</h2><p>Let’s build something exceptional.</p></section></main><footer>© ${new Date().getFullYear()} ${esc(title)}</footer><script src="app.js"></script></body></html>`},{name:'style.css',content:`*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,sans-serif;background:#f7f7f5;color:#25231f}body{scroll-behavior:smooth}.nav{position:sticky;top:0;display:flex;justify-content:space-between;align-items:center;padding:18px 6%;background:rgba(247,247,245,.88);backdrop-filter:blur(16px);border-bottom:1px solid #e1e0db}.nav nav{display:flex;gap:20px}.nav a{color:inherit;text-decoration:none}.hero{min-height:72vh;display:grid;place-content:center;padding:80px 8%;text-align:center;background:radial-gradient(circle at 50% 30%,#eadfd8,transparent 55%)}.hero h1{font-size:clamp(42px,8vw,88px);line-height:.95;letter-spacing:-.07em;max-width:900px;margin:16px auto}.hero p{max-width:700px;margin:0 auto 25px;color:#74716b;line-height:1.7}.cta{display:inline-block;padding:12px 18px;border-radius:10px;background:#292722;color:white;text-decoration:none}main>section:not(.hero){max-width:1100px;margin:auto;padding:100px 6%}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}.grid article{padding:35px;border:1px solid #dddcd6;border-radius:16px;background:#fff}@media(max-width:700px){.nav nav{display:none}.grid{grid-template-columns:1fr}}`},{name:'app.js',content:`document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const el=document.querySelector(a.getAttribute('href'));if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth'})}}));`},{name:'robots.txt',content:'User-agent: *\nAllow: /\n'}];}

async function runAI(env,messages,max_tokens=1800){
  if(!env.AI) throw Error('Cloudflare Workers AI binding is not configured');
  // Qwen3 supports chat-style messages through the Workers AI binding.
  const r=await env.AI.run(MODEL,{messages,max_tokens,temperature:.35});
  return r?.response||r?.result?.response||'';
}
function extractJson(text){const m=String(text).match(/\{[\s\S]*\}/);if(!m)throw Error('AI returned invalid JSON');return JSON.parse(m[0]);}

async function handleApi(request,env,path){
  if(path==='/api/ai/status'&&request.method==='GET')return json({connected:!!env.AI,provider:env.AI?'cloudflare-workers-ai':'fallback',model:MODEL,models:[MODEL],message:env.AI?'Workers AI binding detected':'Add a Workers AI binding named AI to this Worker'});
  if(path==='/api/ai/test'&&request.method==='POST'){
    try{
      const raw=await runAI(env,[{role:'system',content:'Reply with exactly: AI Web Studio online.'},{role:'user',content:'Connection test'}],40);
      return json({connected:true,provider:'cloudflare-workers-ai',model:MODEL,text:raw});
    }catch(e){return json({connected:false,provider:'fallback',model:MODEL,error:e.message},503);}
  }
  if(path==='/api/chat'&&request.method==='POST'){
    const b=await request.json();let text;
    try{text=await runAI(env,[{role:'system',content:'You are AI Web Studio, a concise expert web-development agent. Answer in the user language. Help design, code, debug, SEO and architecture. Do not claim you executed something unless you did.'},...(b.messages||[]).slice(-12).map(m=>({role:m.role==='assistant'?'assistant':'user',content:m.text||m.content||''}))],1200)}
    catch(e){text='Cloud AI is not connected yet. Check the Workers AI binding named AI and redeploy the Worker.';}
    return json({text,provider:env.AI?'workers-ai':'fallback'});
  }
  if(path==='/api/plan'&&request.method==='POST'){
    const b=await request.json();let plan;
    try{const raw=await runAI(env,[{role:'system',content:'Return ONLY valid JSON. Schema: {id,name,description,pages:string[],features:string[],threeD:boolean,designSystem:{name,colors:{primary,background},effects:{motion:boolean}}}. Create a strong website plan from the prompt.'},{role:'user',content:String(b.prompt||'')}],900);plan=extractJson(raw);plan.id=plan.id||`project-${Date.now()}`;}
    catch(e){plan=fallbackPlan(b.prompt||'')}
    return json(plan);
  }
  if(path==='/api/generate'&&request.method==='POST'){
    const b=await request.json();let files,provider='fallback';
    try{const raw=await runAI(env,[{role:'system',content:'You are a senior frontend engineer. Return ONLY valid JSON with key files, an array of {name,content}. Create a polished responsive production website using only HTML/CSS/JS. Include index.html, style.css, app.js, robots.txt. Keep code concise but complete. Use semantic HTML, SEO meta, responsive design, accessible interactions and tasteful motion. Do not use external dependencies.'},{role:'user',content:`Project plan:\n${JSON.stringify(b.spec)}\nBrief:\n${String(b.prompt||'')}`}],5000);const parsed=extractJson(raw);files=Array.isArray(parsed.files)?parsed.files:null;if(!files?.length)throw Error('No files');provider='workers-ai';}
    catch(e){files=fallbackFiles(b.spec||{description:b.prompt});}
    return json({files,provider});
  }
  if(path==='/api/projects'&&request.method==='GET')return json({projects:[]});
  if(path==='/api/studio/diagnostics'&&request.method==='GET')return json({checks:[{label:'Cloud API',ok:true,detail:'Worker API online'},{label:'Workers AI',ok:!!env.AI,detail:env.AI?'Binding detected':'Add AI binding in Worker'},{label:'Runtime',ok:true,detail:'Cloudflare Worker + Static Assets'}]});
  return json({error:'API route not found',path},404);
}

export default {
  async fetch(request,env,ctx){
    if(request.method==='OPTIONS')return new Response(null,{headers:cors});
    const url=new URL(request.url);
    if(url.pathname.startsWith('/api/')){
      try{return await handleApi(request,env,url.pathname);}catch(e){return json({error:e.message||'Server error'},500);}
    }
    return env.ASSETS.fetch(request);
  }
};
