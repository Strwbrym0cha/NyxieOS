const DAY_MS=86400000;
const dayNames=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const localNoon=value=>{
 if(value instanceof Date)return new Date(value.getFullYear(),value.getMonth(),value.getDate(),12);
 const raw=String(value||'');
 if(raw.length===10&&raw[4]==='-'&&raw[7]==='-'){const p=raw.split('-').map(Number);return new Date(p[0],p[1]-1,p[2],12)}
 const date=new Date(raw);return Number.isNaN(date.getTime())?null:new Date(date.getFullYear(),date.getMonth(),date.getDate(),12);
};
export const localDate=(value=new Date())=>{const d=localNoon(value)||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
export const normalizeConventionStatus=value=>String(value??'').trim().toLowerCase();
export const daysUntilConvention=convention=>{
 const target=localNoon(convention?.startDate);const today=localNoon(new Date());
 return target?Math.round((target-today)/DAY_MS):null;
};
export const getUpcomingConventions=(items=[],date=localDate())=>(Array.isArray(items)?items:[]).filter(item=>item?.startDate&&item.startDate>=date&&normalizeConventionStatus(item.status)!=='completed').sort((a,b)=>String(a.startDate).localeCompare(String(b.startDate)));
export const getActiveConvention=(items=[],activeId,date=localDate())=>{const list=Array.isArray(items)?items:[];return list.find(item=>String(item.id)===String(activeId))||getUpcomingConventions(list,date)[0]||list[0]||null};
const list=value=>Array.isArray(value)?value:[];
export const getPrepCompletion=convention=>{const rows=list(convention?.checklist);const done=rows.filter(item=>Boolean(item.done)).length;return {done,total:rows.length,percent:rows.length?Math.round(done/rows.length*100):0}};
export const getPackingCompletion=convention=>{const rows=list(convention?.packing);const done=rows.filter(item=>Boolean(item.packed||item.done)).length;return {done,total:rows.length,percent:rows.length?Math.round(done/rows.length*100):0}};
export const getLinkedCosplayIds=convention=>Array.from(new Set([...list(convention?.linkedCosplayIds),...list(convention?.cosplayIds)].map(String)));
export const getLinkedCosplays=(convention,projects=[])=>{const ids=getLinkedCosplayIds(convention);return list(projects).filter(project=>ids.includes(String(project.id)))};
export const getCosplayReadinessSummary=project=>{
 const pieces=list(project?.pieces);const ready=pieces.filter(piece=>String(piece?.status||'').trim().toLowerCase()==='ready').length;const packed=pieces.filter(piece=>Boolean(piece.packed)).length;
 const special=['Contacts','Shoes','Prop'].map(category=>{const matches=pieces.filter(piece=>String(piece.category||'').trim().toLowerCase()===category.toLowerCase()||category==='Prop'&&String(piece.category||'').trim().toLowerCase()==='props');const item=matches.find(piece=>{const repair=String(piece.repairStatus||'').trim().toLowerCase();return repair&&repair!=='none'&&repair!=='repaired'})||matches.find(piece=>String(piece.status||'').trim().toLowerCase()!=='ready')||matches[0];const repair=item&&String(item.repairStatus||'').trim().toLowerCase();return {category,item,state:item?(String(item.status||'Planning').trim()||'Planning'):'Not listed',ready:Boolean(item&&String(item.status||'').trim().toLowerCase()==='ready'),packed:Boolean(item?.packed),needsRepair:Boolean(repair&&repair!=='none'&&repair!=='repaired')}});
 return {ready,packed,total:pieces.length,percent:pieces.length?Math.round(ready/pieces.length*100):Number(project?.progress)||0,remaining:Math.max(0,pieces.length-ready),special};
};
export const getLinkedTrip=(convention,trips=[])=>list(trips).find(trip=>String(trip.linkedConventionId)===String(convention?.id))||null;
export const getLinkedCreatorItems=(convention,items=[])=>list(items).filter(item=>String(item.conventionId)===String(convention?.id));
const asEvent=(event,sourceKey,kind)=>({...event,sourceKey,kind:event.type||kind||'General',sourceId:event.id});
export const getConventionTimeline=convention=>{
 const events=[];
 list(convention?.schedule).forEach(event=>events.push(asEvent(event,'schedule')));
 ['panels','meetups','photoshoots','vendors','foodPlan'].forEach(key=>list(convention?.[key]).forEach(event=>events.push(asEvent(event,key,key==='foodPlan'?'Food':key.slice(0,-1).replace(/^./,x=>x.toUpperCase())))));
 const seen=new Set();
 return events.filter(event=>{const key=String(event.id??event.sourceKey+'-'+event.title+'-'+event.date+'-'+event.time);if(seen.has(key))return false;seen.add(key);return true}).sort((a,b)=>{const ad=(a.date||'9999-12-31')+'T'+(a.time||'99:99'),bd=(b.date||'9999-12-31')+'T'+(b.time||'99:99');return ad.localeCompare(bd)||String(a.title||a.name||'').localeCompare(String(b.title||b.name||''))});
};
export const getNextScheduleItem=(convention,date=localDate(),now=new Date())=>getConventionTimeline(convention).filter(event=>event.date===date&&!event.done&&(!event.time||event.time>=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0')))[0]||null;
export const getTodaySchedule=(convention,date=localDate())=>getConventionTimeline(convention).filter(event=>event.date===date);
export const getTodayPhotoshoots=(convention,date=localDate())=>getConventionTimeline(convention).filter(event=>event.date===date&&(String(event.type||event.kind).toLowerCase()==='photoshoot'||event.sourceKey==='photoshoots'));
export const getConventionContentSummary=(convention,creatorItems=[])=>{const content=convention?.content||{};const linked=getLinkedCreatorItems(convention,creatorItems);const target=Math.max(0,Number(content.target)||0),done=Math.max(0,Math.min(target,Number(content.done)||0));const stages=['To Film','Editing','Ready'];return {target,done,remaining:Math.max(0,target-done),linked,toFilm:linked.filter(item=>item.stage==='To Film'),editing:linked.filter(item=>item.stage==='Editing'),ready:linked.filter(item=>item.stage==='Ready'),nextShoot:linked.filter(item=>item.shootDate).sort((a,b)=>String(a.shootDate).localeCompare(String(b.shootDate)))[0]||null,nextUpload:linked.filter(item=>item.uploadDeadline).sort((a,b)=>String(a.uploadDeadline).localeCompare(String(b.uploadDeadline)))[0]||null}};
export const getPrepSuggestions=convention=>{
 const days=daysUntilConvention(convention);let phase=days===null?'Plan when ready':days<0?'Past convention':days<=1?'Day before':days<=7?'Final week':days<=28?'2–4 weeks':days<=90?'1–3 months':days<=180?'3–6 months':'6+ months';
 const suggestions={ '6+ months':['Badge','Lodging / travel','Choose cosplay lineup'],'3–6 months':['Orders and commissions','Major builds','Content / photoshoot planning'],'1–3 months':['Wig','Contacts','Shoes','Props','Repairs','Schedule'],'2–4 weeks':['Packing','Confirmations','Content shot list','Photoshoots'],'Final week':['CONTACTS','SHOES','PROPS','Chargers','ID','Badge','Confirmations'],'Day before':['Packed bag','Badge / ID','Travel details','Food and water plan'],'Plan when ready':['Badge','Lodging / travel','Cosplay lineup'],'Past convention':['Review this convention']};return {phase,suggestions:suggestions[phase]||suggestions['Plan when ready']};
};
export const getConventionEssentials=(convention,linkedCosplays=[])=>{
 const badge=convention?.badge||{};const special=linkedCosplays.flatMap(project=>getCosplayReadinessSummary(project).special.map(item=>({...item,projectName:project.name})));
 return [{label:'Badge',state:badge.status||'Not purchased',attention:normalizeConventionStatus(badge.status)!=='ready'},{label:'ID / documents',state:'Bring',attention:false},{label:'Phone / charger / battery',state:'Bring',attention:false},...special.filter(item=>['Contacts','Shoes','Prop'].includes(item.category)).map(item=>({label:item.category+' · '+item.projectName,state:item.needsRepair?'Needs repair':item.ready?(item.packed?'Ready + packed':'Ready · not packed'):(item.packed?'Not ready · packed':'Not ready · not packed'),attention:item.needsRepair||!item.ready||!item.packed}))];
};
