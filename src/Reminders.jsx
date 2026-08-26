import React,{useMemo,useState} from 'react';
import {
  getReminderBuckets,
  getReminderOverride,
  localReminderDate,
  normalizeManualReminder,
  normalizeReminderRoot,
  setReminderOverride,
  shiftReminderDate
} from './reminder-derived.js';

const Card=({children,className=''})=><section className={'card reminder-card '+className}>{children}</section>;
const today=()=>localReminderDate();
const emptyReminder=()=>({id:null,title:'',date:today(),time:'',priority:'Normal',category:'General',note:'',done:false});
const fieldLabel={title:'Title',date:'Date',time:'Time (optional)',priority:'Priority',category:'Category',note:'Note (optional)'};

function ManualForm({value,onChange,onSave,onCancel}){
 return <Card className="reminder-editor"><form className="log-form" onSubmit={event=>{event.preventDefault();onSave(value)}}>
  <h2>{value.id?'Edit reminder':'New reminder'}</h2>
  {['title','date','time','priority','category','note'].map(key=><label key={key}>{fieldLabel[key]}{key==='note'?<textarea rows="3" value={value[key]||''} onChange={event=>onChange({...value,[key]:event.target.value})}/>:key==='priority'?<select value={value[key]||'Normal'} onChange={event=>onChange({...value,priority:event.target.value})}><option>Normal</option><option>Important</option></select>:<input required={key==='title'||key==='date'} type={key==='date'?'date':key==='time'?'time':'text'} value={value[key]??''} onChange={event=>onChange({...value,[key]:event.target.value})}/>}</label>)}
  <div className="form-actions"><button className="primary" type="submit">Save</button><button className="secondary" type="button" onClick={onCancel}>Cancel</button></div>
 </form></Card>;
}

function ReminderCard({item,derived,onOpen,onSnooze,onDismiss,onEdit,onDelete,onToggle}){
 return <Card className={item.priority==='Important'?'reminder-important':''}>
  <div className="reminder-head"><div><h2>{item.title}</h2><div className="chip-row"><span className="status-chip">{item.category||item.sourceType}</span><span className="status-chip">{item.sourceType==='manual'?'Manual':item.sourceType}</span>{item.priority==='Important'&&<span className="selected-chip">Important</span>}</div></div><small className="reminder-date">{item.date}{item.time?' · '+item.time:''}</small></div>
  {item.note&&<p className="muted">{item.note}</p>}
  {derived?<div className="card-actions reminder-actions"><button className="secondary" type="button" onClick={()=>onOpen?.(item.open)}>Open source</button><button className="edit-action" type="button" onClick={()=>onSnooze(item)}>Snooze</button><button className="delete-action" type="button" onClick={()=>onDismiss(item)}>Dismiss today</button></div>:<div className="card-actions reminder-actions"><button className="secondary" type="button" onClick={()=>onToggle(item)}>{item.done?'Restore':'Complete'}</button><button className="edit-action" type="button" onClick={()=>onEdit(item)}>Edit</button><button className="delete-action" type="button" onClick={()=>onDelete(item)}>Delete</button></div>}
 </Card>;
}

export default function Reminders({data,setData,setScreen}){
 const root=useMemo(()=>normalizeReminderRoot(data.reminders),[data.reminders]);
 const [view,setView]=useState('today');
 const [form,setForm]=useState(null);
 const buckets=useMemo(()=>getReminderBuckets(data,today()),[data]);
 const manual=useMemo(()=>root.manual.map(normalizeManualReminder),[root.manual]);
 const saveRoot=next=>setData({...data,reminders:next});
 const saveManual=value=>{
  const next={...value,id:value.id||'manual-'+Date.now(),title:value.title.trim(),date:value.date||today(),done:Boolean(value.done)};
  const rows=manual.some(item=>String(item.id)===String(next.id))?manual.map(item=>String(item.id)===String(next.id)?next:item):[...manual,next];
  saveRoot({...root,manual:rows});setForm(null);
 };
 const deleteManual=item=>{if(window.confirm('Delete this reminder?'))saveRoot({...root,manual:manual.filter(row=>String(row.id)!==String(item.id))})};
 const toggleManual=item=>saveRoot({...root,manual:manual.map(row=>String(row.id)===String(item.id)?{...row,done:!row.done}:row)});
 const override=(item,patch)=>saveRoot(setReminderOverride(root,item.id,patch));
 const openSource=screen=>{if(screen)setScreen?.(screen)};
 const list=view==='today'?buckets.today:view==='upcoming'?buckets.upcoming:manual;
 const overdue=view==='today'?buckets.overdue:[];
 return <><header><small>More · Attention center</small><h1>Reminders</h1><p>Useful nudges from the planner, without duplicate records.</p></header>
  <div className="reminder-tabs" role="tablist" aria-label="Reminder views"><button className={view==='today'?'primary':'secondary'} type="button" role="tab" aria-selected={view==='today'} onClick={()=>setView('today')}>Today</button><button className={view==='upcoming'?'primary':'secondary'} type="button" role="tab" aria-selected={view==='upcoming'} onClick={()=>setView('upcoming')}>Upcoming</button><button className={view==='manual'?'primary':'secondary'} type="button" role="tab" aria-selected={view==='manual'} onClick={()=>setView('manual')}>Manual</button></div>
  {view==='manual'&&<button className="primary" type="button" onClick={()=>setForm(emptyReminder())}>+ New reminder</button>}
  {view==='today'&&overdue.length>0&&<><h2 className="reminder-section-title">Overdue</h2>{overdue.map(item=><ReminderCard key={item.id} item={item} derived onOpen={openSource} onSnooze={item=>override(item,{snoozedUntil:shiftReminderDate(today(),1)+'T09:00'})} onDismiss={item=>override(item,{dismissedForDate:today()})}/>)}</>}
  {list.length?list.filter((item,index)=>view!=='today'||!overdue.some(over=>over.id===item.id)).map(item=><ReminderCard key={item.id} item={item} derived={view!=='manual'} onOpen={openSource} onSnooze={item=>override(item,{snoozedUntil:shiftReminderDate(today(),1)+'T09:00'})} onDismiss={item=>override(item,{dismissedForDate:today()})} onEdit={item=>setForm({...item})} onDelete={deleteManual} onToggle={toggleManual}/>):<Card className="empty-state"><strong>{view==='today'?'Nothing needs attention today ✨':view==='upcoming'?'Nothing upcoming yet.':'No manual reminders yet.'}</strong><p>{view==='manual'?'Add a reminder for something that does not belong elsewhere.':'The planner is pleasantly quiet.'}</p></Card>}
  {form&&<ManualForm value={form} onChange={setForm} onSave={saveManual} onCancel={()=>setForm(null)}/>}
 </>;
}
