import React,{useMemo,useState} from 'react';
import {
  getCurrentOrNextStay,
  getLinkedConvention,
  getNextFlight,
  getResetDefaults,
  getTravelSummary,
  getTripConfirmationsSummary,
  getTripCountdown,
  getTripDayAgenda,
  getTripPackingByCategory,
  getTripPackingProgress,
  getTripReadiness,
  normalizeTravelRoot,
  normalizeTrip,
  localTravelDate
} from './travel-derived.js';

const Card=({children,className=''})=><section className={'card '+className}>{children}</section>;
const PACKING_CATEGORIES=['Clothes','Toiletries','Cosplay','Tech','Documents','Meds / personal care','Carry-on','Other'];
const TABS=[['overview','Overview'],['flights','Flights'],['stay','Stay & transport'],['plan','Plan'],['packing','Packing'],['confirmations','Confirmations'],['reset','Reset']];
const CHILD_FIELDS={
  flights:['airline','flightNumber','from','to','departureDate','departureTime','arrivalTime','confirmation','terminalGate','seat','notes'],
  stays:['name','address','checkInDate','checkInTime','checkOutDate','checkOutTime','confirmation','notes'],
  transport:['type','date','time','pickup','destination','confirmation','notes'],
  itinerary:['title','date','time','location','type','notes'],
  packing:['title','category','packed'],
  confirmations:['label','value','notes'],
  foodSpots:['name','location','notes'],
  postTripReset:['title','done']
};
const LABELS={flight:'Flight',stay:'Stay',transport:'Transport',itinerary:'Itinerary item',packing:'Packing item',confirmation:'Confirmation',food:'Food spot',postTripReset:'Reset item'};
const fieldLabel=value=>({flightNumber:'Flight number',departureDate:'Departure date',departureTime:'Departure time',arrivalTime:'Arrival time',terminalGate:'Terminal / gate',checkInDate:'Check-in date',checkInTime:'Check-in time',checkOutDate:'Check-out date',checkOutTime:'Check-out time',foodSpots:'Food spot',postTripReset:'Reset item',budgetEstimate:'Budget estimate',linkedConventionId:'Linked convention'}[value]||value.replace(/([A-Z])/g,' $1').replace(/^./,x=>x.toUpperCase()));
const inputType=key=>key.toLowerCase().includes('date')?'date':key.toLowerCase().includes('time')?'time':key==='budgetEstimate'?'number':'text';
const templateItems=list=>(Array.isArray(list)?list:[]).map((item,index)=>typeof item==='string'?{id:'legacy-'+index,title:item,category:'Other'}:{...item,id:item.id??'template-'+index,title:item.title||item.name||'Untitled template',category:item.category||'Other'});

const emptyTrip=()=>({id:null,name:'',destination:'',startDate:'',endDate:'',status:'Planning',linkedConventionId:null,budgetEstimate:0,notes:'',emergencyInfo:'',weatherNote:'',weatherLink:'',flights:[],stays:[],transport:[],itinerary:[],packing:[],confirmations:[],foodSpots:[],postTripReset:getResetDefaults().map((title,index)=>({id:'reset-new-'+Date.now()+'-'+index,title,done:false}))});

