import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { notebookSnapshot } from '../src/vault.js';
import { dailyQuestions, validOptionIds } from '../src/journal.js';
const data=JSON.parse(readFileSync('public/faculty/simulation.json','utf8'));
test('synthetic cohort has balanced genders, distinct adult profiles and 500 labelled records',()=>{
 assert.equal(data.simulated,true);assert.equal(data.profiles.length,50);assert.equal(data.records.length,500);
 assert.equal(new Set(data.profiles.map(p=>p.id)).size,50);
 assert.equal(new Set(data.profiles.map(p=>p.description)).size,50);
 for(const gender of ['male','female'])assert.equal(data.profiles.filter(p=>p.gender===gender).length,25);
 assert.equal(new Set(data.records.map(r=>r.text)).size,500);
 for(const p of data.profiles){assert.ok(p.age>=18&&p.age<=45);assert.equal(p.simulated,true);const records=data.records.filter(r=>r.profileId===p.id);assert.equal(records.length,10);assert.equal(new Set(records.map(r=>r.date)).size,10);assert.deepEqual(records.map(r=>r.observationDay),[1,2,3,4,5,6,7,8,9,10]);}
 for(const r of data.records){assert.equal(r.simulated,true);assert.match(r.label,/SIMULATED/);assert.match(r.text,/SIMULATED/);assert.ok(r.stressBefore>=0&&r.stressBefore<=10);assert.ok(r.stressAfter>=0&&r.stressAfter<=10);assert.ok(r.sleepHours>=5&&r.sleepHours<=9);assert.ok(r.meals>=1&&r.meals<=3);const q=dailyQuestions[Math.min(r.observationDay-1,6)];assert.ok(validOptionIds(r.optionIds,q.options,!!q.single));if(r.observationDay>7)assert.equal(r.appJournalDay,null);}
 assert.ok(data.records.some(r=>r.stressAfter>r.stressBefore));assert.ok(data.records.some(r=>r.stressAfter===r.stressBefore));assert.ok(data.records.some(r=>r.stressAfter<r.stressBefore));
});
test('all 50 seven-day notebook fixtures validate without silently expanding the app schema',()=>{
 assert.equal(data.notebooks.length,50);
 for(const n of data.notebooks){assert.equal(n.simulated,true);assert.equal(n.notebook.entries.length,7);assert.equal(n.notebook.consent,false);assert.deepEqual(notebookSnapshot(n.notebook),n.notebook);const p=data.profiles.find(p=>p.id===n.profileId);assert.ok(p);assert.equal(n.notebook.lang,p.preferredLanguage);}
});
test('demo is isolated, uses safe text rendering, and exposes available files',()=>{
 const js=readFileSync('public/faculty/demo.js','utf8');assert.doesNotMatch(js,/localStorage|sessionStorage|supabase|innerHTML/);
 const html=readFileSync('public/faculty/index.html','utf8');
 for(const file of ['simulation.json','profiles.csv','daily-records.csv','saath-fillable-questionnaire.pdf','README.md']){assert.ok(html.includes(file));assert.ok(readFileSync('public/faculty/'+file).length>0);}
 assert.match(readFileSync('public/faculty/profiles.csv','utf8'),/simulated/);assert.match(readFileSync('public/faculty/daily-records.csv','utf8'),/simulated/);
 assert.match(readFileSync('src/main.js','utf8'),/\.\/faculty\/index.html/);
});

test('sandbox viewer switches profiles and renders ten days without touching storage', async()=>{
 const {JSDOM}=await import('jsdom');
 const dom=new JSDOM(readFileSync('public/faculty/index.html','utf8'),{url:'https://saath.test/faculty/index.html',runScripts:'outside-only'});
 const w=dom.window;
 w.localStorage.setItem('saath-prototype-v1','private notebook sentinel');
 w.fetch=async url=>{assert.equal(url,'./simulation.json');return {ok:true,json:async()=>data};};
 await w.eval('(async()=>{'+readFileSync('public/faculty/demo.js','utf8')+'})()');
 assert.equal(w.document.querySelectorAll('#profile option').length,50);
 assert.equal(w.document.querySelectorAll('#records article').length,10);
 const select=w.document.querySelector('#profile');select.value='SIM-050';select.dispatchEvent(new w.Event('change'));
 assert.match(w.document.querySelector('#status').textContent,/SIM-050/);
 assert.equal(w.document.querySelectorAll('#records article').length,10);
 assert.match(w.document.querySelector('#records').textContent,/outside the app/);
 assert.equal(w.localStorage.getItem('saath-prototype-v1'),'private notebook sentinel');
 w.close();
});
