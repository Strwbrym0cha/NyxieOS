import {getApplicableWorkWindows,getUpcomingObligations} from './money-derived.js';
import {getDueSoonPieces,getRemainingPieces} from './cosplay-derived.js';
import {getUpcomingConventions} from './convention-derived.js';
import {getUpcomingCreatorDeadlines} from './creator-derived.js';
import {getTravelSummary,localTravelDate} from './travel-derived.js';

const DATE_RE=/^\d{4}-\d{2}-\d{2}$/;
const DAY_MS=86400000;
const asArray=value=>Array.isArray(value)?value:[];
const asObject=value=>value&&typeof value==='object'?value:{};
export const localReminderDate=value=>{
  if(typeof value==='string'&&DATE_RE.test(value))return value;
  const date=value instanceof Date?new Date(value):new Date(value);
  if(Number.isNaN(date.getTime()))return localReminderDate(new Date());
  return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');
};
const localNoon=value=>{
  if(typeof value==='string'&&DATE_RE.test(value))return new Date(Number(value.slice(0,4)),Number(value.slice(5,7))-1,Number(value.slice(8,10)),12);
  const date=value instanceof Date?new Date(value):new Date(value||new Date());date.setHours(12,0,0,0);return date;
};
export const shiftReminderDate=(value,amount)=>{const date=localNoon(value);date.setDate(date.getDate()+Number(amount||0));return localReminderDate(date)};
const dateTime=(date,time='')=>String(date||'9999-12-31')+'T'+(time||'23:59');
const datePart=value=>{const text=String(value||'');return DATE_RE.test(text.slice(0,10))?text.slice(0,10):''};
const timePart=value=>{const text=String(value||'');return text.includes('T')?text.slice(11,16):''};
export function normalizeReminderRoot(raw){
  const source=asObject(raw);
  return {...source,manual:asArray(source.manual),overrides:asObject(source.overrides)};
}
export function normalizeManualReminder(reminder,index=0){
  const source=asObject(reminder);
  return {...source,id:source.id??'manual-'+index,title:source.title||'Untitled reminder',date:source.date||localReminderDate(),time:source.time||'',priority:source.priority||'Normal',category:source.category||'General',note:source.note||'',done:Boolean(source.done)};
}
function reminder(id,title,sourceType,sourceId,date,time,extra={}){
  return {id:String(id),title,sourceType,sourceId,date:date||localReminderDate(),time:time||'',priority:extra.priority||'Normal',category:extra.category||sourceType,note:extra.note||'',open:extra.open};
}
function obligationDate(item,date){
  if(item?.dueDate&&DATE_RE.test(String(item.dueDate).slice(0,10)))return String(item.dueDate).slice(0,10);
  const day=Math.max(1,Math.min(28,Number(item?.dueDay)||0));if(!day)return '';
  const base=localNoon(date);const candidate=new Date(base.getFullYear(),base.getMonth(),day,12);
  if(candidate<base)candidate.setMonth(candidate.getMonth()+1);
  return localReminderDate(candidate);
}
function inWindow(itemDate,today,horizon=60){
  if(!itemDate)return false;
  const diff=Math.round((localNoon(itemDate)-localNoon(today))/DAY_MS);
  return diff<=horizon;
}
function applyOverrides(items,root,date){
  const today=localReminderDate(date);
  return items.filter(item=>{
    const override=root.overrides?.[item.id]||{};
    if(override.dismissedForDate===today)return false;
    if(override.snoozedUntil){
      const snoozeDate=datePart(override.snoozedUntil)||localReminderDate(override.snoozedUntil);
      if(snoozeDate===today){
        const until=String(override.snoozedUntil).includes('T')?String(override.snoozedUntil).slice(11,16):'23:59';
        const now=new Date();const current=now.getHours()*60+now.getMinutes();const target=Number(until.slice(0,2))*60+Number(until.slice(3,5));
        if(current<target)return false;
      } else if(snoozeDate>today)return false;
    }
    return true;
  });
}
export function getManualReminders(raw,date=localReminderDate()){
  return normalizeReminderRoot(raw).manual.map(normalizeManualReminder).filter(item=>!item.done).filter(item=>inWindow(item.date,date)).map(item=>({...item,sourceType:'manual',sourceId:item.id}));
}
export function getDerivedReminders(data={},date=localReminderDate()){
  const today=localReminderDate(date);const items=[];
  asArray(data.tasks).forEach(task=>{
    if(task?.done||!task?.date||!inWindow(task.date,today))return;
    const isOverdue=task.date<today;const isToday=task.date===today;
    if(isOverdue||isToday&&(task.urgent||task.time))items.push(reminder('task:'+task.id+':'+task.date,task.title||'Untitled task','task',task.id,task.date,task.time,{priority:isOverdue||task.urgent?'Important':'Normal',category:'Plan',open:'plan'}));
  });
  const money=data.money||{};
  getUpcomingObligations(money).forEach(item=>{
    const due=obligationDate(item,today);if(!inWindow(due,today)||!due)return;
    items.push(reminder('obligation:'+item.id+':'+due,(item.title||'Money obligation')+' due','money',item.id,due,'',{priority:due===today?'Important':'Normal',category:item.type||'Money',open:'money'}));
  });
  getApplicableWorkWindows(money,today).forEach(window=>{
    if(window.checkin?.status==='skipped')return;
    items.push(reminder('work:'+window.id+':'+today,'Work window'+(window.label?' · '+window.label:''),'workWindow',window.id,today,window.start,{category:'Money',open:'money'}));
  });
  asArray(data.cosplay?.projects).forEach(project=>getDueSoonPieces(project,14).forEach(piece=>{
    if(!piece.due||!inWindow(piece.due,today,14))return;
    items.push(reminder('cosplay:'+project.id+':'+piece.id+':'+piece.due,(project.name||'Cosplay')+' · '+(piece.name||'Piece')+' due','cosplay',project.id,piece.due,'',{priority:piece.urgent||piece.due===today?'Important':'Normal',category:'Cosplay',open:'cosplay'}));
  }));
  getUpcomingConventions(data.conventions?.items||[],today).slice(0,4).forEach(convention=>{
    items.push(reminder('convention:'+convention.id+':'+convention.startDate,convention.name||'Convention','convention',convention.id,convention.startDate,'',{priority:convention.startDate===today?'Important':'Normal',category:'Convention',open:'conventions'}));
    asArray(convention.schedule).forEach(item=>{
      const due=item.date||convention.startDate;if(!inWindow(due,today))return;
      items.push(reminder('convention-schedule:'+convention.id+':'+item.id, item.title||'Convention schedule item','conventionSchedule',convention.id,due,item.time,{category:'Convention',open:'conventions'}));
    });
  });
  const travel=getTravelSummary(data.travel,today);const trip=travel.trip;
  if(trip){
    if(trip.startDate&&inWindow(trip.startDate,today))items.push(reminder('trip:'+trip.id+':'+trip.startDate,trip.name||trip.destination||'Trip starts','travel',trip.id,trip.startDate,'',{priority:trip.startDate===today?'Important':'Normal',category:'Travel',open:'travel'}));
    asArray(trip.flights).forEach(flight=>{const due=flight.departureDate||flight.date;if(inWindow(due,today))items.push(reminder('flight:'+trip.id+':'+flight.id,due===today?'Flight today':'Upcoming flight · '+(flight.flightNumber||''),'travelFlight',trip.id,due,flight.departureTime,{priority:due===today?'Important':'Normal',category:'Travel',open:'travel'}))});
    asArray(trip.transport).forEach(item=>{if(inWindow(item.date,today))items.push(reminder('transport:'+trip.id+':'+item.id,item.type||'Ground transport','travelTransport',trip.id,item.date,item.time,{category:'Travel',open:'travel'}))});
    asArray(trip.itinerary).forEach(item=>{if(inWindow(item.date,today))items.push(reminder('itinerary:'+trip.id+':'+item.id,item.title||'Trip itinerary','travelItinerary',trip.id,item.date,item.time,{category:'Travel',open:'travel'}))});
  }
  const creator=data.creator||{};
  getUpcomingCreatorDeadlines(creator,today).slice(0,20).forEach(entry=>{
    const due=datePart(entry.date)||datePart(entry.item?.[entry.field]);if(!due||!inWindow(due,today))return;
    items.push(reminder('creator:'+entry.item.id+':'+entry.field+':'+due,(entry.item.title||'Creator item')+' · '+(entry.field==='uploadDeadline'?'upload deadline':entry.field==='shootDate'?'shoot':'edit'), 'creator',entry.item.id,due,timePart(entry.item?.[entry.field]),{priority:due===today?'Important':'Normal',category:'Creator',open:'creator'}));
  });
  return items.filter((item,index,list)=>list.findIndex(other=>other.id===item.id)===index);
}
export function getAllReminders(data={},date=localReminderDate()){
  const root=normalizeReminderRoot(data.reminders);return applyOverrides([...getDerivedReminders(data,date),...getManualReminders(root,date)],root,date).sort((a,b)=>dateTime(a.date,a.time).localeCompare(dateTime(b.date,b.time)));
}
export function getTodayReminders(data={},date=localReminderDate()){
  const today=localReminderDate(date);return getAllReminders(data,today).filter(item=>item.date<=today);
}
export function getUpcomingReminders(data={},date=localReminderDate()){
  const today=localReminderDate(date);return getAllReminders(data,today).filter(item=>item.date>today);
}
export function getReminderBuckets(data={},date=localReminderDate()){
  const all=getAllReminders(data,date);const today=localReminderDate(date);
  return {all,today:all.filter(item=>item.date<=today),upcoming:all.filter(item=>item.date>today),overdue:all.filter(item=>item.date<today),importantToday:all.filter(item=>item.date<=today&&item.priority==='Important')};
}
export function getReminderOverride(raw,id){
  return normalizeReminderRoot(raw).overrides?.[String(id)]||{};
}
export function setReminderOverride(raw,id,patch){
  const root=normalizeReminderRoot(raw);return {...root,overrides:{...root.overrides,[String(id)]:{...root.overrides?.[String(id)],...patch}}};
}
