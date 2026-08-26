import {formatDate,daysUntil,getPlannerContext} from './yuu-context.js';
import {getLoggedGigProfit,getTodayMoneyTargetSummary,getUpcomingObligations,toMoneyNumber} from './money-derived.js';
import {isReady,normalizeStatus} from './cosplay-derived.js';

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
 const activeMode=c.mode?.effective||'normal';
 switch(intent){
  case 'greeting':
   if(activeMode==='low-energy')return {text:'Yare yare. Today can be smaller. Water, food, rest, or one tiny task?',state:'sleepy'};
   return {text:pick(['Yare yare. I am awake. What shall we check?','Hello, Nyxie. Pick a planner problem and I shall judge it gently.','Hey, tasks, money, cosplay, or something else?'],seed),state:'normal'};
  case 'today_tasks':
   return activeMode==='low-energy'?{text:'Yare yare. Today can be smaller. '+(c.incompleteToday.length?c.incompleteToday[0].title+' is one useful next step.':'Your list is clear today.'),state:'sleepy'}:{text:renderToday(c,tone,more,seed),state:c.incompleteToday.length>3?'nagging':'normal'};
  case 'mode_status':{
   const mode=c.mode||{};
   return {text:'Current focus: '+(mode.label||'Normal Day')+'.'+(mode.suggested&&mode.suggested!==mode.effective?' Auto would suggest '+mode.suggested+'.':'')+' I will keep the planner facts the same.',state:mode.effective==='low-energy'?'sleepy':'normal'};
  }
  case 'reminder_status':{
   const buckets=c.reminderBuckets||{today:[],upcoming:[],overdue:[],importantToday:[]};
   const topic=options.topic||'today';
   const rows=topic==='overdue'?buckets.overdue:topic==='important'?buckets.importantToday:topic==='upcoming'?buckets.upcoming:buckets.today;
   const label=topic==='overdue'?'overdue':topic==='upcoming'?'coming up':topic==='important'?'important today':'to remember today';
   if(!rows.length){
    const empty=topic==='overdue'?'Nothing is overdue right now.':topic==='upcoming'?'Nothing is coming up yet.':topic==='important'?'Nothing marked important is due today.':'Nothing needs remembering today.';
    return {text:tone==='Bratty'?'Yare yare. '+empty+' Suspiciously peaceful.':empty+' Your planner is pleasantly quiet.',state:'normal'};
   }
   const shown=rows.slice(0,more?6:4).map(item=>(item.time?item.time+' ':'')+item.title+' · '+(item.sourceType||'planner'));
   const suffix=rows.length>shown.length?' and '+(rows.length-shown.length)+' more':'.';
   const lead=tone==='Gentle'?'Here is what is ':tone==='Bratty'?'Yare yare. Here is what is ':'Here is what is ';
   return {text:lead+label+': '+shown.join(', ')+suffix,state:topic==='overdue'?'nagging':'normal'};
  }
  case 'upcoming':{
   const parts=[];
   if(c.nearestConvention)parts.push(c.nearestConvention.name+' in '+(daysUntil(c.nearestConvention.startDate)??0)+' days');
   if(c.nextTrip)parts.push((c.nextTrip.destination||c.nextTrip.name||'Your next trip')+(c.nextTrip.startDate?' on '+formatDate(c.nextTrip.startDate):''));
   if(c.nextUpload)parts.push('content upload '+formatDate(c.nextUpload.uploadDeadline));
   if(c.money.upcomingMoney[0])parts.push(c.money.upcomingMoney[0].title+' due '+formatDate(c.money.upcomingMoney[0].due));
   const reminderPreview=(c.reminderBuckets?.upcoming||[]).slice(0,2);
   if(reminderPreview.length)parts.push('planner reminder '+reminderPreview.map(item=>item.title).join(', '));
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
   if(options.topic==='dailyTarget'){
    const target=m.targetSummary||getTodayMoneyTargetSummary(m,c.date);
    return {text:target.hasCustomTarget?'Today target is '+money(target.target)+', with '+money(target.targetRemaining)+' left after '+money(target.earnedToday)+' earned today.':'No custom target today. Your suggested pace is '+money(target.suggestedToday)+' from the weekly mission.',state:'money'};
   }
   if(options.topic==='work'){
    const windows=m.workWindows||[];
    const active=windows.filter(item=>item.checkin?.status!=='skipped');
    return {text:active.length?'Work window today: '+active.map(item=>(item.start||'flexible')+'–'+(item.end||'flexible')+(item.checkin?.status==='started'?' (started)':'')).join(' · ')+'.':windows.length?'You skipped today’s work window. No punishment—tomorrow is another day.':'No active work window applies today.',state:'money'};
   }
   if(options.topic==='obligations'){
    const items=getUpcomingObligations(m).slice(0,more?6:3);
    return {text:items.length?'Coming up: '+items.map(item=>(item.title||'Untitled')+' '+money(item.amount)+(item.dueDate?' due '+formatDate(item.dueDate):'')).join(' · ')+'.':'No active bills or subscriptions are listed.',state:'money'};
   }
   if(options.topic==='fund'){
    const query=String(options.subject||'').toLowerCase();
    const fund=(m.savingsGoals||[]).find(item=>query&&String(item.type||'').toLowerCase().includes(query))||(m.savingsGoals||[]).find(item=>String(item.type||'').toLowerCase().includes('fund'));
    if(!fund)return {text:'No matching savings or fund is listed yet.',state:'money'};
    return {text:(fund.title||fund.type||'Fund')+' is at '+money(fund.current)+' of '+money(fund.target)+'.',state:'money'};
   }
   if(options.topic==='gigProfit'){
    const profit=m.gigProfit||getLoggedGigProfit(m);
    const signed=value=>(value<0?'-$'+Math.abs(value).toFixed(2):money(value));
    return {text:'Logged gig profit is '+signed(profit.profit)+'. Earned '+money(profit.earned)+' and spent '+money(profit.spent)+' in Gig-related transactions.',state:'money'};
   }
   const fact=money(m.availableToday)+' available today, '+money(m.earnedToday)+' earned today. Weekly mission: '+money(m.weeklyEarned)+' of '+money(m.weeklyGoal)+' earned, '+money(m.remaining)+' remaining, '+m.daysRemaining+' days left. Suggested pace: '+money(m.mission?.suggestedPerDay||0)+' per remaining day.';
   const plannedLine=planned.total?' Planned needs: '+money(planned.total)+'.':'';
   const modeLead=activeMode==='work-money'?'Work Money focus: ':'';
   return {text:modeLead+(tone==='Gentle'?'You have ':tone==='Bratty'?'Yare yare. ':'Here is the money snapshot: ')+fact+plannedLine,state:'money'};
  }
  case 'cosplay_status':{
   const p=c.activeCosplay;
   if(!p)return {text:'No active cosplay is selected. Choose one in Cosplay and I can inspect the pieces.',state:'cosplay'};
   const pieces=c.cosplayPieces||[];
   const unfinishedPieces=c.unfinishedPieces||[];
   const topic=options.topic||'attention';
   const byCategory=category=>pieces.filter(piece=>normalizeStatus(piece.category)===normalizeStatus(category));
   const list=items=>items.slice(more?1:0,more?6:4).map(piece=>piece.name+(piece.due?' due '+formatDate(piece.due):'')).join(', ');
   if(topic==='buy'){
    const need=unfinishedPieces.filter(piece=>['buy','commission'].includes(normalizeStatus(piece.method)));
    return {text:need.length?'You still need to buy or commission: '+list(need)+'.':'Nothing unfinished is marked Buy or Commission right now.',state:'cosplay'};
   }
   if(topic==='contacts'||topic==='shoes'){
    const matches=byCategory(topic);
    if(!matches.length)return {text:'No '+topic+' piece is listed for '+p.name+' yet.',state:'cosplay'};
    const piece=matches[0];
    const status=isReady(piece)?'ready':(piece.status||'not ready');
    const purchase=[piece.ordered?'ordered':'not ordered',piece.arrived?'arrived':'not arrived'].join(', ');
    return {text:piece.name+' is '+status+'.'+(normalizeStatus(piece.method)==='make'?'': ' '+purchase+'.'),state:'cosplay'};
   }
   if(topic==='repairs'){
    const repairs=pieces.filter(piece=>{const state=normalizeStatus(piece.repairStatus);return state&&state!=='none'&&state!=='repaired'});
    return {text:repairs.length?'Repair check: '+list(repairs)+'.':'No pieces are marked as needing repair.',state:'cosplay'};
   }
   if(topic==='packed'){
    const notPacked=pieces.filter(piece=>!piece.packed);
    return {text:notPacked.length?'Not packed yet: '+list(notPacked)+'.':'Everything listed is packed. Ready and packed are tracked separately.',state:'cosplay'};
   }
   if(topic==='next'){
    const next=c.cosplayNextPiece;
    return {text:next?'Next attention piece: '+next.name+(next.due?' due '+formatDate(next.due):'.'):'All listed pieces are ready.',state:'cosplay'};
   }
   const progress=Number(c.cosplayProgress||0);
   const needs=unfinishedPieces.slice(more?1:0,more?6:4);
   const target=p.targetEvent?(p.targetEvent+(p.targetDate?' on '+formatDate(p.targetDate):'')):'No event target set';
   const lead=tone==='Gentle'?'Your active cosplay is ':tone==='Bratty'?'Yare yare. ':'';
   return {text:lead+p.name+' is '+progress+'% ready for '+target+'. '+(needs.length?'Needs attention: '+list(needs)+'.':'All listed pieces are ready.'),state:'cosplay'};
  }
  case 'convention_status':{
   const con=c.nearestConvention;
   if(!con)return {text:'No upcoming convention is on the board yet.',state:'normal'};
   const topic=options.topic||'status';
   if(topic==='next'){
    const next=c.conventionSchedule?.find(item=>!item.done)||c.conventionPhotoshoots?.[0];
    return {text:next?'Next at '+con.name+': '+(next.time?next.time+' ':'')+(next.title||next.name||'schedule item')+(next.location?' at '+next.location:'')+'.':'No more scheduled things today ✨',state:'normal'};
   }
   if(topic==='prep'){
    const suggestions=c.conventionSuggestions?.suggestions||[];
    return {text:suggestions.length?'Prep next: '+suggestions.slice(0,4).join(', ')+'.':'No prep guidance is queued yet.',state:'normal'};
   }
   if(topic==='photoshoots'){
    const shoots=c.conventionPhotoshoots||[];
    return {text:shoots.length?'Photoshoots today: '+shoots.map(item=>(item.time?item.time+' ':'')+(item.title||item.name)).join(', ')+'.':'No photoshoots are scheduled today.',state:'normal'};
   }
   if(topic==='content'){
    const content=c.conventionContent||{done:0,target:0,remaining:0};
    return {text:content.target?content.done+' / '+content.target+' content complete, '+content.remaining+' left.':'No convention content target is set yet.',state:'normal'};
   }
   const prep=c.conventionPrep||[];const done=prep.filter(item=>item.done||item.packed).length;
   return {text:(activeMode==='con-day'?'Con Day focus: ':'')+con.name+' is in '+(daysUntil(con.startDate)??0)+' days. Prep is '+done+' of '+prep.length+' custom items complete.'+(con.location?' Location: '+con.location+'.':''),state:'normal'};
  }
  case 'travel_status':{
   const trip=c.nextTrip;
   if(!trip)return {text:'No upcoming trip is saved yet.',state:'normal'};
   const flight=c.nextFlight;
   const stay=c.travelSummary?.nextStay||c.stays?.[0];
   const flightText=flight?' Next flight: '+(flight.airline||'Flight')+' '+(flight.flightNumber||'')+' '+(flight.from||flight.departureAirport||'')+' to '+(flight.to||flight.arrivalAirport||'')+(flight.departureDate?' on '+formatDate(flight.departureDate):'')+(flight.departureTime?' at '+flight.departureTime:'')+(flight.terminalGate?' · '+flight.terminalGate:'')+(flight.seat?' · seat '+flight.seat:'')+'.':'';
   const pack=trip.packing?.length?' Packing: '+trip.packing.filter(x=>x.packed).length+'/'+trip.packing.length+'.':'';
   const stayText=stay?' Staying at '+(stay.name||'saved lodging')+(stay.address?' · '+stay.address:'')+'.':'';
   const agenda=(c.travelAgenda||[]).slice(0,2);
   const agendaText=agenda.length?' Today: '+agenda.map(item=>(item.time?item.time+' ':'')+(item.title||'trip item')).join(', ')+'.':'';
   const confirmationText=c.travelConfirmations?.length?' '+c.travelConfirmations.length+' confirmation reference'+(c.travelConfirmations.length===1?'':'s')+' saved.':'';
   return {text:(activeMode==='travel'?'Travel focus: ':'Your next trip is ')+(activeMode==='travel'?'':(trip.destination||trip.name||'saved')+(trip.startDate?' from '+formatDate(trip.startDate):'')+'.')+flightText+stayText+agendaText+pack+confirmationText,state:'normal'};
  }
  case 'creator_status':{
   const stages=c.stageCounts||{};
   const items=c.creatorItems||[];
   const list=(values,limit=4)=>values.slice(more?1:0,more?limit+2:limit).map(item=>item.title).join(', ');
   const topic=options.topic||'overview';
   if(topic==='toFilm'){
    const work=items.filter(item=>item.stage==='To Film');
    return {text:work.length?'To Film: '+list(work)+'.':'Nothing is waiting in To Film right now.',state:'normal'};
   }
   if(topic==='editing'){
    const work=items.filter(item=>item.stage==='Editing');
    return {text:work.length?'Editing queue: '+list(work)+'.':'The Editing queue is clear for now.',state:'normal'};
   }
   if(topic==='posting'){
    const todayItems=(c.creatorFocus?.posts||[]).concat((c.creatorFocus?.reminders||[]));
    const soon=(c.creatorDeadlines||[]).slice(0,more?5:3);
    return {text:todayItems.length?'Posting today: '+list(todayItems)+'.':soon.length?'Post soon: '+soon.map(entry=>entry.item.title+' on '+formatDate(entry.date)).join(', ')+'.':'No posting deadlines are coming up yet.',state:'normal'};
   }
   if(topic==='convention'){
    const summary=c.creatorConventionSummary||{items:[],target:0,done:0,remaining:0};
    return {text:summary.items.length?'Convention content: '+summary.done+' / '+summary.target+' complete, '+summary.remaining+' remaining. Linked items: '+list(summary.items)+'.':'No linked convention content is on the board yet.',state:'normal'};
   }
   if(topic==='collaborators'){
    const names=(c.creatorCollaborators||[]).filter(contact=>items.some(item=>(item.collaboratorIds||[]).map(String).includes(String(contact.id)))).map(contact=>contact.name);
    return {text:names.length?'Production contacts: '+names.slice(0,more?6:4).join(', ')+'.':'No work collaborators are linked to Creator items yet.',state:'normal'};
   }
   if(topic==='caption'){
    const subject=String(options.subject||'').toLowerCase();
    const matches=items.filter(item=>item.captionDraft&&(!subject||item.title.toLowerCase().includes(subject)||subject.includes(item.title.toLowerCase())));
    return {text:matches.length?matches[0].title+' caption draft: '+matches[0].captionDraft:'I could not find a matching caption draft yet.',state:'normal'};
   }
   const attention=items.filter(item=>item.stage!=='Posted'&&(item.reminderAt||item.uploadDeadline||item.shootDate));
   const due=c.overdueContent?.length?' '+c.overdueContent.length+' overdue item'+(c.overdueContent.length===1?'':'s')+'.':'';
   return {text:(activeMode==='creator'?'Creator Day focus: ':'Creator HQ: ')+(stages['To Film']||0)+' to film, '+(stages.Editing||0)+' editing, '+(stages.Ready||0)+' ready.'+(attention.length?' '+attention[0].title+' is next on the board.':'')+due,state:'normal'};
  }
  case 'routine_status':{
   const summaries=Array.isArray(c.routineSummaries)?c.routineSummaries:[];
   const topic=options.topic||'today';
   if(topic==='tomorrow'){
    const tomorrow=Array.isArray(c.tomorrowRoutineSummaries)?c.tomorrowRoutineSummaries:[];
    return {text:tomorrow.length?'Tomorrow: '+tomorrow.map(item=>item.routine.name+' '+item.completed+'/'+item.total).join(' · ')+'.':'No routine is scheduled for tomorrow yet. A carry-forward can make one appear once.',state:'normal'};
   }
   if(topic==='tiny'){
    const tiny=summaries.flatMap(item=>(item.lowEnergySteps||[]).map(step=>step.text)).filter(Boolean);
    return {text:tiny.length?'Tiny version: '+tiny.join(', ')+'.':'No tiny version is set for today yet. Show the full routine when you are ready.',state:'sleepy'};
   }
   if(!summaries.length)return {text:'No routines apply today. The quiet days count too.',state:'normal'};
   if(topic==='remaining'){
    const remaining=summaries.filter(item=>item.remaining>0);
    return {text:remaining.length?'Still left: '+remaining.map(item=>item.routine.name+' ('+item.remaining+' step'+(item.remaining===1?'':'s')+')').join(' · ')+'.':'All applicable routine steps are complete today.',state:'normal'};
   }
   if(topic==='progress'){
    return {text:'Routine progress: '+summaries.map(item=>item.routine.name+' '+item.completed+'/'+item.total+' ('+item.percentage+'%)').join(' · ')+'.',state:'normal'};
   }
   if(topic==='skipped'){
    const skipped=summaries.filter(item=>item.skipped);
    return {text:skipped.length?'Skipped today: '+skipped.map(item=>item.routine.name).join(', ')+'.':'No applicable routines are marked skipped today.',state:'normal'};
   }
   const summary=summaries.map(item=>item.routine.name+' '+item.completed+'/'+item.total+(item.skipped?' skipped today':'')).join(' · ');
   return {text:tone==='Gentle'?'Today’s rituals: '+summary+'.':tone==='Bratty'?'Yare yare. Ritual report: '+summary+'.':'Routines today: '+summary+'.',state:'normal'};
  }
  case 'wellness_status':{
   const w=c.wellness||{};
   const summary=c.wellnessSummary||{};
   const topic=options.topic||'today';
   if(topic==='water')return {text:'You’ve logged '+(summary.waterOz||0)+' oz today. Goal: '+(summary.goalOz||64)+' oz.',state:'normal'};
   if(topic==='meals')return {text:summary.meals?'You’ve logged '+plural(summary.meals,'meal')+' today.':'No meals are logged today yet. A simple bite counts.',state:'normal'};
   if(topic==='sleep')return {text:Number(w.sleep)>0?'You logged '+w.sleep+' hours of sleep.':'No sleep hours are logged yet.',state:'sleepy'};
   if(topic==='movement')return {text:'Movement: '+(w.movement?'done':'not marked')+'. Gym/workout: '+(w.gym?'done':'not marked')+'.'+(Number(w.steps)>0?' Steps: '+w.steps+'.':'') ,state:'normal'};
   if(topic==='week'){
    const week=c.weeklyWellness||{};
    return {text:'This week: '+(week.waterTotalOz||0)+' oz logged, '+plural(week.meals||0,'meal')+', movement on '+plural(week.movementDays||0,'day')+', and gym on '+plural(week.gymDays||0,'day')+'.'+(week.averageSleep==null?'':' Average sleep: '+week.averageSleep+' hours.'),state:'sleepy'};
   }
   const low=String(w.energy||'').toLowerCase()==='low';
   const base='Energy '+(w.energy||'not set')+', '+(summary.waterOz||0)+' oz water, '+plural(summary.meals||0,'meal')+', '+(Number(w.sleep)||0)+' hours sleep.';
   return {text:low?'Yare yare. Today can be smaller. '+base+' Pick water, food, or rest.':'Today’s check-in: '+base,state:low?'sleepy':'normal'};
  }
  case 'work_status':{
   const windows=c.money.workWindows;
   if(!windows.length)return {text:'No active work window applies today. You can keep the day flexible.',state:'normal'};
   return {text:(tone==='Gentle'?'Your work options today: ':tone==='Bratty'?'Yare yare. Your shifts today: ':'Today’s work windows: ')+windows.map(w=>(w.start||'flexible')+'–'+(w.end||'flexible')).join(' · ')+'.',state:'money'};
  }
  case 'help':
   return {text:'I can help with tasks, money, cosplay, conventions, travel, content, routines, work windows, wellness, reminders, and the current mode. Ask me what is next.',state:'normal'};
  case 'thanks':
   return {text:pick(['You are welcome. Try not to break the planner.','Anytime, Nyxie.','Yare yare. I had it handled.'],seed),state:'proud'};
  case 'relationship_boundary':
   return {text:'Yare yare. Romance is above my pay grade. Ask me about your planner instead.',state:'normal'};
  default:
   return {text:'Yare yare. I can help with your tasks, money, cosplay, conventions, travel, content, routines, work, wellness, or reminders.',state:'normal'};
 }
}
