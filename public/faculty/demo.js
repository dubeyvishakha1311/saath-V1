const select = document.querySelector('#profile');
const status = document.querySelector('#status');
function el(tag,text,parent){const node=document.createElement(tag);node.textContent=text;parent.append(node);return node;}
try {
 const response=await fetch('./simulation.json');
 if(!response.ok)throw Error('Could not load bundled data');
 const dataset=await response.json();
 if(dataset.simulated!==true||dataset.profiles.length!==50||dataset.records.length!==500)throw Error('Invalid simulation fixture');
 select.replaceChildren();
 for(const p of dataset.profiles){const o=el('option',`${p.id} · ${p.age} · ${p.gender} · ${p.context}`,select);o.value=p.id;}
 function render(){
  const p=dataset.profiles.find(p=>p.id===select.value),summary=document.querySelector('#summary'),list=document.querySelector('#records');
  summary.replaceChildren();list.replaceChildren();
  el('h3',`${p.displayName} — SIMULATED`,summary);el('p',p.description,summary);
  el('p',`Thought pattern: ${p.thoughtPattern}. Protective factor: ${p.protectiveFactor}. Language preference: ${p.preferredLanguage} (synthetic narratives are English).`,summary);
  for(const r of dataset.records.filter(r=>r.profileId===p.id)){
   const card=el('article','',list);el('h3',`Day ${r.observationDay} · ${r.date} · SIMULATED`,card);
   el('p',r.appJournalDay?`App journal day ${r.appJournalDay}: ${r.prompt}`:'Extra follow-up observation — outside the app’s seven-day journal',card);
   el('p',`Tap choices: ${r.optionIds.join(', ')}`,card);
   el('p',r.text,card);el('p',`Evidence for: ${r.evidenceFor} Evidence against: ${r.evidenceAgainst}`,card);
   el('p',`Stress: ${r.stressBefore} → ${r.stressAfter} / 10 · Sleep: ${r.sleepHours} h · Meals: ${r.meals}. Constructed test values, not clinical measurements.`,card);
  }
  status.textContent=`Showing ten synthetic observations for ${p.id}. Personal data unchanged.`;
 }
 select.disabled=false;select.addEventListener('change',render);render();
} catch {status.textContent='The demo could not load. Reopen from the app, or use the bundled JSON download. No personal data was changed.';}
