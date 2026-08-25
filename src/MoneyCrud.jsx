import React,{useState} from 'react';
import {getPlannedNeeds,toMoneyNumber} from './money-derived.js';

const Card=({children,className=''})=><section className={'card '+className}>{children}</section>;
const currency=value=>'$'+toMoneyNumber(value).toFixed(2);
const today=()=>new Date().toLocaleDateString('en-CA');

function SourceButton({label,screen,setScreen}){
 if(!setScreen)return null;
 return <button type="button" className="secondary tiny-action" onClick={()=>setScreen(screen)}>{label}</button>;
}

function PlannedNeeds({data,setScreen}){
 const planned=getPlannedNeeds(data);
 const cosplayRows=planned.cosplay.projects.filter(project=>project.estimatedTotal>0||project.remainingNeed>0);
 const conventionRows=planned.conventions.items;
 const travelRows=planned.travel.trips;
 const hasBreakdown=cosplayRows.length||conventionRows.length||travelRows.length||planned.manualUpcoming>0;
 return <>
  <Card className="planned-needs-card">
   <div className="derived-hero-label"><small>PLANNED NEEDS</small><span>Read-only planning view</span></div>
   <strong className="planned-needs-total">{currency(planned.total)}</strong>
   <p className="muted">What you still have planned across your planner.</p>
   {hasBreakdown?<div className="derived-summary-list">
    {planned.cosplay.remainingNeed>0&&<div><span>Cosplay remaining</span><b>{currency(planned.cosplay.remainingNeed)}</b></div>}
    {planned.conventions.total>0&&<div><span>Conventions</span><b>{currency(planned.conventions.total)}</b></div>}
    {planned.travel.total>0&&<div><span>Travel</span><b>{currency(planned.travel.total)}</b></div>}
    {planned.manualUpcoming>0&&<div><span>Manual upcoming</span><b>{currency(planned.manualUpcoming)}</b></div>}
   </div>:<p className="empty-derived">No big planned expenses yet ✨</p>}
   <div className="derived-shortcuts">
    <SourceButton label="Open Cosplay" screen="cosplay" setScreen={setScreen}/>
    <SourceButton label="Open Conventions" screen="conventions" setScreen={setScreen}/>
    <SourceButton label="Open Travel" screen="travel" setScreen={setScreen}/>
   </div>
  </Card>
  {cosplayRows.length>0&&<Card className="derived-breakdown-card">
   <div className="section-title-row"><h2>Cosplay estimates</h2><small>Estimated, not paid accounting</small></div>
   {cosplayRows.map(project=><div className="derived-money-row" key={project.id||project.name}><div><b>{project.name}</b><small>{currency(project.estimatedTotal)} estimated · {currency(project.remainingNeed)} estimated remaining</small></div><strong>{currency(project.remainingNeed)}</strong></div>)}
   <div className="derived-total-row"><span>Cosplay estimated total</span><b>{currency(planned.cosplay.estimatedTotal)}</b></div>
   <div className="derived-total-row"><span>Cosplay remaining</span><b>{currency(planned.cosplay.remainingNeed)}</b></div>
  </Card>}
  {conventionRows.length>0&&<Card className="derived-breakdown-card">
   <div className="section-title-row"><h2>Conventions</h2><small>Active planned budgets</small></div>
   {conventionRows.map(item=><div className="derived-money-row" key={item.id||item.name}><div><b>{item.name}</b><small>Planned budget</small></div><strong>{currency(item.planned)}</strong></div>)}
   <div className="derived-total-row"><span>Convention planned total</span><b>{currency(planned.conventions.total)}</b></div>
  </Card>}
  {travelRows.length>0&&<Card className="derived-breakdown-card">
   <div className="section-title-row"><h2>Travel</h2><small>Active planned budgets</small></div>
   {travelRows.map(item=><div className="derived-money-row" key={item.id||item.name}><div><b>{item.name}</b><small>Planned budget</small></div><strong>{currency(item.planned)}</strong></div>)}
   <div className="derived-total-row"><span>Travel planned total</span><b>{currency(planned.travel.total)}</b></div>
  </Card>}
  {planned.manualUpcoming>0&&<Card className="derived-breakdown-card">
   <div className="section-title-row"><h2>Manual upcoming</h2><small>Money items you entered</small></div>
   <div className="derived-total-row"><span>Manual upcoming total</span><b>{currency(planned.manualUpcoming)}</b></div>
  </Card>}
 </>;
}

