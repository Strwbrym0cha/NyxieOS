import {getApplicableWorkWindows,getLoggedGigProfit,getPlannedNeeds,getTodayMoneyTargetSummary,getWeeklyMissionSummary,normalizeMoneyRoot,workWindowApplies} from './money-derived.js';
import {getDueSoonPieces,getNextCosplayPiece,getPackedCount,getPrimaryReference,getProjectProgress,getRemainingPieces,isReady,normalizeStatus} from './cosplay-derived.js';
import {getWellnessDay,getWellnessHomeSummary,getWeeklyWellnessSummary} from './wellness-derived.js';
import {normalizeCreatorRoot,getUpcomingCreatorDeadlines,getCreatorReminderItems,getConventionCreatorSummary,getDailyCreatorFocus,getLinkedCollaborators} from './creator-derived.js';
import {getConventionContentSummary,getConventionEssentials,getPrepSuggestions,getTodayPhotoshoots,getTodaySchedule,getUpcomingConventions,getLinkedCosplays} from './convention-derived.js';

export const localDate=(value=new Date())=>{
 const date=value instanceof Date?value:new Date(value);
 return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');
};
export const shiftDate=(date,days)=>{const next=new Date(date+'T12:00:00');next.setDate(next.getDate()+days);return localDate(next)};
export const daysUntil=date=>{if(!date)return null;return Math.ceil((new Date(date+'T12:00:00')-new Date(localDate()+'T12:00:00'))/86400000)};
export const formatDate=date=>date?new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric'}).format(new Date(date+'T12:00:00')):'date TBD';

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
 const money=normalizeMoneyRoot(data.money);
 const mission=getWeeklyMissionSummary(money);
 const targetSummary=getTodayMoneyTargetSummary(money,date);
 const remaining=mission.remaining;
 const workWindows=getApplicableWorkWindows(money,date);
 const upcomingMoney=sortedBy(money.upcoming,'due').filter(item=>!item.done);
 const obligations=sortedBy(money.obligations,'dueDate').filter(item=>item.active!==false);
 const gigProfit=getLoggedGigProfit(money);
 const projects=data.cosplay?.projects||[];
 const activeCosplay=projects.find(project=>project.id===data.cosplay?.activeId)||projects[0]||null;
 const cosplayPieces=activeCosplay?.pieces||[];
 const unfinishedPieces=getRemainingPieces(activeCosplay);
 const overduePieces=unfinishedPieces.filter(piece=>piece.due&&piece.due<date);
 const dueSoonPieces=getDueSoonPieces(activeCosplay,7);
 const cosplayProgress=getProjectProgress(activeCosplay);
 const cosplayNextPiece=getNextCosplayPiece(activeCosplay);
 const cosplayPackedCount=getPackedCount(activeCosplay);
 const cosplayPrimaryReference=getPrimaryReference(activeCosplay);
 const conventions=data.conventions?.items||[];
 const upcomingConventions=getUpcomingConventions(conventions,date);
 const nearestConvention=upcomingConventions[0]||null;
 const conventionPrep=nearestConvention?[...(nearestConvention.checklist||[]),...(nearestConvention.packing||[])]:[];
 const conventionSuggestions=nearestConvention?getPrepSuggestions(nearestConvention):null;
 const conventionSchedule=nearestConvention?getTodaySchedule(nearestConvention,date):[];
 const conventionPhotoshoots=nearestConvention?getTodayPhotoshoots(nearestConvention,date):[];
 const conventionCosplays=nearestConvention?getLinkedCosplays(nearestConvention,data.cosplay?.projects||[]):[];
 const conventionEssentials=nearestConvention?getConventionEssentials(nearestConvention,conventionCosplays):[];
 const conventionContent=nearestConvention?getConventionContentSummary(nearestConvention,data.creator?.items||[]):null;
 const trips=data.travel?.trips||[];
 const nextTrip=trips.find(trip=>trip.status==='Traveling')||trips.filter(trip=>trip.startDate&&trip.startDate>=date).sort((a,b)=>a.startDate.localeCompare(b.startDate))[0]||null;
 const flights=(nextTrip?.flights||[]).slice().sort((a,b)=>String(a.departureDate||a.date||'9999').localeCompare(String(b.departureDate||b.date||'9999')));
 const nextFlight=flights[0]||null;
 const stays=nextTrip?.stays||[];
 const transport=nextTrip?.transport||nextTrip?.groundTransport||[];
 const tripPacking=nextTrip?.packing||[];
 const creatorRoot=normalizeCreatorRoot(data.creator);
 const creatorItems=creatorRoot.items;
 const creatorDeadlines=getUpcomingCreatorDeadlines(creatorRoot,date);
 const nextShoot=creatorDeadlines.find(entry=>entry.field==='shootDate'&&entry.item.stage!=='Posted')?.item||null;
 const nextUpload=creatorDeadlines.find(entry=>entry.field==='uploadDeadline'&&entry.item.stage!=='Posted')?.item||null;
 const overdueContent=creatorItems.filter(item=>item.stage!=='Posted'&&((item.shootDate&&item.shootDate<date)||(item.uploadDeadline&&item.uploadDeadline<date)||(item.reminderAt&&item.reminderAt.slice(0,10)<date)));
 const stageCounts=['Ideas','To Film','Editing','Ready','Posted'].reduce((all,stage)=>{all[stage]=creatorItems.filter(item=>item.stage===stage).length;return all}, {});
 const creatorFocus=getDailyCreatorFocus(creatorRoot,date);
 const creatorReminders=getCreatorReminderItems(creatorRoot,date);
 const creatorConventionSummary=getConventionCreatorSummary(creatorRoot,nearestConvention);
 const creatorCollaborators=creatorRoot.collaborators;
 const routines=data.routines||[];
 const routineSummaries=routines.map(routine=>{
   const steps=routine.steps||[];
   const completion=routine.completion?.[date]||{};
   const done=steps.reduce((count,step,index)=>count+(completion[index]||completion[step?.id]||false?1:0),0);
   return {routine,done,total:steps.length,skipped:Boolean(routine.skipped?.[date]),remaining:Math.max(0,steps.length-done)};
 });
 const wellness=getWellnessDay(data.wellness,date);
 const wellnessSummary=getWellnessHomeSummary(data.wellness,date);
 const weeklyWellness=getWeeklyWellnessSummary(data.wellness,date);
 return {
   date,tasks,todayTasks,incompleteToday,timedToday,urgentToday,tomorrowTasks,overdueTasks,
   money:{...money,remaining,mission,targetSummary,workWindows,upcomingMoney,obligations,gigProfit,plannedNeeds,savingsGoals:money.savingsGoals,debts:money.debts,purchases:money.purchases},
   activeCosplay,cosplayPieces,unfinishedPieces,overduePieces,dueSoonPieces,cosplayProgress,cosplayNextPiece,cosplayPackedCount,cosplayPrimaryReference,
   nearestConvention,upcomingConventions,conventionPrep,conventionSuggestions,conventionSchedule,conventionPhotoshoots,conventionEssentials,conventionContent,
   nextTrip,nextFlight,stays,transport,tripPacking,
   creatorItems,nextShoot,nextUpload,overdueContent,stageCounts,creatorRoot,creatorFocus,creatorReminders,creatorConventionSummary,creatorCollaborators,creatorDeadlines,
   routines,routineSummaries,wellness,wellnessSummary,weeklyWellness
 };
}
