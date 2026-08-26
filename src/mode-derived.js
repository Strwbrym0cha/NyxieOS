import {getApplicableWorkWindows,getLoggedGigProfit,getTodayMoneyTargetSummary,getWeeklyMissionSummary,normalizeMoneyRoot} from './money-derived.js';
import {getActiveConvention,getConventionContentSummary,getConventionEssentials,getLinkedCosplays,getLinkedTrip,getPrepSuggestions,getUpcomingConventions,normalizeConventionStatus} from './convention-derived.js';
import {getTravelSummary,isTripDay} from './travel-derived.js';
import {getWellnessDay,getWellnessHomeSummary} from './wellness-derived.js';
import {getApplicableRoutines,getRoutineTodaySummary} from './routine-derived.js';
import {getReminderBuckets} from './reminder-derived.js';
import {getDailyCreatorFocus,getItemsByStage,normalizeCreatorRoot} from './creator-derived.js';

export const MODE_OPTIONS=[
 {id:'auto',label:'Auto'},
 {id:'normal',label:'Normal Day'},
 {id:'con-prep',label:'Con Prep'},
 {id:'con-day',label:'Con Day'},
 {id:'travel',label:'Travel'},
 {id:'work-money',label:'Work Money'},
 {id:'reset',label:'Reset Day'},
 {id:'low-energy',label:'Low-Energy'},
 {id:'creator',label:'Creator Day'}
];
const MODE_IDS=new Set(MODE_OPTIONS.map(item=>item.id));
const asArray=value=>Array.isArray(value)?value:[];
export const localModeDate=(value=new Date())=>{
 const text=String(value||'');
 if(/^\d{4}-\d{2}-\d{2}$/.test(text))return text;
 const date=value instanceof Date?new Date(value):new Date(value);
 if(Number.isNaN(date.getTime()))return localModeDate(new Date());
 return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');
};
export const normalizeMode=value=>MODE_IDS.has(value)?value:'auto';
export const getModeLabel=value=>MODE_OPTIONS.find(item=>item.id===normalizeMode(value))?.label||'Auto';

const conventionIsToday=(convention,date)=>{
 const status=normalizeConventionStatus(convention?.status);
 return Boolean(convention?.startDate&&status!=='completed'&&date>=convention.startDate&&(!convention.endDate||date<=convention.endDate));
};
const hasMeaningfulPrep=convention=>{
 if(!convention)return false;
 const checklist=asArray(convention.checklist).some(item=>!item?.done);
 const packing=asArray(convention.packing).some(item=>!item?.packed&&!item?.done);
 const content=Number(convention.content?.target||0)>Number(convention.content?.done||0);
 const linked=convention.linkedCosplayIds?.length||convention.cosplayIds?.length||convention.badge||convention.travelPlan||convention.linkedTripId;
 return Boolean(checklist||packing||content||linked);
};

export function getSuggestedMode(data={},date=localModeDate()){
 const day=localModeDate(date);
 const conventions=asArray(data.conventions?.items);
 const activeConvention=conventions.find(item=>conventionIsToday(item,day));
 if(activeConvention)return 'con-day';
 const upcoming=getUpcomingConventions(conventions,day)[0];
 if(upcoming&&hasMeaningfulPrep(upcoming)){
   const days=Math.round((new Date(upcoming.startDate+'T12:00:00')-new Date(day+'T12:00:00'))/86400000);
   if(days<=180)return 'con-prep';
 }
 const travel=getTravelSummary(data.travel,day);
 if(travel.activeTrip&&isTripDay(travel.activeTrip,day))return 'travel';
 const wellness=getWellnessDay(data.wellness,day);
 if(String(wellness.energy||'').trim().toLowerCase()==='low')return 'low-energy';
 const money=normalizeMoneyRoot(data.money);
 const windows=getApplicableWorkWindows(money,day).filter(item=>item.active!==false&&item.checkin?.status!=='skipped');
 if(windows.length)return 'work-money';
 const creator=getDailyCreatorFocus(normalizeCreatorRoot(data.creator),day);
 if(creator.shoots.length||creator.edits.length||creator.posts.length||creator.reminders.length)return 'creator';
 const routines=getApplicableRoutines(data.routines,day);
 const resetRoutines=routines.filter(item=>String(item.category||'').toLowerCase()==='reset');
 const overdue=asArray(data.tasks).some(item=>item?.date&&item.date<day&&!item.done&&!item.completed);
 const postTrip=asArray(data.travel?.trips).some(trip=>['complete','completed'].includes(String(trip?.status||'').toLowerCase())&&asArray(trip.postTripReset).some(item=>!item?.done));
 const reminders=getReminderBuckets(data,day).today.some(item=>String(item.category||'').toLowerCase().includes('reset'));
 if(resetRoutines.length||overdue||postTrip||reminders)return 'reset';
 return 'normal';
}
export const getEffectiveMode=(data={},date=localModeDate())=>{
 const selected=normalizeMode(data.settings?.activeMode);
 return selected==='auto'?getSuggestedMode(data,date):selected;
};

