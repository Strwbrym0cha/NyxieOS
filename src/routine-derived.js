const DATE_RE=/^\\d{4}-\\d{2}-\\d{2}$/;
const DAY_NAMES=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAY_SHORT=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export function localRoutineDate(value=new Date()){
  if(typeof value==='string'&&DATE_RE.test(value))return value;
  const date=value instanceof Date?new Date(value):new Date(value);
  if(Number.isNaN(date.getTime()))return localRoutineDate(new Date());
  return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');
}
function localNoon(value){
  if(typeof value==='string'&&DATE_RE.test(value))return new Date(Number(value.slice(0,4)),Number(value.slice(5,7))-1,Number(value.slice(8,10)),12);
  const date=value instanceof Date?new Date(value):new Date(value||new Date());
  date.setHours(12,0,0,0);
  return date;
}
export function shiftRoutineDate(value,amount){const date=localNoon(value);date.setDate(date.getDate()+Number(amount||0));return localRoutineDate(date)}

const normalizeType=value=>String(value||'daily').trim().toLowerCase().replace(/[ _-]+/g,'');
function dayIndex(value){
  if(typeof value==='number'&&value>=0&&value<=6)return value;
  const text=String(value||'').trim().toLowerCase();
  const index=DAY_NAMES.findIndex(day=>day.toLowerCase()===text);
  if(index>=0)return index;
  const short=DAY_SHORT.findIndex(day=>day.toLowerCase()===text.slice(0,3));
  return short>=0?short:null;
}
export function normalizeRoutineStep(step,index=0){
  if(typeof step==='string')return {id:'legacy-'+index,text:step,lowEnergy:false,legacyIndex:index};
  const source=step&&typeof step==='object'?step:{};
  return {...source,id:source.id??'step-'+index,text:String(source.text??source.name??''),lowEnergy:Boolean(source.lowEnergy),legacyIndex:source.legacyIndex??index};
}
export function normalizeRoutine(routine,index=0){
  const source=routine&&typeof routine==='object'?routine:{};
  const recurrenceSource=source.recurrence&&typeof source.recurrence==='object'?source.recurrence:{};
  const type=normalizeType(recurrenceSource.type||source.recurrenceType||'daily');
  const days=Array.isArray(recurrenceSource.days)?recurrenceSource.days.map(dayIndex).filter(day=>day!==null):[];
  return {
    ...source,
    id:source.id??'routine-'+index,
    name:String(source.name||'Untitled routine'),
    category:source.category||'Daily Life',
    active:source.active!==false,
    recurrence:{...recurrenceSource,type,days},
    steps:Array.isArray(source.steps)?source.steps.map(normalizeRoutineStep):[],
    completion:source.completion&&typeof source.completion==='object'?source.completion:{},
    skipped:source.skipped&&typeof source.skipped==='object'?source.skipped:{},
    skipNotes:source.skipNotes&&typeof source.skipNotes==='object'?source.skipNotes:{},
    carryForward:source.carryForward&&typeof source.carryForward==='object'?source.carryForward:{},
    notes:source.notes||''
  };
}
export function routineAppliesToDate(routine,date=localRoutineDate()){
  const item=normalizeRoutine(routine);
  if(!item.active)return false;
  const dateKey=localRoutineDate(date);
  if(item.carryForward?.[dateKey])return true;
  const weekday=localNoon(date).getDay();
  switch(item.recurrence.type){
    case 'manual': return false;
    case 'weekdays': return weekday>=1&&weekday<=5;
    case 'weekends': return weekday===0||weekday===6;
    case 'selected':
    case 'selecteddays':
    case 'selectedweekday':
    case 'selectedweekdays':
      return item.recurrence.days.includes(weekday);
    case 'weekly':
      return item.recurrence.days.length?item.recurrence.days.includes(weekday):true;
    default:return true;
  }
}
export function getApplicableRoutines(routines,date=localRoutineDate()){
  const dateKey=localRoutineDate(date);
  return (Array.isArray(routines)?routines:[]).map(normalizeRoutine).filter(routine=>routine.active&&(routineAppliesToDate(routine,dateKey)||Boolean(routine.carryForward?.[dateKey])));
}
export function getRoutineCompletion(routine,date=localRoutineDate()){
  const item=normalizeRoutine(routine);
  const value=item.completion?.[localRoutineDate(date)];
  return value&&typeof value==='object'?value:{};
}
export function isRoutineStepComplete(routine,step,index,date=localRoutineDate()){
  const completion=getRoutineCompletion(routine,date);
  const keys=[step?.id,step?.legacyId,step?.legacyIndex,index].filter(key=>key!==undefined&&key!==null);
  return keys.some(key=>completion[key]===true||completion[String(key)]===true);
}
export function getRoutineProgress(routine,date=localRoutineDate(),steps){
  const item=normalizeRoutine(routine);
  const list=Array.isArray(steps)?steps.map(normalizeRoutineStep):item.steps;
  const completed=list.reduce((count,step,index)=>count+(isRoutineStepComplete(item,step,index,date)?1:0),0);
  return {completed,total:list.length,percentage:list.length?Math.round(completed/list.length*100):0};
}
export function getRoutineRemainingSteps(routine,date=localRoutineDate(),steps){
  const item=normalizeRoutine(routine);
  const list=Array.isArray(steps)?steps.map(normalizeRoutineStep):item.steps;
  return list.filter((step,index)=>!isRoutineStepComplete(item,step,index,date));
}
export function getRoutineLowEnergySteps(routine){
  return normalizeRoutine(routine).steps.filter(step=>step.lowEnergy);
}
export function getRoutineRecurrenceLabel(routine){
  const item=normalizeRoutine(routine);
  const type=item.recurrence.type;
  if(type==='weekdays')return 'Weekdays';
  if(type==='weekends')return 'Weekends';
  if(type==='manual')return 'Manual';
  if(['selected','selecteddays','selectedweekday','selectedweekdays','weekly'].includes(type)){
    const labels=(item.recurrence.days||[]).map(day=>DAY_SHORT[day]).filter(Boolean);
    return labels.length?'Selected: '+labels.join(', '):'Selected days';
  }
  return 'Daily';
}
export function getRoutineTodaySummary(routine,date=localRoutineDate()){
  const item=normalizeRoutine(routine);
  const progress=getRoutineProgress(item,date);
  const lowEnergySteps=getRoutineLowEnergySteps(item);
  return {
    routine:item,
    ...progress,
    remaining:getRoutineRemainingSteps(item,date),
    skipped:Boolean(item.skipped?.[localRoutineDate(date)]),
    skipNote:item.skipNotes?.[localRoutineDate(date)]||'',
    carriedForward:Boolean(item.carryForward?.[localRoutineDate(date)]),
    lowEnergySteps,
    applicable:routineAppliesToDate(item,date)||Boolean(item.carryForward?.[localRoutineDate(date)])
  };
}
