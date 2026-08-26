import React,{useMemo,useState} from 'react';
import {getApplicableWorkWindows,getPlannedNeeds,getTodayMoneyTargetSummary,toMoneyNumber} from './money-derived.js';
import {getHomeTaskPreview,getIncompleteTaskCount,getTasksForDate,localDate,shiftDate,taskTimeLabel} from './plan-derived.js';
import CosplayThumbnail from './CosplayThumbnail.jsx';
import {getNextCosplayPiece,getPrimaryReference,getProjectProgress,getRemainingPieces,getTargetDateLabel} from './cosplay-derived.js';
import {getUpcomingConventions} from './convention-derived.js';
import {getWellnessHomeSummary} from './wellness-derived.js';
import ModePicker from './ModePicker.jsx';
import {getEffectiveMode,getModeHomeFocus} from './mode-derived.js';

const Card=({children,className=''})=><section className={'card '+className}>{children}</section>;
const money=value=>String.fromCharCode(36)+toMoneyNumber(value).toFixed(2);
const dateText=date=>new Intl.DateTimeFormat(undefined,{weekday:'long',month:'long',day:'numeric'}).format(new Date(date+'T12:00:00'));


function ModeFocus({mode,focus,setScreen,onShowFull}){
 const open=screen=>setScreen?.(screen);
 if(mode==='low-energy'){
  const low=focus.lowEnergy||{};
  const summary=low.summary||{};
  return <Card className="mode-focus mode-focus-low"><div className="mode-focus-title"><span>Low-Energy</span><b>Today can be smaller.</b></div><div className="mode-focus-stats"><span>Water <b>{summary.waterOz||0} / {summary.goalOz||64} oz</b></span><span>Food <b>{summary.meals||0} logged</b></span><span>Energy <b>{low.wellness?.energy||'Not set'}</b></span></div>{low.tasks?.length>0&&<p><b>One essential:</b> {low.tasks[0].title}</p>}{low.routines?.[0]?.lowEnergySteps?.length>0&&<p><b>Tiny routine:</b> {low.routines[0].lowEnergySteps.map(step=>step.text).join(', ')}</p>}{low.reminders?.length>0&&<p><b>Important:</b> {low.reminders[0].title}</p>}<div className="mode-focus-actions"><button type="button" className="secondary" onClick={()=>open('wellness')}>Open Wellness</button><button type="button" className="ghost" onClick={onShowFull}>Show full Home</button></div></Card>;
 }
 if(mode==='con-prep'||mode==='con-day'){
  const con=focus.convention?.item;
  const prep=focus.convention?.prep;
  if(!con)return <Card className="mode-focus"><b>{mode==='con-day'?'Con Day':'Con Prep'}</b><p className="muted">No convention is linked yet.</p><button type="button" className="secondary" onClick={()=>open('conventions')}>Open Conventions</button></Card>;
  return <Card className="mode-focus"><div className="mode-focus-title"><span>{mode==='con-day'?'Con Day':'Con Prep'}</span><b>{con.name}</b></div><p>{focus.convention.days===0?'Today':focus.convention.days>0?focus.convention.days+' days away':'In progress'} · {con.location||con.venue||'Location TBD'}</p>{mode==='con-prep'&&<p><b>Next prep:</b> {(prep?.suggestions||[]).slice(0,3).join(' · ')}</p>}{mode==='con-day'&&<p><b>Con Day essentials:</b> {(focus.convention.essentials||[]).slice(0,3).map(item=>item.label+' · '+item.state).join(' · ')}</p>}<button type="button" className="primary" onClick={()=>open('conventions')}>{mode==='con-day'?'Open Con Day':'Open Con Prep'}</button></Card>;
 }
 if(mode==='travel'){
  const trip=focus.travel?.trip;
  const flight=focus.travel?.nextFlight;
  return <Card className="mode-focus"><div className="mode-focus-title"><span>Travel</span><b>{trip?.name||trip?.destination||'Travel command center'}</b></div><p>{flight?'Next flight: '+(flight.airline||'Flight')+' '+(flight.flightNumber||'')+(flight.departureTime?' · '+flight.departureTime:''):'No flight details saved yet.'}</p>{focus.travel?.nextStay&&<p><b>Stay:</b> {focus.travel.nextStay.name||'Saved lodging'}</p>}<button type="button" className="primary" onClick={()=>open('travel')}>Open Travel</button></Card>;
 }
 if(mode==='work-money'){
  const mission=focus.money?.mission||{};
  return <Card className="mode-focus"><div className="mode-focus-title"><span>Work Money</span><b>${mission.earned?.toFixed?.(2)||'0.00'} / ${mission.goal?.toFixed?.(2)||'0.00'}</b></div><p>{mission.remaining||0} left · {mission.daysRemaining||0} days remaining · Suggested ${Number(mission.suggestedPerDay||0).toFixed(2)} / day</p><p>{focus.money?.windows?.length?focus.money.windows.map(item=>(item.label||'Work window')+' '+(item.start||'flexible')+'–'+(item.end||'flexible')).join(' · '):'No work window applies today.'}</p><button type="button" className="primary" onClick={()=>open('money')}>Open Money</button></Card>;
 }
 if(mode==='reset'){
  const reset=focus.reset||{};
  return <Card className="mode-focus"><div className="mode-focus-title"><span>Reset Day</span><b>A gentle reset, one thing at a time.</b></div>{reset.overdue?.length>0&&<p><b>Carry forward:</b> {reset.overdue[0].title}</p>}{reset.routines?.length>0&&<p><b>Reset ritual:</b> {reset.routines[0].routine.name}</p>}{reset.postTrip?.length>0&&<p><b>Trip reset:</b> {reset.postTrip[0].title}</p>}{!reset.overdue?.length&&!reset.routines?.length&&!reset.postTrip?.length&&<p className="muted">No reset items are waiting right now.</p>}<button type="button" className="secondary" onClick={()=>open('plan')}>Open Plan</button></Card>;
 }
 if(mode==='creator'){
  const creator=focus.creator?.focus||{};
  return <Card className="mode-focus"><div className="mode-focus-title"><span>Creator Day</span><b>Studio focus</b></div><p>{creator.shoots?.length||0} shoots · {creator.edits?.length||0} edits · {creator.posts?.length||0} posting deadlines</p>{creator.shoots?.[0]&&<p><b>Next shoot:</b> {creator.shoots[0].title}</p>}{creator.edits?.[0]&&<p><b>Editing queue:</b> {creator.edits[0].title}</p>}<button type="button" className="primary" onClick={()=>open('creator')}>Open Creator HQ</button></Card>;
 }
 return null;
}

