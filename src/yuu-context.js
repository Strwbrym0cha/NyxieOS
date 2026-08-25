import {getPlannedNeeds} from './money-derived.js';
const DAY_NAMES=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

export const localDate=(value=new Date())=>{
 const date=value instanceof Date?value:new Date(value);
 return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');
};
export const shiftDate=(date,days)=>{const next=new Date(date+'T12:00:00');next.setDate(next.getDate()+days);return localDate(next)};
export const daysUntil=date=>{if(!date)return null;return Math.ceil((new Date(date+'T12:00:00')-new Date(localDate()+'T12:00:00'))/86400000)};
export const formatDate=date=>date?new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric'}).format(new Date(date+'T12:00:00')):'date TBD';

export function workWindowApplies(window,date=localDate()){
 if(!window||window.active===false)return false;
 const day=new Date(date+'T12:00:00').getDay();
 const label=String(window.days||window.label||window.day||'').toLowerCase();
 if(!label)return true;
 if(label.includes('weekday'))return day>=1&&day<=5;
 if(label.includes('weekend'))return day===0||day===6;
 const found=DAY_NAMES.filter(name=>label.includes(name)||label.includes(name.slice(0,3)));
 return found.length?found.includes(DAY_NAMES[day]):false;
}

const sortedBy=(items,key)=>items.filter(item=>item?.[key]).slice().sort((a,b)=>String(a[key]).localeCompare(String(b[key])));
const unfinished=items=>(items||[]).filter(item=>item&&item.status!=='Ready'&&!item.done&&!item.completed);
const titleOf=item=>item?.title||item?.name||item?.label||'Untitled';

export function getPlannerContext(data={},date=localDate()){
 const tasks=Array.isArray(data.tasks)?data.tasks:[];
 const todayTasks=tasks.filter(task=>task.date===date);
 const incompleteToday=todayTasks.filter(task=>!task.done);
 const timedToday=incompleteToday.filter(task=>task.time);
 const urgentToday=incompleteToday.filter(task=>task.urgent);
 const tomorrowTasks=tasks.filter(task=>task.date===shiftDate(date,1)&&!task.done);
 const overdueTasks=tasks.filter(task=>task.date&&task.date<date&&!task.done);
 const plannedNeeds=getPlannedNeeds(data);
 const money=data.money||{};
 const remaining=Math.max(0,Number(money.weeklyGoal||0)-Number(money.weeklyEarned||0));
 const workWindows=(money.workWindows||[]).filter(window=>workWindowApplies(window,date));
 const upcomingMoney=sortedBy(money.upcoming||[],'due').filter(item=>!item.done);
 const projects=data.cosplay?.projects||[];
 const activeCosplay=projects.find(project=>project.id===data.cosplay?.activeId)||projects[0]||null;
 const cosplayPieces=activeCosplay?.pieces||[];
 const unfinishedPieces=unfinished(cosplayPieces);
 const overduePieces=unfinishedPieces.filter(piece=>piece.due&&piece.due<date);
 const dueSoonPieces=unfinishedPieces.filter(piece=>piece.due&&piece.due>=date&&piece.due<=shiftDate(date,7));
 const conventions=data.conventions?.items||[];
 const upcomingConventions=conventions.filter(item=>item.startDate&&item.startDate>=date&&item.status!=='Completed').sort((a,b)=>a.startDate.localeCompare(b.startDate));
 const nearestConvention=upcomingConventions[0]||null;
 const conventionPrep=nearestConvention?[
   ...(nearestConvention.checklist||[]),
   ...(nearestConvention.packing||[])
 ]: [];
 const trips=data.travel?.trips||[];
 const nextTrip=trips.find(trip=>trip.status==='Traveling')||trips.filter(trip=>trip.startDate&&trip.startDate>=date).sort((a,b)=>a.startDate.localeCompare(b.startDate))[0]||null;
 const flights=(nextTrip?.flights||[]).slice().sort((a,b)=>String(a.departureDate||a.date||'9999').localeCompare(String(b.departureDate||b.date||'9999')));
 const nextFlight=flights[0]||null;
 const stays=nextTrip?.stays||[];
 const transport=nextTrip?.transport||nextTrip?.groundTransport||[];
 const tripPacking=nextTrip?.packing||[];
 const creatorItems=data.creator?.items||[];
 const nextShoot=sortedBy(creatorItems,'shootDate').find(item=>item.stage!=='Posted')||null;
 const nextUpload=sortedBy(creatorItems,'uploadDeadline').find(item=>item.stage!=='Posted')||null;
 const overdueContent=creatorItems.filter(item=>item.stage!=='Posted'&&((item.shootDate&&item.shootDate<date)||(item.uploadDeadline&&item.uploadDeadline<date)));
 const stageCounts=['Ideas','To Film','Editing','Ready','Posted'].reduce((all,stage)=>{all[stage]=creatorItems.filter(item=>item.stage===stage).length;return all}, {});
 const routines=data.routines||[];
 const routineSummaries=routines.map(routine=>{
   const steps=routine.steps||[];
   const completion=routine.completion?.[date]||{};
   const done=steps.reduce((count,step,index)=>count+(completion[index]||completion[step?.id]||false?1:0),0);
   return {routine,done,total:steps.length,skipped:Boolean(routine.skipped?.[date]),remaining:Math.max(0,steps.length-done)};
 });
 const wellness=data.wellness?.[date]||null;
 return {
   date,tasks,todayTasks,incompleteToday,timedToday,urgentToday,tomorrowTasks,overdueTasks,
   money:{...money,remaining,workWindows,upcomingMoney,plannedNeeds},
   activeCosplay,cosplayPieces,unfinishedPieces,overduePieces,dueSoonPieces,
   nearestConvention,upcomingConventions,conventionPrep,
   nextTrip,nextFlight,stays,transport,tripPacking,
   creatorItems,nextShoot,nextUpload,overdueContent,stageCounts,
   routines,routineSummaries,wellness
 };
}
