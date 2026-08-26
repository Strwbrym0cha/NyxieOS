import React,{useMemo,useState} from 'react';
import {getAnytimeTasks,getCompletedTasks,getHomeTaskPreview,getScheduledTasks,getTaskMonthCounts,localDate,parseLocalDate,shiftDate,startOfWeek,taskTimeLabel} from './plan-derived.js';

const Card=({children,className=''})=><section className={'card '+className}>{children}</section>;
const blank={title:'',date:'',time:'',urgent:false,done:false};
const dateLabel=date=>new Intl.DateTimeFormat(undefined,{weekday:'long',month:'long',day:'numeric'}).format(parseLocalDate(date));
const monthLabel=date=>new Intl.DateTimeFormat(undefined,{month:'long',year:'numeric'}).format(parseLocalDate(date));
const shiftMonth=(date,amount)=>{const value=parseLocalDate(date);value.setDate(1);value.setMonth(value.getMonth()+amount);return localDate(value)};
const monthGrid=(monthStart)=>{const first=parseLocalDate(monthStart);const offset=(first.getDay()+6)%7;return Array.from({length:42},(_,index)=>shiftDate(monthStart,index-offset))};

function TaskCard({task,onToggle,onEdit,onDelete,onSkip,canSkip}){
 return <div className={'plan-task-row '+(task.urgent?'urgent-task':'')}>
  <input aria-label={'Complete '+task.title} type="checkbox" checked={Boolean(task.done)} onChange={onToggle}/>
  <div className="task-copy"><b>{task.title}</b><small>{taskTimeLabel(task)}{task.urgent?' · Urgent':''}</small></div>
  <div className="card-actions"><button type="button" className="edit-action tiny-action" onClick={onEdit}>Edit</button>{canSkip&&<button type="button" className="secondary tiny-action" onClick={onSkip}>Skip / Move</button>}<button type="button" className="delete-action tiny-action" onClick={onDelete}>Delete</button></div>
 </div>;
}

function TaskSections({tasks,date,onToggle,onEdit,onDelete,onSkip,includeCompleted=true}){
 const scheduled=getScheduledTasks(tasks,date),anytime=getAnytimeTasks(tasks,date),completed=getCompletedTasks(tasks,date);
 const section=(title,items,empty)=><section className="plan-task-section"><div className="section-title-row"><h2>{title}</h2><small>{items.length}</small></div>{items.length?items.map(task=><TaskCard key={task.id} task={task} onToggle={()=>onToggle(task)} onEdit={()=>onEdit(task)} onDelete={()=>onDelete(task)} onSkip={()=>onSkip(task)} canSkip={date===localDate()}/>):<p className="plan-empty">{empty}</p>}</section>;
 return <>{section('Scheduled',scheduled,'No scheduled things today ✨')}{section('Anytime Today',anytime,'Nothing waiting in Anytime.')}{includeCompleted&&completed.length>0&&<details className="completed-tasks"><summary>Completed ({completed.length})</summary>{completed.map(task=><TaskCard key={task.id} task={task} onToggle={()=>onToggle(task)} onEdit={()=>onEdit(task)} onDelete={()=>onDelete(task)} canSkip={false}/>)}</details>}</>;
}

function SkipPanel({task,note,setNote,onMove,onLeave,onCancel}){
 return <Card className="skip-panel"><h2>What happened?</h2><p className="muted">Add an optional note, then choose what to do with this task.</p><input aria-label="Skip note (optional)" value={note} onChange={event=>setNote(event.target.value)} placeholder="Optional note"/><div className="card-actions"><button type="button" className="primary" onClick={onMove}>Move to tomorrow</button><button type="button" className="secondary" onClick={onLeave}>Leave on today</button><button type="button" className="tiny-action" onClick={onCancel}>Cancel</button></div><small>{task.title}</small></Card>;
}

