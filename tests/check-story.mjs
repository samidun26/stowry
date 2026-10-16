import assert from 'node:assert/strict';
import {nodes,endings,chapters,choose,freshState,interpolate} from '../dist/story.js';
import {art} from '../dist/art.js';
const counts={};const routeExamples={};let completed=0,minWords=Infinity,maxWords=0;const visited=new Set();
function walk(s,words=0,steps=0){
 assert(steps<40,'Story must not trap the reader in a loop');
 if(s.end){assert(endings[s.end]);counts[s.end]=(counts[s.end]||0)+1;routeExamples[s.end]??=s.trail;completed++;const total=words+endings[s.end].text.join(' ').split(/\s+/).length;minWords=Math.min(minWords,total);maxWords=Math.max(maxWords,total);assert.equal(new Set(s.items).size,s.items.length);assert.deepEqual(JSON.parse(JSON.stringify(s)),s);return;}
 const n=nodes[s.node];assert(n,`Missing scene ${s.node}`);visited.add(n.id);assert(chapters[n.chapter]);assert(n.text.length>=3);const text=n.text.map(t=>interpolate(t,s)).join(' ');assert(!text.includes('{{'),'Unresolved conditional prose');words+=text.split(/\s+/).length;
 if(n.puzzle){const p=n.puzzle;assert(p.answer.every(a=>p.items.includes(a)));assert.equal(new Set(p.answer).size,p.answer.length);walk(choose(s,{next:p.next,label:'Puzzle solved'}),words,steps+1);}
 else for(const c of n.choices){if(c.requires&&s.traits[c.requires]<c.min)continue;assert(c.ending?endings[c.ending]:nodes[c.next]);const nstate=choose(s,c);if(!nstate.end)assert(nodes[nstate.node].chapter>=n.chapter);walk(nstate,words,steps+1);}
}
walk(freshState());assert.equal(visited.size,Object.keys(nodes).length);assert.deepEqual(Object.keys(counts).sort(),Object.keys(endings).sort());
for(const scene of ['cover','town','bridge','market','library','tower','machine','ending'])assert(art(scene).includes('viewBox="0 0 640 480"'));
console.log(JSON.stringify({completedRoutes:completed,reachableScenes:visited.size,endings:counts,wordsPerPlaythrough:{min:minWords,max:maxWords},},null,2));
