import React from 'react';
import {getEffectiveMode,getModeLabel,getSuggestedMode,MODE_OPTIONS,normalizeMode} from './mode-derived.js';

export default function ModePicker({data,setData,date}){
 const settings=data.settings||{};
 const selected=normalizeMode(settings.activeMode);
 const suggested=getSuggestedMode(data,date);
 const effective=getEffectiveMode(data,date);
 const update=event=>setData({...data,settings:{...settings,activeMode:normalizeMode(event.target.value)}});
 return <section className="mode-card card" aria-label="NyxieOS mode">
  <div className="mode-card-head"><div><small className="mode-eyebrow">Current focus</small><strong>{getModeLabel(effective)}</strong></div><span className="mode-suggestion">{selected==='auto'?'Auto · '+getModeLabel(suggested):'Manual focus'}</span></div>
  <label className="mode-picker-label">Show today as<select value={selected} onChange={update} aria-label="Choose presentation mode">{MODE_OPTIONS.map(option=><option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
  <small className="muted">Modes change what is prioritized, not your planner data.</small>
 </section>;
}
