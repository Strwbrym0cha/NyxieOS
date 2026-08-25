import {formatDate,daysUntil,getPlannerContext} from './yuu-context.js';
import {toMoneyNumber} from './money-derived.js';

const pick=(items,seed=0)=>items[Math.abs(seed)%items.length];
const money=value=>String.fromCharCode(36)+toMoneyNumber(value).toFixed(2);
const plural=(count,word)=>count+' '+word+(count===1?'':'s');
const toneOf=settings=>settings?.nagLevel||'Normal';

function renderToday(c,tone,more=false,seed=0){
 const count=c.incompleteToday.length;
 if(!count)return tone==='Gentle'?'Your list is clear today. Nice and easy.':tone==='Bratty'?'Nothing left today? Suspiciously efficient.':'Yare yare. Nothing unfinished today.';
 const names=c.incompleteToday.slice(more?1:0,more?6:4).map(task=>task.title);
 const details=names.length?' '+names.join(', ')+(c.incompleteToday.length>names.length?' and more.':''):'';
 const urgent=c.urgentToday.length?' '+plural(c.urgentToday.length,'urgent item')+' in there.':'';
 if(tone==='Gentle')return pick(['You have '+plural(count,'task')+' left today. We can keep it simple.','There are '+plural(count,'task')+' waiting today. One small step at a time.'],seed)+details+urgent;
 if(tone==='Bratty')return pick([''+plural(count,'task')+' left today. I expect a dazzling performance.','Yare yare. Only '+plural(count,'task')+' today. Try not to make it dramatic.'],seed)+details+urgent;
 return pick(['Yare yare. '+plural(count,'task')+' left today. Very survivable.','You have '+plural(count,'task')+' remaining today. Start with the easiest win.'],seed)+details+urgent;
}

