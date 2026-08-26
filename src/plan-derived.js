const pad=value=>String(value).padStart(2,'0');

export function localDate(value=new Date()){
 const date=value instanceof Date?value:new Date(value);
 return date.getFullYear()+'-'+pad(date.getMonth()+1)+'-'+pad(date.getDate());
}

export function parseLocalDate(date){
 return new Date(String(date||localDate())+'T12:00:00');
}

export function shiftDate(date,days){
 const next=parseLocalDate(date);
 next.setDate(next.getDate()+days);
 return localDate(next);
}

export function startOfWeek(date=localDate()){
 const value=parseLocalDate(date);
 const day=value.getDay();
 value.setDate(value.getDate()-(day===0?6:day-1));
 return localDate(value);
}

export function getTasksForDate(tasks,date=localDate()){
 return (Array.isArray(tasks)?tasks:[]).filter(task=>task?.date===date);
}

const hasTime=task=>Boolean(String(task?.time??'').trim());
const timeMinutes=time=>{
 const match=String(time||'').match(/^(\d{1,2}):(\d{2})/);
 return match?Number(match[1])*60+Number(match[2]):Number.MAX_SAFE_INTEGER;
};
const incomplete=task=>!task?.done&&!task?.completed;
const sortScheduled=(a,b)=>timeMinutes(a.time)-timeMinutes(b.time)||String(a.title||'').localeCompare(String(b.title||''));

export function getScheduledTasks(tasks,date=localDate()){
 return getTasksForDate(tasks,date).filter(task=>incomplete(task)&&hasTime(task)).sort(sortScheduled);
}

export function getAnytimeTasks(tasks,date=localDate()){
 return getTasksForDate(tasks,date).filter(task=>incomplete(task)&&!hasTime(task));
}

export function getCompletedTasks(tasks,date=localDate()){
 return getTasksForDate(tasks,date).filter(task=>Boolean(task?.done||task?.completed));
}

export function getTaskMonthCounts(tasks,year,month){
 const counts={};
 (Array.isArray(tasks)?tasks:[]).forEach(task=>{
   const date=String(task?.date||'');
   if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return;
   const value=parseLocalDate(date);
   if(value.getFullYear()===Number(year)&&value.getMonth()===Number(month))counts[date]=(counts[date]||0)+1;
 });
 return counts;
}

export function getHomeTaskPreview(tasks,date=localDate(),limit=3){
 return [...getScheduledTasks(tasks,date),...getAnytimeTasks(tasks,date)].slice(0,Math.max(0,limit));
}

export function getIncompleteTaskCount(tasks,date=localDate()){
 return getScheduledTasks(tasks,date).length+getAnytimeTasks(tasks,date).length;
}

export function taskTimeLabel(task){
 return String(task?.time??'').trim()||'Anytime';
}