export function getLowEnergyFocus(data={},date=localModeDate()){
 const day=localModeDate(date);
 const wellness=getWellnessDay(data.wellness,day);
 const summary=getWellnessHomeSummary(data.wellness,day);
 const tasks=asArray(data.tasks).filter(item=>item?.date===day&&!item.done&&!item.completed&&(item.urgent||item.time)).slice(0,3);
 const routines=getApplicableRoutines(data.routines,day).map(item=>getRoutineTodaySummary(item,day)).filter(item=>item.lowEnergySteps?.length||item.remaining>0);
 const reminders=getReminderBuckets(data,day).importantToday.slice(0,4);
 return {wellness,summary,tasks,routines,reminders};
}
export function getResetDayFocus(data={},date=localModeDate()){
 const day=localModeDate(date);
 const overdue=asArray(data.tasks).filter(item=>item?.date&&item.date<day&&!item.done&&!item.completed).slice(0,5);
 const carryForward=asArray(data.tasks).filter(item=>item?.date===day&&!item.done&&!item.completed).slice(0,5);
 const routines=getApplicableRoutines(data.routines,day).filter(item=>String(item.category||'').toLowerCase()==='reset').map(item=>getRoutineTodaySummary(item,day));
 const postTrip=asArray(data.travel?.trips).filter(trip=>['complete','completed'].includes(String(trip?.status||'').toLowerCase())).flatMap(trip=>asArray(trip.postTripReset).filter(item=>!item?.done).map(item=>({...item,tripName:trip.name||'Recent trip'}))).slice(0,5);
 const reminders=getReminderBuckets(data,day).today.filter(item=>/reset|home|life/i.test(String(item.category||'')+' '+String(item.title||''))).slice(0,5);
 return {overdue,carryForward,routines,postTrip,reminders};
}
export function getModeHomeFocus(data={},date=localModeDate(),mode=getEffectiveMode(data,date)){
 const effective=normalizeMode(mode)==='auto'?getEffectiveMode(data,date):normalizeMode(mode);
 const day=localModeDate(date);
 const money=normalizeMoneyRoot(data.money);
 const mission=getWeeklyMissionSummary(money);
 const target=getTodayMoneyTargetSummary(money,day);
 const conventions=asArray(data.conventions?.items);
 const convention=getActiveConvention(conventions,data.conventions?.activeId,day);
 const upcoming=getUpcomingConventions(conventions,day)[0]||null;
 const linkedConvention=convention||upcoming;
 const conventionCosplays=linkedConvention?getLinkedCosplays(linkedConvention,asArray(data.cosplay?.projects)):[]; 
 const travel=getTravelSummary(data.travel,day);
 const creator=normalizeCreatorRoot(data.creator);
 const creatorFocus=getDailyCreatorFocus(creator,day);
 const reminders=getReminderBuckets(data,day);
 const wellness=getWellnessHomeSummary(data.wellness,day);
 const routines=getApplicableRoutines(data.routines,day).map(item=>getRoutineTodaySummary(item,day));
 const base={mode:effective,label:getModeLabel(effective),suggestedMode:getSuggestedMode(data,day),money:{mission,target,windows:getApplicableWorkWindows(money,day),gigProfit:getLoggedGigProfit(money)},convention:linkedConvention?{item:linkedConvention,days:linkedConvention.startDate?Math.round((new Date(linkedConvention.startDate+'T12:00:00')-new Date(day+'T12:00:00'))/86400000):null,prep:getPrepSuggestions(linkedConvention),cosplays:conventionCosplays,essentials:getConventionEssentials(linkedConvention,conventionCosplays),content:getConventionContentSummary(linkedConvention,asArray(data.creator?.items)),travel:getLinkedTrip(linkedConvention,asArray(data.travel?.trips))}:null,travel,creator:{focus:creatorFocus,editing:getItemsByStage(creator,'Editing')},wellness,routines,reminders};
 if(effective==='low-energy')return {...base,lowEnergy:getLowEnergyFocus(data,day)};
 if(effective==='reset')return {...base,reset:getResetDayFocus(data,day)};
 if(effective==='con-prep')return {...base,conPrep:base.convention};
 if(effective==='con-day')return {...base,conDay:base.convention};
 if(effective==='travel')return {...base,travelFocus:travel};
 if(effective==='work-money')return {...base,workMoney:base.money};
 if(effective==='creator')return {...base,creatorDay:base.creator};
 return {...base,normal:{tasks:asArray(data.tasks).filter(item=>item?.date===day&&!item.done&&!item.completed).slice(0,3)}};
}