function TripForm({value,setValue,conventions,onSave,onCancel}){
  return <Card className="travel-editor"><form className="log-form" onSubmit={event=>{event.preventDefault();onSave(value)}}>
    <h2>{value.id?'Edit trip':'New trip'}</h2>
    {['name','destination','startDate','endDate','budgetEstimate','notes','emergencyInfo','weatherNote','weatherLink'].map(key=><label key={key}>{fieldLabel(key)}{key==='notes'||key==='emergencyInfo'||key==='weatherNote'?<textarea rows="3" value={value[key]||''} onChange={event=>setValue({...value,[key]:event.target.value})}/>:<input type={inputType(key)} min={key==='budgetEstimate'?'0':undefined} value={value[key]??''} onChange={event=>setValue({...value,[key]:event.target.value})}/>}</label>)}
    <small className="muted">Weather note/link are manual planning references, not live weather.</small>
    <label>Status<select value={value.status||'Planning'} onChange={event=>setValue({...value,status:event.target.value})}>{['Planning','Upcoming','Traveling','Complete'].map(item=><option key={item}>{item}</option>)}</select></label>
    <label>Linked convention<select value={value.linkedConventionId??''} onChange={event=>setValue({...value,linkedConventionId:event.target.value?event.target.value:null})}><option value="">None</option>{conventions.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    <div className="form-actions"><button className="primary" type="submit">Save</button><button className="secondary" type="button" onClick={onCancel}>Cancel</button></div>
  </form></Card>;
}

function ChildForm({kind,value,onChange,onSave,onCancel}){
  const fields=CHILD_FIELDS[kind]||[];
  return <Card className="travel-editor"><form className="log-form" onSubmit={event=>{event.preventDefault();onSave(value)}}>
    <h2>{value.id?('Edit '+(LABELS[kind]||kind)):('Add '+(LABELS[kind]||kind))}</h2>
    {fields.map(key=><label key={key}>{fieldLabel(key)}{key==='notes'?<textarea rows="3" value={value[key]||''} onChange={event=>onChange({...value,[key]:event.target.value})}/>:key==='packed'||key==='done'?<span className="inline-check"><input type="checkbox" checked={Boolean(value[key])} onChange={event=>onChange({...value,[key]:event.target.checked})}/> {key==='packed'?'Packed':'Complete'}</span>:key==='category'?<select value={value[key]||'Other'} onChange={event=>onChange({...value,[key]:event.target.value})}>{PACKING_CATEGORIES.map(item=><option key={item}>{item}</option>)}</select>:<input type={inputType(key)} value={value[key]??''} onChange={event=>onChange({...value,[key]:event.target.value})}/>}</label>)}
    <div className="form-actions"><button className="primary" type="submit">Save</button><button className="secondary" type="button" onClick={onCancel}>Cancel</button></div>
  </form></Card>;
}

function TemplateForm({value,onChange,onSave,onCancel}){
  return <Card className="travel-editor"><form className="log-form" onSubmit={event=>{event.preventDefault();onSave(value)}}>
    <h2>{value.id?'Edit packing template':'New packing template'}</h2>
    <label>Title<input required value={value.title||''} onChange={event=>onChange({...value,title:event.target.value})}/></label>
    <label>Category<select value={value.category||'Other'} onChange={event=>onChange({...value,category:event.target.value})}>{PACKING_CATEGORIES.map(item=><option key={item}>{item}</option>)}</select></label>
    <div className="form-actions"><button className="primary">Save</button><button className="secondary" type="button" onClick={onCancel}>Cancel</button></div>
  </form></Card>;
}

function ChildRow({kind,item,onEdit,onDelete,onToggle}){
  const label=item.title||item.name||item.airline||item.label||item.type||'Item';
  const detail=kind==='flight'?[item.from,item.to,item.departureDate,item.departureTime].filter(Boolean).join(' · '):kind==='packing'?(item.category||'Other'):(item.date||item.checkInDate||item.location||item.value||'');
  const checkKey=kind==='packing'?'packed':kind==='postTripReset'?'done':null;
  return <div className="travel-child-row">{checkKey&&<input aria-label={'Toggle '+label} type="checkbox" checked={Boolean(item[checkKey])} onChange={()=>onToggle?.(item,checkKey)}/>}<div className="travel-child-copy"><b>{label}</b><small>{detail}</small></div><div className="card-actions"><button className="edit-action" type="button" onClick={()=>onEdit(item)}>Edit</button><button className="delete-action" type="button" onClick={()=>onDelete(item)}>Delete</button></div></div>;
}

function ChildSection({kind,items,onAdd,onEdit,onDelete,onToggle}){
  return <Card><div className="section-head"><h2>{kind==='postTripReset'?'Post-trip reset':kind==='foodSpots'?'Food spots':kind[0].toUpperCase()+kind.slice(1)}</h2></div>{items.length?items.map(item=><ChildRow key={item.id} kind={kind==='foodSpots'?'food':kind} item={item} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle}/>):<p className="muted">Nothing saved here yet.</p>}<button className="secondary" type="button" onClick={onAdd}>+ Add</button></Card>;
}