function HomeTaskRow({task,onToggle}){
 return <div className={'home-task-row '+(task.urgent?'urgent-task':'')}><input aria-label={'Complete '+task.title} type="checkbox" checked={Boolean(task.done||task.completed)} onChange={onToggle}/><span className="task-copy"><b>{task.title}</b><small>{taskTimeLabel(task)}</small></span>{task.urgent&&<span className="urgent">Urgent</span>}</div>;
}

export default function HomeCommand({data,setData,setScreen}){
 const [showFullHome,setShowFullHome]=useState(false);
 const today=localDate(),tasks=data.tasks||[],preview=getHomeTaskPreview(tasks,today,3),incompleteCount=getIncompleteTaskCount(tasks,today),planned=getPlannedNeeds(data),m=data.money||{},available=toMoneyNumber(m.availableToday),earnedToday=toMoneyNumber(m.earnedToday),weeklyEarned=toMoneyNumber(m.weeklyEarned),weeklyGoal=toMoneyNumber(m.weeklyGoal),weeklyRemaining=Math.max(0,weeklyGoal-weeklyEarned),displayName=data.settings?.displayName||'Nyxie',hour=new Date().getHours(),greeting=hour<12?'Good morning':hour<17?'Good afternoon':'Good evening',project=(data.cosplay?.projects||[]).find(item=>item.id===data.cosplay?.activeId)||null,nextPiece=getNextCosplayPiece(project),remainingPieces=getRemainingPieces(project).length,progress=getProjectProgress(project),creatorItems=data.creator?.items||[],stageCounts=['To Film','Editing','Ready'].map(stage=>[stage,creatorItems.filter(item=>item.stage===stage).length]),nextShoot=creatorItems.filter(item=>item.shootDate>=today).sort((a,b)=>a.shootDate.localeCompare(b.shootDate))[0],nextUpload=creatorItems.filter(item=>item.uploadDeadline>=today).sort((a,b)=>a.uploadDeadline.localeCompare(b.uploadDeadline))[0],conventions=data.conventions?.items||[],nearest=getUpcomingConventions(conventions,today)[0],trip=(data.travel?.trips||[]).find(item=>item.status==='Traveling')||(data.travel?.trips||[]).filter(item=>item.startDate&&item.startDate>=today).sort((a,b)=>a.startDate.localeCompare(b.startDate))[0],wellnessSummary=getWellnessHomeSummary(data.wellness,today),routines=data.routines||[],routineDone=routines.reduce((count,routine)=>count+(routine.completion?.[today]?Object.values(routine.completion[today]).filter(Boolean).length:0),0),routineTotal=routines.reduce((count,routine)=>count+(routine.steps||[]).length,0),days=useMemo(()=>Array.from({length:7},(_,index)=>shiftDate(today,index)),[today]),windows=data.money||{},mode=getEffectiveMode(data,today),modeFocus=getModeHomeFocus(data,today,mode);
 const toggleTask=task=>{const nextDone=!Boolean(task.done||task.completed);setData({...data,tasks:tasks.map(item=>item.id===task.id?{...item,done:nextDone,completed:false}:item)})};
 const dayLabel=day=>new Intl.DateTimeFormat(undefined,{weekday:'short',month:'numeric',day:'numeric'}).format(new Date(day+'T12:00:00'));
 const contentFor=day=>creatorItems.flatMap(item=>[{label:'Shoot · '+item.title,date:item.shootDate},{label:'Upload · '+item.title,date:item.uploadDeadline}].filter(entry=>entry.date===day));
 return <><header className="home-header"><div><small>{dateText(today)}</small><h1>{greeting}, {displayName} ✨</h1></div></header>
  <ModePicker data={data} setData={setData} date={today}/>
  <ModeFocus mode={mode} focus={modeFocus} setScreen={setScreen} onShowFull={()=>setShowFullHome(true)}/>
  <button type="button" className="yuu yuu-button" onClick={()=>setScreen('yuu')}><div className="yuu-avatar">Y</div><div><b>Yuu-Kun</b><p>Yare yare. {incompleteCount} things need you today.</p></div></button>
  {mode==='low-energy'&&!showFullHome?null:<>
  <Section title="Today"/>
  <Card className="home-today-card"><div className="section-title-row"><b>{incompleteCount?incompleteCount+' tasks waiting':'Nothing urgent waiting'}</b><small>{dateText(today)}</small></div>{preview.length?preview.map(task=><HomeTaskRow key={task.id} task={task} onToggle={()=>toggleTask(task)}/>):<p className="plan-empty">Your list is clear today ✨</p>}{incompleteCount>preview.length&&<small className="more-tasks">+{incompleteCount-preview.length} more</small>}<button type="button" className="primary" onClick={()=>setScreen('plan')}>Open Plan</button></Card>
  <Section title="Money Today"/>
  <Card className="money-home"><div className="money-home-top"><div><small>Available Today</small><strong>{money(available)}</strong></div><div className="money-home-earned"><span>Earned today<br/><b>{money(earnedToday)}</b></span><span>Weekly Mission<br/><b>{money(weeklyEarned)} / {money(weeklyGoal)}</b></span></div></div><div className="money-home-bottom"><span>{money(weeklyRemaining)} left to goal</span>{planned.total>0&&<span>{money(planned.total)} planned needs</span>}<span>{getTodayMoneyTargetSummary(m,today).hasCustomTarget?'Target '+money(getTodayMoneyTargetSummary(m,today).target):''}</span></div><button type="button" className="primary" onClick={()=>setScreen('money')}>Open Money</button></Card>
  <Section title="Current Cosplay"/>
  <Card className="home-cosplay-card">{project?<><div className="home-cosplay-summary"><CosplayThumbnail reference={getPrimaryReference(project)} /><div><b>{project.name}</b><small>{progress}% ready · {remainingPieces} piece{remainingPieces===1?'':'s'} left</small><small>{project.targetEvent||'No target convention'}{project.targetDate?' · '+(getTargetDateLabel(project.targetDate)||project.targetDate):''}</small></div></div>{nextPiece&&<p className="next-piece"><b>Next:</b> {nextPiece.name}{nextPiece.due?' · due '+nextPiece.due:''}{nextPiece.urgent?' · Urgent':''}</p>}<button type="button" className="secondary" onClick={()=>setScreen('cosplay')}>Open Cosplay</button></>:<><div className="cosplay-thumb cosplay-thumb-placeholder">✿</div><b>No active cosplay yet ✨</b><small>Choose a project to track readiness here.</small><button type="button" className="secondary" onClick={()=>setScreen('cosplay')}>Open Cosplay</button></>}</Card>
  <Section title="Coming Up"/><Card><b>{nearest?.name||'No upcoming conventions yet.'}</b>{nearest&&<small>{nearest.startDate} · {nearest.location||nearest.venue||''}</small>}</Card>
  <Card className="home-quick-add"><div className="section-title-row"><h2>Quick Add</h2><small>Jump to the canonical editor</small></div><div className="quick-add-actions"><button type="button" className="primary" onClick={()=>setScreen('plan')}>+ Add task</button><button type="button" className="secondary" onClick={()=>setScreen('money')}>Log money</button><button type="button" className="secondary" onClick={()=>setScreen('cosplay')}>Add cosplay piece</button></div></Card>
  <details className="home-weekly"><summary>Weekly Planner</summary><div className="week-strip">{days.map(day=><button type="button" className={'day-card '+(day===today?'selected':'')} onClick={()=>setScreen('plan')} key={day}><b>{dayLabel(day)}</b>{getTasksForDate(tasks,day).slice(0,4).map(task=><small className="week-chip task-chip" key={task.id}>{taskTimeLabel(task)} · {task.title}</small>)}{getApplicableWorkWindows(windows,day).filter(window=>day!==today||window.checkin?.status!=='skipped').map((window,index)=><small className="week-chip work-chip" key={'w'+index}>✦ Work {(window.start||'')+'–'+(window.end||'')}</small>)}{contentFor(day).map((entry,index)=><small className="week-chip content-chip" key={'c'+index}>✧ {entry.label}</small>)}</button>)}</div></details>
  <Section title="Creator HQ"/><Card className="creator-feature"><b>Creative studio</b><div className="money-stats">{stageCounts.map(([stage,count])=><div key={stage}><small>{stage}</small><b>{count}</b></div>)}</div><small>{nextShoot?'Next shoot · '+nextShoot.shootDate:'No shoot planned'}{nextUpload?' · Upload '+nextUpload.uploadDeadline:''}</small><button type="button" className="primary" onClick={()=>setScreen('creator')}>Open Creator HQ</button></Card>
  <Section title="Your World"/><div className="placeholder-grid"><Portal title="Conventions" text={nearest?nearest.name+' · '+nearest.startDate:'No upcoming convention'} onClick={()=>setScreen('conventions')}/><Portal title="Travel" text={trip?trip.destination+' · '+trip.startDate:'No upcoming trip'} onClick={()=>setScreen('travel')}/><Portal title="Wellness" text={wellnessSummary.label} onClick={()=>setScreen('wellness')}/><Portal title="Routines" text={routineTotal?routineDone+'/'+routineTotal+' steps':'No routines'} onClick={()=>setScreen('routines')}/><Portal title="Yuu-Kun" text="Open your bratty guide" onClick={()=>setScreen('yuu')}/><Portal title="Settings" text={(data.settings?.displayName||'Nyxie')+' · Yuu '+(data.settings?.yuuEnabled===false?'off':'on')} onClick={()=>setScreen('settings')}/></div>

  </>} </>;
}
function Section({title}){return <div className="section-head"><h2>{title}</h2></div>}
function Portal({title,text,onClick}){return <Card><button type="button" className="project-card-button" onClick={onClick}><b>{title}</b><small>{text}</small></button></Card>}
