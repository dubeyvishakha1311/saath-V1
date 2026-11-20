import { mkdirSync, writeFileSync } from 'node:fs';
import { dailyQuestions } from '../src/journal.js';
import { notebookSnapshot } from '../src/vault.js';
const dir = 'public/faculty';
mkdirSync(dir, {recursive:true});
const label = 'SIMULATED — synthetic software test data; not human observations or clinical evidence';
const contexts = ['university coursework','retail shifts','remote design work','family caregiving','job applications','commuting to an office','vocational training','freelance assignments','household budgeting','a new workplace'];
const styles = [
 ['detail-focused and reserved','checks work repeatedly','A mistake would mean I am incapable','One mistake does not define my ability','complete one task without checking twice'],
 ['sociable and approval-seeking','agrees before checking capacity','They will reject me if I say no','A respectful boundary can coexist with a relationship','practice one clear boundary'],
 ['curious but hesitant','postpones unfamiliar tasks','I must feel ready before starting','I can start small while feeling uncertain','try a task for five minutes'],
 ['independent and self-critical','avoids asking for support','Asking for help shows weakness','Support can be a practical resource','ask a trusted person one specific question'],
 ['reflective and routine-oriented','dwells on setbacks','Today went badly so tomorrow will too','Tomorrow is not decided by this moment','plan one manageable morning action']
];
const events = ['a delayed reply','an unexpected task','a changed plan','a comparison with a peer','a noisy afternoon','a small disagreement','unfinished work','an encouraging conversation','a cancelled plan','a quiet break'];
let seed=48721;
const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
const profiles=[], records=[], notebooks=[];
for(let i=0;i<50;i++) {
 const id=`SIM-${String(i+1).padStart(3,'0')}`, style=styles[Math.floor(i/10)], context=contexts[i%10];
 const profile={id,simulated:true,label,displayName:`Simulated person ${i+1}`,gender:i%2?'female':'male',age:18+(i*7%28),context,personality:style[0],behaviour:style[1],thoughtPattern:style[2],protectiveFactor:['friendship','structured routine','creative hobby','family connection','time outdoors'][i%5],preferredLanguage:i%3?'en':'hi',baselineStress:2+i%7,description:`Fictional ${18+(i*7%28)}-year-old navigating ${context}; ${style[0]}; often ${style[1]}. No diagnosis assigned.`};
 profiles.push(profile);
 const entries=[];
 for(let d=0;d<10;d++) {
  const q=dailyQuestions[Math.min(d,6)], options=q.options.filter(o=>o.id!=='disappear');
  const first=options[Math.floor(random()*options.length)];
  const optionIds=[first.id];
  if(!q.single&&!first.exclusive&&random()>.55){const second=options.filter(o=>!o.exclusive&&o.id!==first.id);optionIds.push(second[Math.floor(random()*second.length)].id);}
  const date=`2026-10-${String(d+1).padStart(2,'0')}`;
  const before=Math.max(0,Math.min(10,profile.baselineStress+Math.floor(random()*5)-2));
  const after=Math.max(0,Math.min(10,before+[-2,-1,0,0,1,2][Math.floor(random()*6)]));
  const situation=`During ${context}, I noticed ${events[(d+i)%10]} on day ${d+1}.`;
  const balancedThought=`${style[3]}. This is a possibility to test, not a guarantee about ${events[(d+i)%10]}.`;
  const text=`[SIMULATED ${id}, day ${d+1}] ${situation} My first thought was: ${style[2]}. Alternative: ${balancedThought} Next: ${style[4]}. ${after<before?'I felt a little less tense.':after>before?'The feeling became stronger; I may need a smaller step.':'My feeling stayed similar; that does not mean the reflection failed.'}`;
  const record={simulated:true,label,profileId:id,date,observationDay:d+1,appJournalDay:d<7?d+1:null,prompt:q.en,optionIds,situation,automaticThought:style[2],emotion:['worry','frustration','sadness','uncertainty','tension'][(i+d)%5],stressBefore:before,evidenceFor:`${events[(d+i)%10]} happened; I do not know all the reasons.`,evidenceAgainst:`One event during ${context} cannot establish a general conclusion about my worth.`,balancedThought,plannedAction:style[4],stressAfter:after,sleepHours:Math.round((5+random()*4)*10)/10,meals:1+Math.floor(random()*3),text};
  records.push(record);
  if(d<7)entries.push({date,day:d+1,questionVersion:1,optionIds,text});
 }
 const notebook=notebookSnapshot({entries,lang:profile.preferredLanguage,consent:false});
 notebooks.push({simulated:true,label,profileId:id,notebook});
}
const dataset={schemaVersion:1,simulated:true,label,seed:48721,ageRange:[18,45],purpose:'Functional demonstration only. No efficacy analysis is valid.',compatibility:'50 validated seven-entry notebook fixtures; days 8–10 are extension observations, not extra supported app journal days. Meal/sleep/CBT worksheet fields are simulation-only, not existing app screens.',profiles,records,notebooks};
writeFileSync(`${dir}/simulation.json`,JSON.stringify(dataset,null,2));
function csv(rows){const keys=Object.keys(rows[0]);const cell=v=>'"'+String(Array.isArray(v)?v.join('|'):v??'').replaceAll('"','""')+'"';return '\ufeff'+[keys,...rows.map(r=>keys.map(k=>r[k]))].map(row=>row.map(cell).join(',')).join('\r\n');}
writeFileSync(`${dir}/profiles.csv`,csv(profiles));
writeFileSync(`${dir}/daily-records.csv`,csv(records));
writeFileSync(`${dir}/questionnaire.json`,JSON.stringify(dailyQuestions,null,2));
console.log('Generated 50 simulated profiles, 500 daily records and 50 validated seven-day notebooks.');
