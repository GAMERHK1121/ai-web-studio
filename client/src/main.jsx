import React,{useEffect,useMemo,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';

const API=(import.meta.env.VITE_API_URL||'').replace(/\/$/,'');
const STORE='aws-claude-like-v3';
const starter=[{role:'assistant',text:'سلام! من AI Web Studio هستم.\nایده‌ی سایتت را بنویس؛ من می‌توانم معماری، UI، کد، SEO و Preview را برایت آماده کنم.'}];

function uid(){return crypto.randomUUID?.()||String(Date.now())}
async function api(path,options={}){const r=await fetch(`${API}${path}`,{...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});let d={};try{d=await r.json()}catch{}if(!r.ok)throw Error(d.error||`HTTP ${r.status}`);return d}
function saveLocal(projects){localStorage.setItem(STORE,JSON.stringify(projects))}
function loadLocal(){try{return JSON.parse(localStorage.getItem(STORE)||'[]')}catch{return []}}

function App(){
 const [messages,setMessages]=useState(starter),[input,setInput]=useState(''),[busy,setBusy]=useState(false),[ai,setAi]=useState({connected:false,provider:'cloudflare',model:'@cf/qwen/qwen3-30b-a3b-fp8'});
 const [projects,setProjects]=useState(loadLocal),[activeProject,setActiveProject]=useState(null),[files,setFiles]=useState([]),[activeFile,setActiveFile]=useState('index.html');
 const [view,setView]=useState('chat'),[preview,setPreview]=useState(false),[device,setDevice]=useState('desktop'),[qa,setQa]=useState(null),[showProjects,setShowProjects]=useState(true),[menu,setMenu]=useState(false);
 const [composerMode,setComposerMode]=useState('build'); const endRef=useRef(null);
 useEffect(()=>{api('/api/ai/status').then(setAi).catch(()=>setAi(x=>({...x,connected:false,error:'API unavailable'})))},[]);
 useEffect(()=>endRef.current?.scrollIntoView({behavior:'smooth'}),[messages,busy]);
 useEffect(()=>saveLocal(projects),[projects]);
 const active=useMemo(()=>files.find(f=>f.name===activeFile),[files,activeFile]);
 const updateFile=(content)=>setFiles(fs=>fs.map(f=>f.name===activeFile?{...f,content}:f));
 const addMessage=(role,text)=>setMessages(m=>[...m,{role,text}]);

 async function send(){if(!input.trim()||busy)return;const text=input.trim();setInput('');addMessage('user',text);setBusy(true);
  try{
   if(composerMode==='build'){
    const plan=await api('/api/plan',{method:'POST',body:JSON.stringify({prompt:text})});
    const p={...plan,id:plan.id||uid(),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
    setActiveProject(p);setFiles([]);setActiveFile('index.html');setProjects(x=>[p,...x.filter(y=>y.id!==p.id)]);setView('workspace');
    addMessage('assistant',`طرح پروژه «${p.name||'Untitled'}» آماده شد. ${p.pages?.length||1} صفحه و ${p.features?.length||0} قابلیت در نظر گرفته شده. اگر آماده‌ای، Build را بزن.`);
   }else{
    const d=await api('/api/chat',{method:'POST',body:JSON.stringify({messages:[...messages,{role:'user',content:text}],project:activeProject})});
    addMessage('assistant',d.text||'پاسخی دریافت نشد.');
   }
  }catch(e){addMessage('assistant',`خطا: ${e.message}`)}finally{setBusy(false)}
 }
 async function build(){if(!activeProject||busy)return;setBusy(true);try{const d=await api('/api/generate',{method:'POST',body:JSON.stringify({prompt:activeProject.description,spec:activeProject})});setFiles(d.files||[]);setActiveFile('index.html');setView('workspace');setQa(null);const p={...activeProject,updatedAt:new Date().toISOString(),fileCount:d.files?.length||0};setActiveProject(p);setProjects(x=>[p,...x.filter(y=>y.id!==p.id)]);addMessage('assistant',`${d.provider==='workers-ai'?'ساخت با Cloud AI انجام شد.':'ساخت با fallback محلی انجام شد.'} حالا Preview و QA آماده‌اند.`)}catch(e){addMessage('assistant',`Build ناموفق بود: ${e.message}`)}finally{setBusy(false)}}
 function newChat(){setMessages(starter);setActiveProject(null);setFiles([]);setView('chat');setShowProjects(false)}
 function openProject(p){setActiveProject(p);setFiles(p.files||[]);setActiveFile((p.files||[])[0]?.name||'index.html');setView('workspace');setShowProjects(false)}
 function saveProject(){if(!activeProject)return;const p={...activeProject,files,updatedAt:new Date().toISOString()};setActiveProject(p);setProjects(x=>[p,...x.filter(y=>y.id!==p.id)])}
 function runQA(){const html=files.find(f=>f.name==='index.html')?.content||'';const checks=[['HTML exists',!!html],['Title',/<title[^>]*>.*<\/title>/is.test(html)],['Meta description',/name=["']description["']/i.test(html)],['Viewport',/name=["']viewport["']/i.test(html)],['Lang',/<html[^>]+lang=/i.test(html)],['Semantic sections',/<(main|header|nav|footer|section)\b/i.test(html)],['Responsive CSS',/viewport|@media|max-width/i.test((files.find(f=>f.name==='style.css')?.content||''))]];const score=Math.round(checks.filter(x=>x[1]).length/checks.length*100);setQa({score,checks});setView('qa')}
 function exportZip(){const payload=JSON.stringify({project:activeProject,files},null,2);const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([payload],{type:'application/json'}));a.download=`${activeProject?.id||'ai-web-studio'}-project.json`;a.click();URL.revokeObjectURL(a.href)}
 const previewDoc=()=>{const h=files.find(f=>f.name==='index.html')?.content||'';const c=files.find(f=>f.name==='style.css')?.content||'';const j=files.find(f=>f.name==='app.js')?.content||'';return h.replace('</head>',`<style>${c}</style></head>`).replace('</body>',`<script>${j}</script></body>`)};
 return <div className="app" dir="ltr">
   <aside className={`sidebar ${menu?'open':''}`}>
    <div className="brand"><div className="brandmark">✦</div><div><b>AI Web Studio</b><small>Claude-style Web Agent</small></div></div>
    <button className="newchat" onClick={newChat}>＋ New chat</button>
    <div className="sidegroup"><span>Workspace</span><button className={view==='chat'?'active':''} onClick={()=>setView('chat')}>⌂ <b>Chat</b></button><button className={view==='workspace'?'active':''} onClick={()=>setView('workspace')} disabled={!activeProject}>◈ <b>Workspace</b></button><button className={view==='qa'?'active':''} onClick={()=>setView('qa')} disabled={!files.length}>✓ <b>Quality</b></button></div>
    <div className="sidegroup projects"><span>Projects <em>{projects.length}</em></span>{projects.slice(0,8).map(p=><button key={p.id} onClick={()=>openProject(p)}><i>◇</i><b>{p.name||'Untitled'}</b></button>)}{!projects.length&&<small className="empty">No projects yet</small>}</div>
    <div className="sidebottom"><div className={`ai-status ${ai.connected?'ok':''}`}><span></span><div><b>{ai.connected?'Cloud AI online':'Cloud AI not connected'}</b><small>{ai.model||'Workers AI'}</small></div></div><button onClick={()=>setShowProjects(true)}>⚙ Projects</button></div>
   </aside>
   <main className="main">
    <header className="topbar"><button className="hamb" onClick={()=>setMenu(v=>!v)}>☰</button><div className="crumb"><b>{activeProject?.name||'New conversation'}</b>{activeProject&&<small> / {view}</small>}</div><div className="topactions"><button onClick={()=>setShowProjects(v=>!v)}>Projects</button>{activeProject&&<button onClick={saveProject}>Save</button>}<button className="avatar">A</button></div></header>
    {view==='chat'&&<section className="chatpage"><div className="chatintro"><div className="spark">✦</div><h1>What are we building?</h1><p>Describe your website in natural language. AI Web Studio plans it, generates it, tests it and lets you edit the result.</p></div><div className="messages">{messages.map((m,i)=><div className={`msg ${m.role}`} key={i}>{m.role==='assistant'&&<div className="msgavatar">✦</div>}<div className="bubble">{m.text.split('\n').map((x,j)=><React.Fragment key={j}>{x}{j<m.text.split('\n').length-1&&<br/>}</React.Fragment>)}</div></div>)}{busy&&<div className="msg assistant"><div className="msgavatar">✦</div><div className="typing"><i></i><i></i><i></i></div></div>}<div ref={endRef}/></div><Composer input={input} setInput={setInput} send={send} busy={busy} mode={composerMode} setMode={setComposerMode} ai={ai}/></section>}
    {view==='workspace'&&<Workspace project={activeProject} files={files} activeFile={activeFile} setActiveFile={setActiveFile} active={active} updateFile={updateFile} build={build} busy={busy} setPreview={setPreview} preview={preview} device={device} setDevice={setDevice} previewDoc={previewDoc} runQA={runQA} qa={qa} exportZip={exportZip}/>} 
    {view==='qa'&&<QA qa={qa} runQA={runQA}/>} 
   </main>
   {showProjects&&<div className="drawer" onClick={()=>setShowProjects(false)}><div className="drawercard" onClick={e=>e.stopPropagation()}><div className="drawerhead"><b>Projects</b><button onClick={()=>setShowProjects(false)}>×</button></div>{projects.map(p=><button className="projectrow" key={p.id} onClick={()=>openProject(p)}><span>◇</span><div><b>{p.name||'Untitled'}</b><small>{p.description||'No description'}</small></div></button>)}{!projects.length&&<p className="empty">Create your first project from New chat.</p>}</div></div>}
 </div>
}
function Composer({input,setInput,send,busy,mode,setMode,ai}){return <div className="composer"><textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}} placeholder={mode==='build'?'Describe the website you want to build…':'Ask AI Web Studio anything…'} /><div className="composerbar"><div className="tools"><button className={mode==='build'?'selected':''} onClick={()=>setMode('build')}>✦ Build</button><button className={mode==='chat'?'selected':''} onClick={()=>setMode('chat')}>☼ Ask</button><button onClick={()=>alert('File upload can be added to the project workspace.')}>＋ Attach</button></div><div className="sendarea"><span>{ai.connected?'Cloud AI':'Fallback mode'}</span><button className="send" onClick={send} disabled={busy||!input.trim()}>{busy?'…':'↑'}</button></div></div></div>}
function Workspace({project,files,activeFile,setActiveFile,active,updateFile,build,busy,setPreview,preview,device,setDevice,previewDoc,runQA,qa,exportZip}){return <section className="workspace"><div className="workspacehead"><div><span className="eyebrow">PROJECT</span><h2>{project?.name||'Untitled'}</h2><p>{project?.description}</p></div><div className="workactions"><button onClick={build} disabled={busy}>{busy?'Building…':'↻ Rebuild'}</button><button onClick={runQA}>✓ QA</button><button className="primary" onClick={()=>setPreview(true)} disabled={!files.length}>Preview</button><button onClick={exportZip}>Export</button></div></div>{!files.length?<div className="emptybuild"><div>✦</div><h3>Ready to build</h3><p>Generate the website from your project brief.</p><button className="primary" onClick={build}>Generate website</button></div>:preview?<div className="previewwrap"><div className="previewtools"><div><button className={device==='desktop'?'on':''} onClick={()=>setDevice('desktop')}>Desktop</button><button className={device==='tablet'?'on':''} onClick={()=>setDevice('tablet')}>Tablet</button><button className={device==='mobile'?'on':''} onClick={()=>setDevice('mobile')}>Mobile</button></div><button onClick={()=>setPreview(false)}>← Code</button></div><div className={`previewframe ${device}`}><iframe title="preview" sandbox="allow-scripts" srcDoc={previewDoc()}/></div></div>:<div className="codeworkspace"><div className="filelist"><span>FILES</span>{files.map(f=><button className={activeFile===f.name?'on':''} key={f.name} onClick={()=>setActiveFile(f.name)}><i>{f.name.endsWith('.html')?'◇':f.name.endsWith('.css')?'#':'JS'}</i>{f.name}</button>)}</div><div className="codearea"><div className="codehead"><b>{activeFile}</b><span>Live editor</span></div><textarea value={active?.content||''} onChange={e=>updateFile(e.target.value)} spellCheck="false"/></div><aside className="inspector"><span>INSPECTOR</span><div><small>Pages</small><b>{project?.pages?.length||1}</b></div><div><small>Features</small><b>{project?.features?.length||0}</b></div><div><small>Files</small><b>{files.length}</b></div>{qa&&<div><small>QA</small><b>{qa.score}/100</b></div>}</aside></div>}</section>}
function QA({qa,runQA}){return <section className="qapage"><div className="qahead"><span className="eyebrow">QUALITY ENGINE</span><h1>Production checks</h1><button className="primary" onClick={runQA}>Run QA</button></div>{!qa?<div className="emptybuild"><div>✓</div><h3>No report yet</h3><p>Run QA after generating your website.</p></div>:<div className="qacard"><div className="qascore"><strong>{qa.score}</strong><span>/100</span></div>{qa.checks.map(([name,ok])=><div className="qacheck" key={name}><span className={ok?'pass':'fail'}>{ok?'✓':'!'}</span><b>{name}</b><small>{ok?'Passed':'Needs attention'}</small></div>)}</div>}</section>}

createRoot(document.getElementById('root')).render(<App/>);
