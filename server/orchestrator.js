import crypto from 'crypto';
import { buildDesignSystem, buildAssetManifest } from './design.js';
import { auditFiles } from './qa.js';

export const AGENTS = [
  { id:'architect', name:'Architect Agent', role:'Project architecture, pages and requirements' },
  { id:'design', name:'Design Agent', role:'Design system, typography, color and motion' },
  { id:'asset', name:'Asset Agent', role:'Local assets and visual asset manifest' },
  { id:'ui', name:'UI Agent', role:'Responsive semantic interface' },
  { id:'code', name:'Code Agent', role:'HTML, CSS and JavaScript implementation' },
  { id:'seo', name:'SEO Agent', role:'Technical SEO and metadata' },
  { id:'aeo', name:'AEO Agent', role:'Answer-ready content and structured answers' },
  { id:'geo', name:'GEO Agent', role:'Entity clarity and AI-search discoverability' },
  { id:'3d', name:'3D Agent', role:'Three.js / visual motion readiness' },
  { id:'qa', name:'QA Agent', role:'Quality, accessibility and performance audit' }
];

export function buildOrchestration(prompt, spec, files) {
  const design = spec?.designSystem || buildDesignSystem(prompt);
  const assets = buildAssetManifest(spec || {}, design);
  const audit = files ? auditFiles(files) : null;
  const has3D = Boolean(spec?.threeD || /3d|سه بعدی|سه‌بعدی|three\.js/i.test(prompt));
  return {
    version:'0.9.0',
    mode:'multi-agent',
    agents: AGENTS.map(a => ({...a, status: a.id === 'qa' && !files ? 'waiting' : 'ready'})),
    pipeline:['architect','design','asset','ui','code','seo','aeo','geo',...(has3D?['3d']:[]),'qa'],
    design,
    assets,
    audit,
    handoffs:[
      {from:'architect',to:'design',data:['pages','requirements','features']},
      {from:'design',to:'ui',data:['tokens','motion','layout rules']},
      {from:'asset',to:'code',data:['asset manifest','local paths']},
      {from:'ui',to:'code',data:['component structure','responsive rules']},
      {from:'code',to:'seo',data:['HTML structure','routes']},
      {from:'seo',to:'aeo',data:['metadata','semantic structure']},
      {from:'aeo',to:'geo',data:['answer blocks','entities']},
      {from:'geo',to:'qa',data:['discoverability requirements']}
    ]
  };
}


export function createRunState(prompt, spec) {
  const has3D = Boolean(spec?.threeD || /3d|سه بعدی|سه‌بعدی|three\.js/i.test(prompt));
  const pipeline = ['architect','design','asset','ui','code','seo','aeo','geo',...(has3D?['3d']:[]),'qa'];
  return {
    id: crypto.randomUUID(),
    status: 'running',
    current: pipeline[0],
    pipeline,
    steps: pipeline.map((id, index) => ({id, index:index+1, status:'pending', startedAt:null, finishedAt:null, message:''})),
    startedAt: new Date().toISOString(),
    finishedAt: null,
    errors: []
  };
}
