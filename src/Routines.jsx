import React,{useMemo,useState} from 'react';
import {
  getApplicableRoutines,
  getRoutineLowEnergySteps,
  getRoutineRecurrenceLabel,
  getRoutineTodaySummary,
  localRoutineDate,
  normalizeRoutine,
  normalizeRoutineStep,
  shiftRoutineDate
} from './routine-derived.js';
import {isLowEnergyDay} from './wellness-derived.js';

const CATEGORIES=['Daily Life','Reset','Work','Creator','Convention','Travel','Wellness','Other'];
const RECURRENCES=[['daily','Daily'],['weekdays','Weekdays'],['weekends','Weekends'],['selected','Selected weekdays'],['manual','Manual']];
const WEEKDAYS=[['1','Mon'],['2','Tue'],['3','Wed'],['4','Thu'],['5','Fri'],['6','Sat'],['0','Sun']];

const Card=({children,className=''})=><section className={'card routine-card '+className}>{children}</section>;
const formatDate=date=>new Intl.DateTimeFormat(undefined,{weekday:'long',month:'short',day:'numeric'}).format(new Date(date+'T12:00:00'));

function RoutineEditor({draft,onChange,onSave,onCancel}){
  const recurrence=draft.recurrence||{type:'daily',days:[]};
  const setRecurrence=next=>onChange({...draft,recurrence:{...recurrence,...next}});
  return <Card className="routine-editor"><h2>{draft.id?'Edit routine':'New routine'}</h2>
    <label>Name<input required value={draft.name||''} onChange={e=>onChange({...draft,name:e.target.value})}/></label>
    <label>Category<select value={draft.category||'Daily Life'} onChange={e=>onChange({...draft,category:e.target.value})}>{CATEGORIES.map(item=><option key={item}>{item}</option>)}</select></label>
    <label>Recurrence<select value={recurrence.type||'daily'} onChange={e=>setRecurrence({type:e.target.value,days:e.target.value==='selected'?(recurrence.days||[]):[]})}>{RECURRENCES.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
    {recurrence.type==='selected'&&<fieldset className="routine-weekdays"><legend>Applies on</legend><div>{WEEKDAYS.map(([value,label])=><label key={value}><input type="checkbox" checked={(recurrence.days||[]).map(String).includes(value)} onChange={e=>{const days=new Set((recurrence.days||[]).map(String));e.target.checked?days.add(value):days.delete(value);setRecurrence({days:[...days].map(Number)})}}/><span>{label}</span></label>)}</div></fieldset>}
    <label className="inline-check"><input type="checkbox" checked={draft.active!==false} onChange={e=>onChange({...draft,active:e.target.checked})}/>Active</label>
    <label>Notes<textarea rows="3" value={draft.notes||''} onChange={e=>onChange({...draft,notes:e.target.value})}/></label>
    <div className="form-actions"><button className="primary" type="button" onClick={onSave}>Save</button><button className="secondary" type="button" onClick={onCancel}>Cancel</button></div>
  </Card>;
}

function StepEditor({draft,onChange,onSave,onCancel}){
  return <Card className="routine-editor routine-step-editor"><h3>{draft.id?'Edit step':'Add step'}</h3>
    <label>Step<input required value={draft.text||''} onChange={e=>onChange({...draft,text:e.target.value})}/></label>
    <label className="inline-check"><input type="checkbox" checked={Boolean(draft.lowEnergy)} onChange={e=>onChange({...draft,lowEnergy:e.target.checked})}/>Tiny version step</label>
    <div className="form-actions"><button className="primary" type="button" onClick={onSave}>Save</button><button className="secondary" type="button" onClick={onCancel}>Cancel</button></div>
  </Card>;
}

function RoutineCard({summary,date,lowEnergy,showFull,setShowFull,onToggleStep,onAddStep,onEditStep,onDeleteStep,onSkip,onTryTomorrow}){
  const {routine}=summary;
  const tinySteps=getRoutineLowEnergySteps(routine);
  const tinyMode=lowEnergy&&!showFull;
  const visibleSteps=tinyMode?tinySteps:routine.steps;
  return <Card>
    <div className="routine-card-head"><div><h2>{routine.name}</h2><div className="chip-row"><span className="status-chip">{routine.category}</span><span className="status-chip">{getRoutineRecurrenceLabel(routine)}</span>{routine.active===false&&<span className="status-chip">Paused</span>}</div></div><span className="routine-progress">{summary.completed} / {summary.total}<small>{summary.percentage}%</small></span></div>
    {summary.skipped&&<p className="routine-skipped">Skipped for today{summary.skipNote?': '+summary.skipNote:''}.</p>}
    {lowEnergy&&<div className="routine-low-energy"><strong>Today can be the tiny version.</strong>{!tinySteps.length&&!showFull&&<span>No tiny version set yet.</span>}{tinySteps.length>0&&!showFull&&<span>Showing marked tiny steps.</span>}{showFull&&<span>Showing the full routine.</span>}<button className="secondary" type="button" onClick={()=>setShowFull(!showFull)}>{showFull?'Show tiny version':'Show full routine'}</button></div>}
    {!visibleSteps.length?<p className="muted">No steps yet. Add one when you are ready.</p>:<div className="routine-steps">{visibleSteps.map((step,index)=>{const actualIndex=routine.steps.findIndex(item=>normalizeRoutineStep(item,index).id===step.id);const complete=summary.routine.completion?.[localRoutineDate(date)]?.[step.id]===true||summary.routine.completion?.[localRoutineDate(date)]?.[String(step.id)]===true||summary.routine.completion?.[localRoutineDate(date)]?.[actualIndex]===true||summary.routine.completion?.[localRoutineDate(date)]?.[String(actualIndex)]===true;return <div className="routine-step-row" key={step.id||index}><label><input type="checkbox" checked={complete} onChange={()=>onToggleStep(routine,step,actualIndex,!complete)}/><span className={complete?'is-complete':''}>{step.text||'Untitled step'}</span></label><div className="card-actions"><button className="edit-action" type="button" aria-label={'Edit '+step.text} onClick={()=>onEditStep(routine,step,actualIndex)}>Edit</button><button className="delete-action" type="button" aria-label={'Delete '+step.text} onClick={()=>onDeleteStep(routine,step,actualIndex)}>Delete</button></div></div>})}</div>}
    <div className="routine-card-actions"><button className="secondary" type="button" onClick={()=>onAddStep(routine)}>+ Add step</button>{!summary.skipped?<button className="ghost-action" type="button" onClick={()=>onSkip(routine)}>Skip today</button>:<button className="secondary" type="button" onClick={()=>onTryTomorrow(routine)}>Try tomorrow</button>}</div>
  </Card>;
}

export default function Routines({data,setData}){
  const rawRoutines=Array.isArray(data.routines)?data.routines:[];
  const [view,setView]=useState('today');
  const [selectedDate,setSelectedDate]=useState(localRoutineDate());
  const [filter,setFilter]=useState('All');
  const [routineDraft,setRoutineDraft]=useState(null);
  const [stepDraft,setStepDraft]=useState(null);
  const [expanded,setExpanded]=useState({});
  const lowEnergy=isLowEnergyDay(data.wellness,selectedDate);
  const normalized=useMemo(()=>rawRoutines.map(normalizeRoutine),[rawRoutines]);
  const todayRoutines=useMemo(()=>getApplicableRoutines(rawRoutines,selectedDate),[rawRoutines,selectedDate]);
  const todaySummaries=useMemo(()=>todayRoutines.map(routine=>getRoutineTodaySummary(routine,selectedDate)),[todayRoutines,selectedDate]);
  const allRoutines=useMemo(()=>normalized.filter(routine=>filter==='All'||(filter==='Active'?routine.active:!routine.active)),[normalized,filter]);
  const saveRoutines=next=>setData({...data,routines:next});
  const saveRoutine=()=>{
    if(!routineDraft?.name?.trim())return;
    const existing=rawRoutines.find(item=>String(item.id)===String(routineDraft.id));
    const next={...(existing||{}),...routineDraft,id:routineDraft.id??'routine-'+Date.now(),name:routineDraft.name.trim(),active:routineDraft.active!==false,category:routineDraft.category||'Daily Life',recurrence:{type:routineDraft.recurrence?.type||'daily',days:Array.isArray(routineDraft.recurrence?.days)?routineDraft.recurrence.days:[]},steps:existing?.steps||routineDraft.steps||[],completion:existing?.completion||{},skipped:existing?.skipped||{},skipNotes:existing?.skipNotes||{},carryForward:existing?.carryForward||{}};
    saveRoutines(existing?rawRoutines.map(item=>String(item.id)===String(next.id)?next:item):[...rawRoutines,next]);setRoutineDraft(null);
  };
  const deleteRoutine=routine=>{if(window.confirm('Delete this routine and its history?'))saveRoutines(rawRoutines.filter(item=>String(item.id)!==String(routine.id)))};
  const toggleActive=routine=>saveRoutines(rawRoutines.map(item=>String(item.id)===String(routine.id)?{...item,active:item.active===false}:item));
  const updateRoutineForDate=(routine,date,updater)=>saveRoutines(rawRoutines.map(item=>String(item.id)===String(routine.id)?updater(item,date):item));
  const toggleStep=(routine,step,index,checked)=>updateRoutineForDate(routine,selectedDate,source=>{const completion={...(source.completion||{})};const day={...(completion[selectedDate]||{})};const key=typeof source.steps?.[index]==='string'?index:step.id;day[key]=checked;completion[selectedDate]=day;return {...source,completion}});
  const skipRoutine=routine=>{const note=window.prompt('What happened? (optional)')||'';updateRoutineForDate(routine,selectedDate,source=>({...source,skipped:{...(source.skipped||{}),[selectedDate]:true},skipNotes:{...(source.skipNotes||{}),[selectedDate]:note}}))};
  const tryTomorrow=routine=>{const tomorrow=shiftRoutineDate(selectedDate,1);updateRoutineForDate(routine,tomorrow,source=>({...source,carryForward:{...(source.carryForward||{}),[tomorrow]:true}}));setSelectedDate(tomorrow)};
  const saveStep=()=>{
    if(!stepDraft?.draft?.text?.trim())return;
    const routine=rawRoutines.find(item=>String(item.id)===String(stepDraft.routineId));if(!routine)return;
    const steps=[...(routine.steps||[])];const value={...(stepDraft.draft),id:stepDraft.draft.id||'step-'+Date.now(),text:stepDraft.draft.text.trim(),lowEnergy:Boolean(stepDraft.draft.lowEnergy)};
    if(stepDraft.index===null)steps.push(value);else steps[stepDraft.index]=value;
    saveRoutines(rawRoutines.map(item=>String(item.id)===String(routine.id)?{...item,steps}:item));setStepDraft(null);
  };
  const deleteStep=(routine,step,index)=>{if(window.confirm('Delete this step?'))saveRoutines(rawRoutines.map(item=>String(item.id)===String(routine.id)?{...item,steps:(item.steps||[]).filter((_,i)=>i!==index)}:item))};
  const routineEditor=routineDraft&&<RoutineEditor draft={routineDraft} onChange={setRoutineDraft} onSave={saveRoutine} onCancel={()=>setRoutineDraft(null)}/>;
  const stepEditor=stepDraft&&<StepEditor draft={stepDraft.draft} onChange={draft=>setStepDraft({...stepDraft,draft})} onSave={saveStep} onCancel={()=>setStepDraft(null)}/>;
  return <><header><small>More · Gentle rituals</small><h1>Routines</h1><p>Flexible support for the days that need it.</p></header>
    <div className="routine-tabs" role="tablist" aria-label="Routine views"><button className={view==='today'?'primary':'secondary'} role="tab" aria-selected={view==='today'} onClick={()=>setView('today')}>Today</button><button className={view==='all'?'primary':'secondary'} role="tab" aria-selected={view==='all'} onClick={()=>setView('all')}>All</button></div>
    {view==='today'?<><div className="routine-date-nav"><button className="secondary" type="button" onClick={()=>setSelectedDate(shiftRoutineDate(selectedDate,-1))} aria-label="Previous day">‹</button><label><span>Selected day</span><input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value||localRoutineDate())}/><strong>{formatDate(selectedDate)}</strong></label><button className="secondary" type="button" onClick={()=>setSelectedDate(shiftRoutineDate(selectedDate,1))} aria-label="Next day">›</button></div>
      {lowEnergy&&<Card className="routine-energy-banner"><strong>Low-energy day</strong><span>Today can be the tiny version.</span></Card>}
      {todaySummaries.length?todaySummaries.map(summary=><RoutineCard key={summary.routine.id} summary={summary} date={selectedDate} lowEnergy={lowEnergy} showFull={Boolean(expanded[summary.routine.id])} setShowFull={value=>setExpanded({...expanded,[summary.routine.id]:value})} onToggleStep={toggleStep} onAddStep={routine=>setStepDraft({routineId:routine.id,index:null,draft:{text:'',lowEnergy:false}})} onEditStep={(routine,step,index)=>setStepDraft({routineId:routine.id,index,draft:normalizeRoutineStep((routine.steps||[])[index],index)})} onDeleteStep={deleteStep} onSkip={skipRoutine} onTryTomorrow={tryTomorrow}/>):<Card className="empty-state"><strong>No routines apply on this day ✨</strong><p>Flexible means the quiet days count too.</p><button className="secondary" type="button" onClick={()=>setView('all')}>View all routines</button></Card>}
    </>:<><div className="routine-filter-row"><div className="chip-row" role="group" aria-label="Routine filters">{['All','Active','Paused'].map(item=><button key={item} type="button" className={filter===item?'selected-chip':'status-chip'} onClick={()=>setFilter(item)}>{item}</button>)}</div><button className="primary" type="button" onClick={()=>setRoutineDraft({id:null,name:'',category:'Daily Life',active:true,recurrence:{type:'daily',days:[]},steps:[],notes:''})}>+ New routine</button></div>
      {allRoutines.map(routine=><Card key={routine.id}><div className="routine-card-head"><div><h2>{routine.name}</h2><div className="chip-row"><span className="status-chip">{routine.category}</span><span className="status-chip">{getRoutineRecurrenceLabel(routine)}</span>{routine.active===false&&<span className="status-chip">Paused</span>}</div></div><div className="card-actions"><button className="edit-action" type="button" onClick={()=>setRoutineDraft({...routine})}>Edit</button><button className="delete-action" type="button" onClick={()=>deleteRoutine(routine)}>Delete</button></div></div><p className="muted">{routine.steps.length} step{routine.steps.length===1?'':'s'} · {routine.active===false?'Paused':'Active'}</p><div className="routine-steps">{routine.steps.map((step,index)=><div className="routine-step-row" key={step.id||index}><span>{step.text||'Untitled step'}{step.lowEnergy?' · tiny':''}</span><div className="card-actions"><button className="edit-action" type="button" onClick={()=>setStepDraft({routineId:routine.id,index,draft:normalizeRoutineStep((routine.steps||[])[index],index)})}>Edit</button><button className="delete-action" type="button" onClick={()=>deleteStep(routine,step,index)}>Delete</button></div></div>)}</div><button className="secondary" type="button" onClick={()=>setStepDraft({routineId:routine.id,index:null,draft:{text:'',lowEnergy:false}})}>+ Add step</button><button className="secondary" type="button" onClick={()=>toggleActive(routine)}>{routine.active===false?'Activate':'Pause'}</button></Card>)}
      {!allRoutines.length&&<Card className="empty-state"><strong>No routines yet ✨</strong><p>Add a gentle ritual whenever it supports you.</p></Card>}
    </>}
    {routineEditor}{stepEditor}
    {view==='today'&&<button className="primary" type="button" onClick={()=>{setView('all');setRoutineDraft({id:null,name:'',category:'Daily Life',active:true,recurrence:{type:'daily',days:[]},steps:[],notes:''})}}>+ New routine</button>}
  </>;
}