export default function TaskCrud({data,setData}){
 const tasks=data.tasks||[],today=localDate(),[view,setView]=useState('today'),[selectedDate,setSelectedDate]=useState(today),[monthCursor,setMonthCursor]=useState(today.slice(0,7)+'-01'),[edit,setEdit]=useState(null),[skipTask,setSkipTask]=useState(null),[skipNote,setSkipNote]=useState('');
 const save=next=>setData({...data,tasks:next});
 const toggle=task=>save(tasks.map(item=>item.id===task.id?{...item,done:!item.done}:item));
 const remove=task=>{if(window.confirm('Delete this task?'))save(tasks.filter(item=>item.id!==task.id))};
 const beginEdit=task=>setEdit({...task,time:task.time||''});
 const submit=event=>{event.preventDefault();const next={...edit,id:edit.id||Date.now(),date:edit.date||selectedDate,time:String(edit.time||'').trim()||null,urgent:Boolean(edit.urgent),done:Boolean(edit.done)};save(edit.id?tasks.map(item=>item.id===next.id?next:item):[...tasks,next]);setEdit(null)};
 const beginAdd=()=>setEdit({...blank,date:selectedDate,time:''});
 const beginSkip=task=>{setSkipTask(task);setSkipNote('')};
 const leaveToday=()=>{if(!skipTask)return;const stamp=today;save(tasks.map(item=>item.id===skipTask.id?{...item,lastSkipNote:skipNote.trim(),lastSkippedDate:stamp}:item));setSkipTask(null)};
 const moveTomorrow=()=>{if(!skipTask)return;save(tasks.map(item=>item.id===skipTask.id?{...item,date:shiftDate(today,1),lastSkipNote:skipNote.trim(),lastSkippedDate:today}:item));setSkipTask(null)};
 const toggleTask=task=>toggle(task);
 const deleteTask=task=>remove(task);
 const editTask=task=>beginEdit(task);
 const weekDays=useMemo(()=>Array.from({length:7},(_,index)=>shiftDate(startOfWeek(selectedDate),index)),[selectedDate]);
 const monthDays=useMemo(()=>monthGrid(monthCursor),[monthCursor]);
 const monthCounts=useMemo(()=>getTaskMonthCounts(tasks,parseLocalDate(monthCursor).getFullYear(),parseLocalDate(monthCursor).getMonth()),[tasks,monthCursor]);
 const selectedDetails=<TaskSections tasks={tasks} date={selectedDate} onToggle={toggleTask} onEdit={editTask} onDelete={deleteTask} onSkip={beginSkip}/>;
 return <><header><div><small>Your flexible daybook</small><h1>Plan</h1></div><button type="button" className="primary" onClick={beginAdd}>+ Add task</button></header>
  <div className="segmented plan-tabs">{['today','week','month'].map(option=><button type="button" key={option} className={view===option?'selected':''} onClick={()=>setView(option)}>{option[0].toUpperCase()+option.slice(1)}</button>)}</div>
  {view==='today'&&<><div className="plan-date-nav"><button type="button" className="secondary tiny-action" onClick={()=>setSelectedDate(shiftDate(selectedDate,-1))}>‹</button><strong>{selectedDate===today?'Today · ':''}{dateLabel(selectedDate)}</strong><button type="button" className="secondary tiny-action" onClick={()=>setSelectedDate(shiftDate(selectedDate,1))}>›</button></div>{selectedDetails}</>}
  {view==='week'&&<><div className="week-selector" aria-label="Choose a day">{weekDays.map(day=><button type="button" key={day} className={selectedDate===day?'selected':''} onClick={()=>setSelectedDate(day)}><b>{new Intl.DateTimeFormat(undefined,{weekday:'short'}).format(parseLocalDate(day))}</b><small>{parseLocalDate(day).getDate()}</small></button>)}</div><div className="plan-context"><strong>{dateLabel(selectedDate)}</strong>{selectedDate===today&&<small>Today</small>}</div>{selectedDetails}</>}
  {view==='month'&&<><div className="month-heading"><button type="button" className="secondary tiny-action" onClick={()=>setMonthCursor(shiftMonth(monthCursor,-1))}>‹</button><h2>{monthLabel(monthCursor)}</h2><button type="button" className="secondary tiny-action" onClick={()=>setMonthCursor(shiftMonth(monthCursor,1))}>›</button></div><div className="plan-month-grid">{['M','T','W','T','F','S','S'].map((day,index)=><span className="month-weekday" key={day+index}>{day}</span>)}{monthDays.map(day=>{const inMonth=day.slice(0,7)===monthCursor.slice(0,7),count=monthCounts[day]||0;return <button type="button" key={day} className={'month-day '+(inMonth?'':'outside-month ') +(day===today?'current-day ':'')+(day===selectedDate?'selected ':'')} onClick={()=>setSelectedDate(day)}><span>{parseLocalDate(day).getDate()}</span>{count>0&&<i aria-label={count+' tasks'}>{count}</i>}</button>})}</div><div className="plan-context"><strong>{dateLabel(selectedDate)}</strong>{selectedDate===today&&<small>Today</small>}</div>{selectedDetails}</>}
  {skipTask&&<SkipPanel task={skipTask} note={skipNote} setNote={setSkipNote} onMove={moveTomorrow} onLeave={leaveToday} onCancel={()=>setSkipTask(null)}/>}
  {edit&&<Card><form className="log-form" onSubmit={submit}><label>Title<input required value={edit.title||''} onChange={event=>setEdit({...edit,title:event.target.value})}/></label><label>Date<input type="date" value={edit.date||selectedDate} onChange={event=>setEdit({...edit,date:event.target.value})}/></label><label>Time <small>Optional — leave blank for Anytime Today.</small><input type="time" value={edit.time||''} onChange={event=>setEdit({...edit,time:event.target.value})}/></label><label className="task-row"><input type="checkbox" checked={Boolean(edit.urgent)} onChange={event=>setEdit({...edit,urgent:event.target.checked})}/>Urgent</label><label className="task-row"><input type="checkbox" checked={Boolean(edit.done)} onChange={event=>setEdit({...edit,done:event.target.checked})}/>Completed</label><button className="primary">Save</button><button type="button" className="secondary" onClick={()=>setEdit(null)}>Cancel</button></form></Card>}
 </>;
}