export default function MoneyCrud({data,setData,setScreen}){
 const m=data.money||{},[tx,setTx]=useState(null),[windowEdit,setWindowEdit]=useState(null),[upcomingEdit,setUpcomingEdit]=useState(null),transactions=m.transactions||[],windows=m.workWindows||[],upcoming=m.upcoming||[];
 const save=patch=>setData({...data,money:{...m,...patch}});
 const apply=(old,n)=>{
  let weekly=Number(m.weeklyEarned||0),earnedToday=Number(m.earnedToday||0),available=Number(m.availableToday||0),b={...m.buckets};
  if(old?.kind==='earned'){weekly-=Number(old.amount);if(old.date===today())earnedToday-=Number(old.amount)}
  if(old?.kind==='spent'){available+=Number(old.amount);b[old.source]=(b[old.source]||0)+Number(old.amount)}
  if(n?.kind==='earned'){weekly+=Number(n.amount);if(n.date===today())earnedToday+=Number(n.amount)}
  if(n?.kind==='spent'){available-=Number(n.amount);b[n.source]=(b[n.source]||0)-Number(n.amount)}
  save({weeklyEarned:weekly,earnedToday,availableToday:available,buckets:b,transactions:n?[...transactions.filter(x=>x.id!==n.id),n]:transactions.filter(x=>x.id!==old?.id)});
 };
 const listEditor=(value,setter,items,key)=>{
  const submit=e=>{e.preventDefault();const n={...value,id:value.id||Date.now()};save({[key]:value.id?items.map(x=>x.id===n.id?n:x):[...items,n]});setter(null)};
  return <Card><form className="log-form" onSubmit={submit}>{Object.keys(value).filter(k=>k!=='id').map(k=><label key={k}>{k}<input type={k.toLowerCase().includes('date')?'date':k==='amount'?'number':'text'} value={value[k]??''} onChange={e=>setter({...value,[k]:e.target.value})}/></label>)}<button className="primary">Save</button><button type="button" className="secondary" onClick={()=>setter(null)}>Cancel</button></form></Card>;
 };
 const goal=toMoneyNumber(m.weeklyGoal),earned=toMoneyNumber(m.weeklyEarned),goalRemaining=Math.max(0,goal-earned),progress=goal?Math.min(100,Math.max(0,earned/goal*100)):0;
 return <><header><small>Money magic</small><h1>Money</h1></header>
  <Card className="money-hero">
   <small>Available Today</small>
   <strong>{currency(m.availableToday)}</strong>
   <p>Usable money for today · still editable</p>
   <label>Available Today<input className="hero-input" type="number" value={m.availableToday??0} onChange={e=>save({availableToday:Number(e.target.value)||0})}/></label>
  </Card>
  <Card className="money-mission">
   <div className="money-hero-label"><small>WEEKLY MONEY MISSION</small><b>{currency(earned)} / {currency(goal)}</b></div>
   <div className="progress"><i style={{width:progress+'%'}}/></div>
   <div className="money-mission-meta"><span>{currency(goalRemaining)} to goal</span><span>{toMoneyNumber(m.daysRemaining)} days remaining</span></div>
   <div className="money-edit-grid"><label>Weekly Goal<input type="number" value={m.weeklyGoal??0} onChange={e=>save({weeklyGoal:Number(e.target.value)||0})}/></label><label>Days Remaining<input type="number" value={m.daysRemaining??0} onChange={e=>save({daysRemaining:Number(e.target.value)||0})}/></label></div>
  </Card>
  <Card><h2>Money buckets</h2><div className="bucket-grid">{['life','con','fun'].map(k=><label className="bucket" key={k}>{k}<input type="number" value={m.buckets?.[k]??0} onChange={e=>save({buckets:{...m.buckets,[k]:Number(e.target.value)||0}})}/></label>)}</div></Card>
  <PlannedNeeds data={data} setScreen={setScreen}/>
  <Card><b>Recent Activity</b>{transactions.map(x=><div className="activity-row" key={x.id}><span>{x.kind} · {'$'}{x.amount} · {x.source}</span><span><button className="edit-action" onClick={()=>setTx({...x})}>Edit</button><button className="delete-action" onClick={()=>{if(window.confirm('Delete transaction?'))apply(x,null)}}>Delete</button></span></div>)}<button className="primary" onClick={()=>setTx({kind:'earned',amount:0,source:'Gig',date:today()})}>+ Log transaction</button></Card>
  {tx&&<Card><form className="log-form" onSubmit={e=>{e.preventDefault();apply(transactions.find(x=>x.id===tx.id),{...tx,id:tx.id||Date.now(),amount:Number(tx.amount)||0});setTx(null)}}><label>Kind<select value={tx.kind} onChange={e=>setTx({...tx,kind:e.target.value})}><option value="earned">Earned</option><option value="spent">Spent</option></select></label><label>Amount<input type="number" value={tx.amount} onChange={e=>setTx({...tx,amount:e.target.value})}/></label><label>Source / bucket<input value={tx.source} onChange={e=>setTx({...tx,source:e.target.value})}/></label><label>Date<input type="date" value={tx.date} onChange={e=>setTx({...tx,date:e.target.value})}/></label><button className="primary">Save</button><button type="button" className="secondary" onClick={()=>setTx(null)}>Cancel</button></form></Card>}
  <Card><h2>Good Work Windows</h2>{windows.map(x=><div className="activity-row" key={x.id}><span>{x.days||x.label||'Flexible'} · {x.start||''}–{x.end||''}</span><span><button className="edit-action" onClick={()=>setWindowEdit({...x})}>Edit</button><button className="delete-action" onClick={()=>{if(window.confirm('Delete work window?'))save({workWindows:windows.filter(y=>y.id!==x.id)})}}>Delete</button></span></div>)}<button className="primary" onClick={()=>setWindowEdit({days:'Weekdays',start:'17:00',end:'21:00',active:true})}>+ Add window</button></Card>
  {windowEdit&&listEditor(windowEdit,setWindowEdit,windows,'workWindows')}
  <Card><h2>Upcoming Money</h2>{upcoming.map(x=><div className="activity-row" key={x.id}><span>{x.title} · {'$'}{x.amount} · {x.due}</span><span><button className="edit-action" onClick={()=>setUpcomingEdit({...x})}>Edit</button><button className="delete-action" onClick={()=>{if(window.confirm('Delete upcoming item?'))save({upcoming:upcoming.filter(y=>y.id!==x.id)})}}>Delete</button></span></div>)}<button className="primary" onClick={()=>setUpcomingEdit({title:'',amount:0,due:'',type:'Goal'})}>+ Add upcoming item</button></Card>
  {upcomingEdit&&listEditor(upcomingEdit,setUpcomingEdit,upcoming,'upcoming')}
 </>;
}