export function generateReply(intent,data,settings={},options={}){
 const c=getPlannerContext(data,options.date);
 const tone=toneOf(settings);
 const seed=Number(options.seed||0);
 const more=Boolean(options.more);
 switch(intent){
  case 'greeting':
   return {text:pick(['Yare yare. I am awake. What shall we check?','Hello, Nyxie. Pick a planner problem and I shall judge it gently.','Hey. Tasks, money, cosplay, or something else?'],seed),state:'normal'};
  case 'today_tasks':
   return {text:renderToday(c,tone,more,seed),state:c.incompleteToday.length>3?'nagging':'normal'};
  case 'upcoming':{
   const parts=[];
   if(c.nearestConvention)parts.push(c.nearestConvention.name+' in '+(daysUntil(c.nearestConvention.startDate)??0)+' days');
   if(c.nextTrip)parts.push((c.nextTrip.destination||c.nextTrip.name||'Your next trip')+(c.nextTrip.startDate?' on '+formatDate(c.nextTrip.startDate):''));
   if(c.nextUpload)parts.push('content upload '+formatDate(c.nextUpload.uploadDeadline));
   if(c.money.upcomingMoney[0])parts.push(c.money.upcomingMoney[0].title+' due '+formatDate(c.money.upcomingMoney[0].due));
   return {text:parts.length?(tone==='Gentle'?'Here is what is coming up: ':tone==='Bratty'?'Yare yare. The future is busy: ':'Coming up: ')+parts.slice(0,more?5:3).join(' · '):'Nothing urgent is coming up yet. Your future is suspiciously peaceful.',state:'normal'};
  }
  case 'money_status':{
   const m=c.money;
   const planned=m.plannedNeeds||{};
   if(options.topic==='cosplay'){
    const remaining=planned.cosplay?.remainingNeed||0;
    return {text:remaining?'Cosplay has '+money(remaining)+' estimated remaining from unfinished pieces.':'No cosplay costs are planned yet.',state:'cosplay'};
   }
   if(options.topic==='planned'){
    return {text:planned.total?'You have '+money(planned.total)+' in planned needs across cosplay, conventions, travel, and manual upcoming items.':'Nothing big is planned yet. Your future wallet is suspiciously peaceful.',state:'money'};
   }
   const fact=money(m.availableToday)+' available today. Weekly mission: '+money(m.weeklyEarned)+' of '+money(m.weeklyGoal)+' earned, '+money(m.remaining)+' remaining, '+m.daysRemaining+' days left.';
   const window=m.workWindows[0];
   const extra=window?' Work today: '+(window.start||'flexible')+'–'+(window.end||'flexible')+'.':m.upcomingMoney[0]?' Next money item: '+m.upcomingMoney[0].title+'.':'';
   const plannedLine=planned.total?' Planned needs: '+money(planned.total)+'.':'';
   return {text:tone==='Gentle'?'You have '+fact+plannedLine+extra:tone==='Bratty'?'Yare yare. '+fact+plannedLine+' Keep the treasure quest moving.' :'Here is the money snapshot: '+fact+plannedLine+extra,state:'money'};
  }
  case 'cosplay_status':{
   const p=c.activeCosplay;
   if(!p)return {text:'No active cosplay is selected. Choose one in Cosplay and I can inspect the pieces.',state:'cosplay'};
   const progress=p.pieces?.length?Math.round(p.pieces.filter(x=>x.status==='Ready').length/p.pieces.length*100):Number(p.progress||0);
   const needs=c.unfinishedPieces.slice(more?1:0,more?6:4).map(x=>x.name+(x.due?' due '+formatDate(x.due):''));
   const target=p.targetEvent?(p.targetEvent+(p.targetDate?' on '+formatDate(p.targetDate):'')):'No event target set';
   return {text:(tone==='Gentle'?'Your active cosplay is ':'Yare yare. ')+p.name+' is '+progress+'% ready for '+target+'. '+(needs.length?'Needs attention: '+needs.join(', ')+'.':'All listed pieces are ready.'),state:'cosplay'};
  }
  case 'convention_status':{
   const con=c.nearestConvention;
   if(!con)return {text:'No upcoming convention is on the board yet.',state:'normal'};
   const prep=c.conventionPrep;
   const done=prep.filter(x=>x.done||x.packed).length;
   return {text:' '+con.name+' is in '+(daysUntil(con.startDate)??0)+' days. Prep is '+done+' of '+prep.length+' checklist items complete.'+(con.location?' Location: '+con.location+'.':''),state:'normal'};
  }
  case 'travel_status':{
   const trip=c.nextTrip;
   if(!trip)return {text:'No upcoming trip is saved yet.',state:'normal'};
   const flight=c.nextFlight;
   const flightText=flight?' Next flight: '+(flight.airline||'Flight')+' '+(flight.flightNumber||'')+' '+(flight.departureAirport||flight.from||'')+' to '+(flight.arrivalAirport||flight.to||'')+'.':'';
   const pack=trip.packing?.length?' Packing: '+trip.packing.filter(x=>x.packed).length+'/'+trip.packing.length+'.':'';
   return {text:'Your next trip is '+(trip.destination||trip.name||'saved')+(trip.startDate?' from '+formatDate(trip.startDate):'')+'.'+flightText+pack,state:'normal'};
  }
  case 'creator_status':{
   const stages=c.stageCounts;
   const due=c.overdueContent.length?' '+c.overdueContent.length+' content item'+(c.overdueContent.length===1?' is':'s are')+' overdue.':'';
   const next=c.nextShoot?' Next shoot: '+formatDate(c.nextShoot.shootDate)+'.':c.nextUpload?' Next upload: '+formatDate(c.nextUpload.uploadDeadline)+'.':'';
   return {text:'Creator HQ: '+(stages['To Film']||0)+' to film, '+(stages.Editing||0)+' editing, '+(stages.Ready||0)+' ready.'+next+due,state:'normal'};
  }
  case 'routine_status':{
   if(!c.routineSummaries.length)return {text:'No routines are set up yet.',state:'normal'};
   const summary=c.routineSummaries.map(x=>x.routine.name+' '+x.done+'/'+x.total+(x.skipped?' skipped today':'')).join(' · ');
   return {text:tone==='Gentle'?'Today’s rituals: '+summary+'.':tone==='Bratty'?'Yare yare. Ritual report: '+summary+'.':'Routines today: '+summary+'.',state:'normal'};
  }
  case 'wellness_status':{
   const w=c.wellness;
   if(!w)return {text:'No wellness check-in is saved for today. A tiny check-in is enough.',state:'sleepy'};
   const low=w.energy==='Low';
   return {text:low?'Yare yare. Keep it small today. Energy is low; water '+(w.water||0)+', meals '+(w.meals||0)+', sleep '+(w.sleep||0)+' hours.':'Today’s check-in: energy '+(w.energy||'not set')+', water '+(w.water||0)+', meals '+(w.meals||0)+', sleep '+(w.sleep||0)+' hours.',state:low?'sleepy':'normal'};
  }
  case 'work_status':{
   const windows=c.money.workWindows;
   if(!windows.length)return {text:'No active work window applies today. You can keep the day flexible.',state:'normal'};
   return {text:(tone==='Gentle'?'Your work options today: ':tone==='Bratty'?'Yare yare. Your shifts today: ':'Today’s work windows: ')+windows.map(w=>(w.start||'flexible')+'–'+(w.end||'flexible')).join(' · ')+'.',state:'money'};
  }
  case 'help':
   return {text:'I can help with tasks, money, cosplay, conventions, travel, content, routines, work windows, and wellness. Ask me what is next.',state:'normal'};
  case 'thanks':
   return {text:pick(['You are welcome. Try not to break the planner.','Anytime, Nyxie.','Yare yare. I had it handled.'],seed),state:'proud'};
  case 'relationship_boundary':
   return {text:'Yare yare. Romance is above my pay grade. Ask me about your planner instead.',state:'normal'};
  default:
   return {text:'Yare yare. I can help with your tasks, money, cosplay, conventions, travel, content, routines, work, or wellness.',state:'normal'};
 }
}
+toMoneyNumber(value).toFixed(2);
const plural=(count,word)=>count+' '+word+(count===1?'':'s');
const toneOf=settings=>settings?.nagLevel||'Normal';