export default function TravelCrud({data,setData}){
  const root=useMemo(()=>normalizeTravelRoot(data.travel),[data.travel]);
  const trips=root.trips;
  const conventions=Array.isArray(data.conventions?.items)?data.conventions.items:[];
  const [tripId,setTripId]=useState(root.activeId??trips[0]?.id??null);
  const [tab,setTab]=useState('overview');
  const [tripForm,setTripForm]=useState(null);
  const [childForm,setChildForm]=useState(null);
  const [templateForm,setTemplateForm]=useState(null);
  const [packingFilter,setPackingFilter]=useState('All');
  const trip=trips.find(item=>String(item.id)===String(tripId))||null;
  const selectTrip=nextId=>{setTripId(nextId);setData({...data,travel:{...root,activeId:nextId}})};
  const saveTrips=(next,activeId=tripId)=>{setData({...data,travel:{...root,trips:next,activeId:activeId??null}});setTripId(activeId??null)};
  const saveTrip=next=>saveTrips(trips.map(item=>String(item.id)===String(next.id)?next:item),next.id);
  const removeTrip=current=>{if(!window.confirm('Delete this trip?'))return;const remaining=trips.filter(item=>String(item.id)!==String(current.id));const nextActive=remaining.find(item=>String(item.id)===String(root.activeId))?.id||remaining[0]?.id||null;saveTrips(remaining,nextActive);setTripForm(null)};
  const saveTripForm=value=>{const normalized={...value,id:value.id||'trip-'+Date.now(),budgetEstimate:Number(value.budgetEstimate)||0,postTripReset:Array.isArray(value.postTripReset)?value.postTripReset:[]};const exists=trips.some(item=>String(item.id)===String(normalized.id));saveTrips(exists?trips.map(item=>String(item.id)===String(normalized.id)?normalized:item):[...trips,normalized],normalized.id);setTripForm(null)};
  const openChild=(kind,item)=>setChildForm({kind,...(item||({kind}))});
  const saveChild=value=>{if(!trip)return;const kind=childForm.kind;const key=kind==='food'?'foodSpots':kind;const clean={...value};delete clean.kind;const nextItem={...clean,id:clean.id||'travel-'+Date.now()};const rows=trip[key]||[];const nextRows=clean.id?rows.map(item=>String(item.id)===String(nextItem.id)?nextItem:item):[...rows,nextItem];saveTrip({...trip,[key]:nextRows});setChildForm(null)};
  const removeChild=(kind,item)=>{if(!trip||!window.confirm('Delete this travel item?'))return;const key=kind==='food'?'foodSpots':kind;saveTrip({...trip,[key]:(trip[key]||[]).filter(row=>String(row.id)!==String(item.id))})};
  const toggleChild=(kind,item,key)=>{if(!trip)return;const field=kind==='food'?'foodSpots':kind;saveTrip({...trip,[field]:(trip[field]||[]).map(row=>String(row.id)===String(item.id)?{...row,[key]:!Boolean(row[key])}:row)})};
  const templates=useMemo(()=>templateItems(root.packingTemplates),[root.packingTemplates]);
  const saveTemplates=next=>setData({...data,travel:{...root,packingTemplates:next}});
  const saveTemplate=value=>{const next={...value,id:value.id||'template-'+Date.now()};saveTemplates(templates.some(item=>String(item.id)===String(next.id))?templates.map(item=>String(item.id)===String(next.id)?next:item):[...templates,next]);setTemplateForm(null)};
  const removeTemplate=item=>{if(window.confirm('Delete this packing template?'))saveTemplates(templates.filter(row=>String(row.id)!==String(item.id)))};
  const copyTemplate=()=>{if(!trip||!templates.length)return;const existing=new Set((trip.packing||[]).map(item=>String(item.title).toLowerCase()));const additions=templates.filter(item=>!existing.has(String(item.title).toLowerCase())).map(item=>({id:'packing-'+Date.now()+'-'+Math.random().toString(36).slice(2),title:item.title,category:item.category||'Other',packed:false}));if(additions.length)saveTrip({...trip,packing:[...(trip.packing||[]),...additions]})};
  if(!trip)return <><header><small>More · Travel command center</small><h1>Travel</h1><p>Keep the flight details close and the rest easy to find.</p><button className="primary" type="button" onClick={()=>setTripForm(emptyTrip())}>+ New Trip</button></header>{trips.slice().sort((a,b)=>String(a.startDate||'9999').localeCompare(String(b.startDate||'9999'))).map(item=><Card key={item.id} className="travel-trip-card"><div><h2>{item.name||'Untitled trip'}</h2><p>{item.destination||'Destination TBD'} · {item.startDate||'Dates TBD'}</p><span className="status-chip">{item.status||'Planning'}</span></div><div className="card-actions"><button className="edit-action" type="button" onClick={()=>setTripForm({...normalizeTrip(item),id:item.id})}>Edit</button><button className="primary" type="button" onClick={()=>selectTrip(item.id)}>Open</button><button className="delete-action" type="button" onClick={()=>removeTrip(item)}>Delete</button></div></Card>)}{!trips.length&&<Card className="empty-state"><strong>No trips yet ✨</strong><p>Add one when you know where you’re going.</p></Card>}{tripForm&&<TripForm value={tripForm} setValue={setTripForm} conventions={conventions} onSave={saveTripForm} onCancel={()=>setTripForm(null)}/>}</>;

  const readiness=getTripReadiness(trip,localTravelDate());
  const linkedConvention=getLinkedConvention(trip,conventions);
  const nextFlight=getNextFlight(trip,localTravelDate());
  const stay=getCurrentOrNextStay(trip,localTravelDate());
  const summary=getTravelSummary(root,localTravelDate());
  const packing=getTripPackingProgress(trip);
  const confirmations=getTripConfirmationsSummary(trip);
  const agenda=getTripDayAgenda(trip,localTravelDate());
  const filteredPacking=getTripPackingByCategory(trip,packingFilter);
  return <><header className="travel-detail-header"><div><small>More · Travel command center</small><h1>{trip.name||'Untitled trip'}</h1><p>{trip.destination||'Destination TBD'} · {getTripCountdown(trip,localTravelDate())}{linkedConvention?' · '+linkedConvention.name:''}</p></div><div className="card-actions"><button className="secondary" type="button" onClick={()=>setTripId(null)}>Back</button><button className="edit-action" type="button" onClick={()=>setTripForm({...trip})}>Edit</button><button className="delete-action" type="button" onClick={()=>removeTrip(trip)}>Delete</button></div></header>
    <div className="travel-tabs" role="tablist" aria-label="Travel sections">{TABS.map(([key,label])=><button key={key} type="button" role="tab" aria-selected={tab===key} className={tab===key?'selected-chip':'status-chip'} onClick={()=>setTab(key)}>{label}</button>)}</div>
    {tab==='overview'&&<><Card className="travel-hero"><small>{trip.status||'Planning'} · {trip.startDate||'Dates TBD'}{trip.endDate?' → '+trip.endDate:''}</small><h2>{trip.destination||'Destination TBD'}</h2>{trip.notes&&<p>{trip.notes}</p>}{linkedConvention?<p className="muted">Linked convention: {linkedConvention.name} · {linkedConvention.location||linkedConvention.venue||'Location TBD'}</p>:<p className="muted">No linked convention.</p>}</Card>
      {nextFlight?<Card className="flight-card flight-hero"><span className="eyebrow">Next flight</span><h2>{nextFlight.airline||'Airline TBD'} · {nextFlight.flightNumber||'Flight TBD'}</h2><strong>{nextFlight.from||'???'} → {nextFlight.to||'???'}</strong><p>{nextFlight.departureDate||trip.startDate||'Date TBD'} · {nextFlight.departureTime||'Time TBD'}{nextFlight.arrivalTime?' · arrives '+nextFlight.arrivalTime:''}</p><div className="flight-meta"><span>Confirmation<br/><b>{nextFlight.confirmation||'Not added'}</b></span><span>Terminal / gate<br/><b>{nextFlight.terminalGate||'Not added'}</b></span><span>Seat<br/><b>{nextFlight.seat||'Not added'}</b></span></div><p className="muted">Open Flights to edit details.</p></Card>:<Card className="empty-state"><strong>No flight added yet.</strong><p>Add the details when you have them.</p></Card>}
      {readiness.active&&<Card className="travel-day-card"><h2>Trip-day readiness</h2><p className="muted">Keep the essentials close for today.</p><div className="travel-readiness-grid"><span>Next flight<br/><b>{readiness.flight?.flightNumber||'None'}</b></span><span>Stay<br/><b>{readiness.stay?.name||'None'}</b></span><span>Today<br/><b>{readiness.agenda.length} item{readiness.agenda.length===1?'':'s'}</b></span><span>Packing<br/><b>{packing.packed}/{packing.total}</b></span></div>{readiness.stay?.address&&<p><b>Address:</b> {readiness.stay.address}</p>}{readiness.agenda.length>0&&<div className="travel-agenda">{readiness.agenda.map(item=><div key={item.id}><b>{item.time||'Anytime'} · {item.title||'Trip item'}</b><small>{item.location||''}</small></div>)}</div>}{trip.emergencyInfo&&<p className="travel-emergency"><b>Emergency info:</b> {trip.emergencyInfo}</p>}</Card>}
      <div className="travel-summary-grid"><Card><b>Next/current stay</b><p>{stay?.name||'No stay saved'}</p>{stay?.address&&<small>{stay.address}</small>}</Card><Card><b>Packing</b><p>{packing.packed} / {packing.total} packed</p><small>{packing.remaining} remaining</small></Card><Card><b>Confirmations</b><p>{confirmations.length} reference{confirmations.length===1?'':'s'}</p></Card><Card><b>Budget</b><p>{'$'+Number(trip.budgetEstimate||0).toFixed(2)}</p><small>Planning only</small></Card></div>
      <Card className="weather-card"><h2>Weather planning reference</h2><p>{trip.weatherNote||'No manual weather note yet.'}</p>{trip.weatherLink&&<a href={trip.weatherLink} target="_blank" rel="noreferrer">{trip.weatherLink}</a>}<small className="muted">Not live weather.</small></Card>
    </>}
    {tab==='flights'&&<><ChildSection kind="flights" items={(trip.flights||[]).slice().sort((a,b)=>String(a.departureDate||a.date||'9999').concat(a.departureTime||'').localeCompare(String(b.departureDate||b.date||'9999').concat(b.departureTime||'')))} onAdd={()=>openChild('flights',{airline:'',flightNumber:'',from:'',to:'',departureDate:trip.startDate||'',departureTime:'',arrivalTime:'',confirmation:'',terminalGate:'',seat:'',notes:''})} onEdit={item=>openChild('flights',item)} onDelete={item=>removeChild('flights',item)} /></>}
    {tab==='stay'&&<><ChildSection kind="stays" items={trip.stays||[]} onAdd={()=>openChild('stays',{name:'',address:'',checkInDate:trip.startDate||'',checkInTime:'',checkOutDate:trip.endDate||'',checkOutTime:'',confirmation:'',notes:''})} onEdit={item=>openChild('stays',item)} onDelete={item=>removeChild('stays',item)}/><ChildSection kind="transport" items={trip.transport||[]} onAdd={()=>openChild('transport',{type:'Rideshare',date:trip.startDate||'',time:'',pickup:'',destination:'',confirmation:'',notes:''})} onEdit={item=>openChild('transport',item)} onDelete={item=>removeChild('transport',item)}/></>}
    {tab==='plan'&&<ChildSection kind="itinerary" items={(trip.itinerary||[]).slice().sort((a,b)=>String(a.date||'9999').concat(a.time||'').localeCompare(String(b.date||'9999').concat(b.time||'')))} onAdd={()=>openChild('itinerary',{title:'',date:trip.startDate||'',time:'',location:'',type:'',notes:''})} onEdit={item=>openChild('itinerary',item)} onDelete={item=>removeChild('itinerary',item)}/>}
    {tab==='packing'&&<><Card><div className="travel-pack-head"><div><h2>Trip packing</h2><p>{packing.packed} / {packing.total} packed · {packing.remaining} remaining</p></div><span className="routine-progress">{packing.percentage}%</span></div><div className="chip-row travel-packing-filters">{['All',...PACKING_CATEGORIES].map(category=><button key={category} type="button" className={packingFilter===category?'selected-chip':'status-chip'} onClick={()=>setPackingFilter(category)}>{category}</button>)}</div>{filteredPacking.length?filteredPacking.map(item=><ChildRow key={item.id} kind="packing" item={item} onEdit={row=>openChild('packing',row)} onDelete={row=>removeChild('packing',row)} onToggle={(row,key)=>toggleChild('packing',row,key)}/>):<p className="muted">Nothing in this category yet.</p>}<button className="secondary" type="button" onClick={()=>openChild('packing',{title:'',category:'Other',packed:false})}>+ Add packing item</button></Card><Card><h2>Reusable packing templates</h2>{templates.map(item=><ChildRow key={item.id} kind="packing" item={item} onEdit={row=>setTemplateForm({...row})} onDelete={removeTemplate}/>)}{!templates.length&&<p className="muted">No reusable templates yet.</p>}<div className="form-actions"><button className="secondary" type="button" onClick={()=>setTemplateForm({id:null,title:'',category:'Other'})}>+ New template</button><button className="primary" type="button" onClick={copyTemplate}>Copy template items</button></div></Card></>}
    {tab==='confirmations'&&<><Card><h2>Confirmation summary</h2>{confirmations.length?confirmations.map(item=><div className="travel-confirmation-row" key={item.id}><b>{item.label}</b><strong>{item.value}</strong>{item.notes&&<small>{item.notes}</small>}</div>):<p className="muted">No confirmations saved yet.</p>}</Card><ChildSection kind="confirmations" items={trip.confirmations||[]} onAdd={()=>openChild('confirmations',{label:'',value:'',notes:''})} onEdit={item=>openChild('confirmations',item)} onDelete={item=>removeChild('confirmations',item)}/><ChildSection kind="foodSpots" items={trip.foodSpots||[]} onAdd={()=>openChild('food',{name:'',location:'',notes:''})} onEdit={item=>openChild('food',item)} onDelete={item=>removeChild('food',item)}/></>}
    {tab==='reset'&&<><ChildSection kind="postTripReset" items={trip.postTripReset||[]} onAdd={()=>openChild('postTripReset',{title:'',done:false})} onEdit={item=>openChild('postTripReset',item)} onDelete={item=>removeChild('postTripReset',item)} onToggle={(item,key)=>toggleChild('postTripReset',item,key)}/><Card><p className="muted">Reset items are independent of trip status. Finish them at your own pace.</p></Card></>}
    {tripForm&&<TripForm value={tripForm} setValue={setTripForm} conventions={conventions} onSave={value=>{saveTrip({...value,id:trip.id,budgetEstimate:Number(value.budgetEstimate)||0});setTripForm(null)}} onCancel={()=>setTripForm(null)}/>}
    {childForm&&<ChildForm kind={childForm.kind} value={childForm} onChange={value=>setChildForm(value)} onSave={saveChild} onCancel={()=>setChildForm(null)}/>}
    {templateForm&&<TemplateForm value={templateForm} onChange={setTemplateForm} onSave={saveTemplate} onCancel={()=>setTemplateForm(null)}/>}
  </>;
}