function renderToday(c,tone,more=false,seed=0){
 const count=c.incompleteToday.length;
 if(!count)return tone==='Gentle'?'Your list is clear today. Nice and easy.':tone==='Bratty'?'Nothing left today? Suspiciously efficient.':'Yare yare. Nothing unfinished today.';
 const names=c.incompleteToday.slice(more?1:0,more?6:4).map(task=>task.title);
 const details=names.length?' '+names.join(', ')+(c.incompleteToday.length>names.length?' and more.':''):'';
 const urgent=c.urgentToday.length?' '+plural(c.urgentToday.length,'urgent item')+' in there.':'';
 if(tone==='Gentle')return pick(['You have '+plural(count,'task')+' left today. We can keep it simple.','There are '+plural(count,'task')+' waiting today. One small step at a time.'],seed)+details+urgent;
 if(tone==='Bratty')return pick([''+plural(count,'task')+' left today. I expect a dazzling performance.','Yare yare. Only '+plural(count,'task')+' today. Try not to make it dramatic.'],seed)+details+urgent;
 return pick(['Yare yare. '+plural(count,'task')+' left today. Very survivable.','You have '+plural(count,'task')+' remaining today. Start with the easiest win.'],seed)+details+urgent;
}

export function generateReply(intent,data,settings={},options={}){
 const c=getPlannerContext(data,options.date);
 const tone=toneOf(settings);
 const seed=Number(options.seed||0);
 const more=Boolean(options.more);
 switch(intent){
  case 'greeting':
   return {text:pick(['Yare yare. I am awake. What shall we check?','Hello, Nyxie. Pick a planner problem and I shall judge it gently.','Hey. Tasks, money, cosplay, or something else?'],seed),state:'normal'};
  case 'today_tasks':
   return {text:renderToday(c,tone,more,seed),state:c.incompleteToday.length>3?'nagging':'normal'};
  case 'upcoming':{
   const parts=[];
   if(c.nearestConvention)parts.push(c.nearestConvention.name+' in '+(daysUntil(c.nearestConvention.startDate)??0)+' days');
   if(c.nextTrip)parts.push((c.nextTrip.destination||c.nextTrip.name||'Your next trip')+(c.nextTrip.startDate?' on '+formatDate(c.nextTrip.startDate):''));
   if(c.nextUpload)parts.push('content upload '+formatDate(c.nextUpload.uploadDeadline));
   if(c.money.upcomingMoney[0])parts.push(c.money.upcomingMoney[0].title+' due '+formatDate(c.money.upcomingMoney[0].due));
   return {text:parts.length?(tone==='Gentle'?'Here is what is coming up: ':tone==='Bratty'?'Yare yare. The future is busy: ':'Coming up: ')+parts.slice(0,more?5:3).join(' · '):'Nothing urgent is coming up yet. Your future is suspiciously peaceful.',state:'normal'};
  }
  case 'money_status':{
   const m=c.money;
   const fact=money(m.availableToday)+' available today. Weekly mission: '+money(m.weeklyEarned)+' of '+money(m.weeklyGoal)+' earned, '+money(m.remaining)+' remaining, '+m.daysRemaining+' days left.';
   const window=m.workWindows[0];
   const extra=window?' Work today: '+(window.start||'flexible')+'–'+(window.end||'flexible')+'.':m.upcomingMoney[0]?' Next money item: '+m.upcomingMoney[0].title+'.':'';
   return {text:tone==='Gentle'?'You have '+fact+extra:tone==='Bratty'?'Yare yare. '+fact+' Keep the treasure quest moving.' :'Here is the money snapshot: '+fact+extra,state:'money'};
  }
  case 'cosplay_status':{
   const p=c.activeCosplay;
   if(!p)return {text:'No active cosplay is selected. Choose one in Cosplay and I can inspect the pieces.',state:'cosplay'};
   const progress=p.pieces?.length?Math.round(p.pieces.filter(x=>x.status==='Ready').length/p.pieces.length*100):Number(p.progress||0);
   const needs=c.unfinishedPieces.slice(more?1:0,more?6:4).map(x=>x.name+(x.due?' due '+formatDate(x.due):''));
   const target=p.targetEvent?(p.targetEvent+(p.targetDate?' on '+formatDate(p.targetDate):'')):'No event target set';
   return {text:(tone==='Gentle'?'Your active cosplay is ':'Yare yare. ')+p.name+' is '+progress+'% ready for '+target+'. '+(needs.length?'Needs attention: '+needs.join(', ')+'.':'All listed pieces are ready.'),state:'cosplay'};
  }
  case 'convention_status':{
   const con=c.nearestConvention;
   if(!con)return {text:'No upcoming convention is on the board yet.',state:'normal'};
   const prep=c.conventionPrep;
   const done=prep.filter(x=>x.done||x.packed).length;
   return {text:' '+con.name+' is in '+(daysUntil(con.startDate)??0)+' days. Prep is '+done+' of '+prep.length+' checklist items complete.'+(con.location?' Location: '+con.location+'.':''),state:'normal'};
  }
  case 'travel_status':{
   const trip=c.nextTrip;
   if(!trip)return {text:'No upcoming trip is saved yet.',state:'normal'};
   const flight=c.nextFlight;
   const flightText=flight?' Next flight: '+(flight.airline||'Flight')+' '+(flight.flightNumber||'')+' '+(flight.departureAirport||flight.from||'')+' to '+(flight.arrivalAirport||flight.to||'')+'.':'';
   const pack=trip.packing?.length?' Packing: '+trip.packing.filter(x=>x.packed).length+'/'+trip.packing.length+'.':'';
   return {text:'Your next trip is '+(trip.destination||trip.name||'saved')+(trip.startDate?' from '+formatDate(trip.startDate):'')+'.'+flightText+pack,state:'normal'};
  }
  case 'creator_status':{
   const stages=c.stageCounts;
   const due=c.overdueContent.length?' '+c.overdueContent.length+' content item'+(c.overdueContent.length===1?' is':'s are')+' overdue.':'';
   const next=c.nextShoot?' Next shoot: '+formatDate(c.nextShoot.shootDate)+'.':c.nextUpload?' Next upload: '+formatDate(c.nextUpload.uploadDeadline)+'.':'';
   return {text:'Creator HQ: '+(stages['To Film']||0)+' to film, '+(stages.Editing||0)+' editing, '+(stages.Ready||0)+' ready.'+next+due,state:'normal'};
  }
  case 'routine_status':{
   if(!c.routineSummaries.length)return {text:'No routines are set up yet.',state:'normal'};
   const summary=c.routineSummaries.map(x=>x.routine.name+' '+x.done+'/'+x.total+(x.skipped?' skipped today':'')).join(' · ');
   return {text:tone==='Gentle'?'Today’s rituals: '+summary+'.':tone==='Bratty'?'Yare yare. Ritual report: '+summary+'.':'Routines today: '+summary+'.',state:'normal'};
  }
  case 'wellness_status':{
   const w=c.wellness;
   if(!w)return {text:'No wellness check-in is saved for today. A tiny check-in is enough.',state:'sleepy'};
   const low=w.energy==='Low';
   return {text:low?'Yare yare. Keep it small today. Energy is low; water '+(w.water||0)+', meals '+(w.meals||0)+', sleep '+(w.sleep||0)+' hours.':'Today’s check-in: energy '+(w.energy||'not set')+', water '+(w.water||0)+', meals '+(w.meals||0)+', sleep '+(w.sleep||0)+' hours.',state:low?'sleepy':'normal'};
  }
  case 'work_status':{
   const windows=c.money.workWindows;
   if(!windows.length)return {text:'No active work window applies today. You can keep the day flexible.',state:'normal'};
   return {text:(tone==='Gentle'?'Your work options today: ':tone==='Bratty'?'Yare yare. Your shifts today: ':'Today’s work windows: ')+windows.map(w=>(w.start||'flexible')+'–'+(w.end||'flexible')).join(' · ')+'.',state:'money'};
  }
  case 'help':
   return {text:'I can help with tasks, money, cosplay, conventions, travel, content, routines, work windows, and wellness. Ask me what is next.',state:'normal'};
  case 'thanks':
   return {text:pick(['You are welcome. Try not to break the planner.','Anytime, Nyxie.','Yare yare. I had it handled.'],seed),state:'proud'};
  case 'relationship_boundary':
   return {text:'Yare yare. Romance is above my pay grade. Ask me about your planner instead.',state:'normal'};
  default:
   return {text:'Yare yare. I can help with your tasks, money, cosplay, conventions, travel, content, routines, work, or wellness.',state:'normal'};
 }
}
