const finiteNumber=value=>{
 const number=typeof value==='string'&&value.trim()===''?0:Number(value);
 return Number.isFinite(number)?number:0;
};

const finitePositive=value=>{
 const number=finiteNumber(value);
 return number>0?number:0;
};

export function toMoneyNumber(value){
 return finitePositive(value);
}

const normalizedStatus=value=>String(value??'').trim().toLowerCase();
const listFrom=(value,key)=>Array.isArray(value)?value:Array.isArray(value?.[key])?value[key]:[];

export function localDate(value=new Date()){
 if(typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value))return value;
 const date=value instanceof Date?new Date(value):new Date(value);
 if(Number.isNaN(date.getTime()))return '';
 return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');
}

export function getCosplayMoneyNeeds(cosplay={}){
 const projects=listFrom(cosplay,'projects');
 const breakdown=projects.map(project=>{
   const pieces=Array.isArray(project?.pieces)?project.pieces:[];
   const pricedPieces=pieces.filter(piece=>toMoneyNumber(piece?.cost)>0);
   const hasPieceCosts=pricedPieces.length>0;
   const estimatedTotal=hasPieceCosts
     ?pricedPieces.reduce((sum,piece)=>sum+toMoneyNumber(piece?.cost),0)
     :toMoneyNumber(project?.budget);
   const remainingNeed=hasPieceCosts
     ?pricedPieces.reduce((sum,piece)=>sum+(normalizedStatus(piece?.status)==='ready'?0:toMoneyNumber(piece?.cost)),0)
     :toMoneyNumber(project?.budget);
   return {id:project?.id,name:project?.name||'Untitled cosplay',estimatedTotal:Math.max(0,estimatedTotal),remainingNeed:Math.max(0,remainingNeed),hasPieceCosts};
 });
 return {projects:breakdown,estimatedTotal:breakdown.reduce((sum,project)=>sum+project.estimatedTotal,0),remainingNeed:breakdown.reduce((sum,project)=>sum+project.remainingNeed,0)};
}

export function getConventionMoneyNeeds(conventions={}){
 const items=listFrom(conventions,'items');
 const breakdown=items.filter(item=>toMoneyNumber(item?.budgetEstimate)>0&&normalizedStatus(item?.status)!=='completed').map(item=>({id:item?.id,name:item?.name||'Untitled convention',planned:toMoneyNumber(item?.budgetEstimate)}));
 return {items:breakdown,total:breakdown.reduce((sum,item)=>sum+item.planned,0)};
}

export function getTravelMoneyNeeds(travel={}){
 const trips=listFrom(travel,'trips');
 const breakdown=trips.filter(trip=>{
   const status=normalizedStatus(trip?.status);
   return toMoneyNumber(trip?.budgetEstimate)>0&&status!=='complete'&&status!=='completed';
 }).map(trip=>({id:trip?.id,name:trip?.name||trip?.destination||'Untitled trip',planned:toMoneyNumber(trip?.budgetEstimate)}));
 return {trips:breakdown,total:breakdown.reduce((sum,item)=>sum+item.planned,0)};
}

export function getManualUpcomingTotal(money={}){
 const items=Array.isArray(money)?money:Array.isArray(money?.upcoming)?money.upcoming:[];
 return items.reduce((sum,item)=>sum+toMoneyNumber(item?.amount),0);
}

export function getPlannedNeeds(data={}){
 const cosplay=getCosplayMoneyNeeds(data?.cosplay);
 const conventions=getConventionMoneyNeeds(data?.conventions);
 const travel=getTravelMoneyNeeds(data?.travel);
 const manualUpcoming=getManualUpcomingTotal(data?.money);
 return {cosplay,conventions,travel,manualUpcoming,total:Math.max(0,cosplay.remainingNeed+conventions.total+travel.total+manualUpcoming)};
}

export function normalizeMoneyRoot(rawMoney={}){
 const raw=rawMoney&&typeof rawMoney==='object'?rawMoney:{};
 return {
   ...raw,
   availableToday:finiteNumber(raw.availableToday),
   earnedToday:finiteNumber(raw.earnedToday),
   weeklyGoal:finiteNumber(raw.weeklyGoal),
   weeklyEarned:finiteNumber(raw.weeklyEarned),
   daysRemaining:Math.max(0,Math.floor(finiteNumber(raw.daysRemaining))),
   todayTarget:raw.todayTarget===null||raw.todayTarget===undefined||raw.todayTarget===''?null:Math.max(0,finiteNumber(raw.todayTarget)),
   buckets:{life:finiteNumber(raw.buckets?.life),con:finiteNumber(raw.buckets?.con),fun:finiteNumber(raw.buckets?.fun),...(raw.buckets||{})},
   transactions:Array.isArray(raw.transactions)?raw.transactions:[],
   workWindows:Array.isArray(raw.workWindows)?raw.workWindows:[],
   workWindowCheckins:raw.workWindowCheckins&&typeof raw.workWindowCheckins==='object'?raw.workWindowCheckins:{},
   upcoming:Array.isArray(raw.upcoming)?raw.upcoming:[],
   obligations:Array.isArray(raw.obligations)?raw.obligations:[],
   savingsGoals:Array.isArray(raw.savingsGoals)?raw.savingsGoals:[],
   debts:Array.isArray(raw.debts)?raw.debts:[],
   purchases:Array.isArray(raw.purchases)?raw.purchases:[]
 };
}

const dayNames=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
const shortDayNames=dayNames.map(name=>name.slice(0,3));
const dayIndex=date=>{const parsed=new Date(localDate(date)+'T12:00:00');return Number.isNaN(parsed.getTime())?new Date().getDay():parsed.getDay()};
const dayMatches=(label,day)=>{
 const text=String(label??'').toLowerCase().replace(/[,/|]+/g,' ');
 if(!text.trim())return true;
 if(/\ball\s*days?\b|\bevery\s*day\b|\bflex(?:ible)?\b/.test(text))return true;
 if(/\bweekday/.test(text))return day>=1&&day<=5;
 if(/\bweekend/.test(text))return day===0||day===6;
 return text.split(/\s+/).some(token=>dayNames[day]===token||shortDayNames[day]===token||token.startsWith(dayNames[day]));
};

export function workWindowApplies(window,date=localDate()){
 if(!window||window.active===false)return false;
 const rawDays=Array.isArray(window.days)?window.days.join(' '):(window.days||window.label||window.day||'');
 return dayMatches(rawDays,dayIndex(date));
}

export function getWorkWindowCheckin(money,windowId,date=localDate()){
 const root=normalizeMoneyRoot(money);
 return root.workWindowCheckins?.[localDate(date)]?.[String(windowId)]||null;
}

export function getApplicableWorkWindows(money,date=localDate()){
 const root=normalizeMoneyRoot(money);
 return root.workWindows.filter(window=>workWindowApplies(window,date)).map(window=>({...window,checkin:getWorkWindowCheckin(root,window.id,date)}));
}

export function getWeeklyMissionSummary(money={}){
 const root=normalizeMoneyRoot(money);
 const goal=Math.max(0,finiteNumber(root.weeklyGoal));
 const earned=Math.max(0,finiteNumber(root.weeklyEarned));
 const remaining=Math.max(0,goal-earned);
 const daysRemaining=Math.max(0,Math.floor(finiteNumber(root.daysRemaining)));
 const suggestedPerDay=daysRemaining>0?remaining/daysRemaining:0;
 return {goal,earned,remaining,daysRemaining,suggestedPerDay:Number.isFinite(suggestedPerDay)?suggestedPerDay:0};
}

export function getTodayMoneyTargetSummary(money={},date=localDate()){
 const root=normalizeMoneyRoot(money);
 const mission=getWeeklyMissionSummary(root);
 const hasCustomTarget=root.todayTarget!==null&&root.todayTarget!==undefined&&root.todayTarget!=='';
 const target=hasCustomTarget?Math.max(0,finiteNumber(root.todayTarget)):null;
 const earnedToday=Math.max(0,finiteNumber(root.earnedToday));
 return {hasCustomTarget,target,earnedToday,targetRemaining:hasCustomTarget?Math.max(0,target-earnedToday):0,suggestedToday:mission.suggestedPerDay,date:localDate(date)};
}

export function getUpcomingObligations(money={}){
 return normalizeMoneyRoot(money).obligations.filter(item=>item&&item.active!==false).slice().sort((a,b)=>String(a.dueDate||a.dueDay||'9999').localeCompare(String(b.dueDate||b.dueDay||'9999')));
}

export function getSavingsProgress(goal={}){
 const target=finitePositive(goal.target);
 const current=Math.max(0,finiteNumber(goal.current));
 return {target,current,remaining:Math.max(0,target-current),percentage:target>0?Math.min(100,Math.max(0,current/target*100)):0};
}

const canonicalBuckets=['life','con','fun'];
const transactionKind=tx=>String(tx?.kind||tx?.type||'').toLowerCase()==='spent'?'spent':'earned';
const transactionBucket=tx=>{
 const direct=String(tx?.bucket||'').toLowerCase().trim();
 if(canonicalBuckets.includes(direct))return direct;
 const source=String(tx?.source||'').toLowerCase().trim();
 return canonicalBuckets.includes(source)?source:'';
};
const isGigSource=value=>/\bgig\b/i.test(String(value||'').trim());
export const isGigTransaction=tx=>tx?.gigRelated===true||isGigSource(tx?.source)||isGigSource(tx?.label);

export function getLoggedGigProfit(money={}){
 const rows=normalizeMoneyRoot(money).transactions;
 let earned=0,spent=0;
 rows.forEach(tx=>{
   if(!isGigTransaction(tx))return;
   const amount=finitePositive(tx.amount);
   if(transactionKind(tx)==='spent')spent+=amount; else earned+=amount;
 });
 return {earned,spent,profit:earned-spent};
}

export function applyMoneyTransaction(money={},tx,direction=1,date=localDate()){
 const root=normalizeMoneyRoot(money);
 const amount=finitePositive(tx?.amount)*direction;
 const kind=transactionKind(tx);
 const buckets={...root.buckets};
 let available=root.availableToday;
 let weeklyEarned=root.weeklyEarned;
 let earnedToday=root.earnedToday;
 if(kind==='earned'){
   weeklyEarned+=amount;
   if(localDate(tx?.date||date)===localDate(date))earnedToday+=amount;
 }else{
   available-=amount;
   const bucket=transactionBucket(tx);
   if(bucket)buckets[bucket]=(finiteNumber(buckets[bucket])-amount);
 }
 return {...root,availableToday:available,weeklyEarned,earnedToday,buckets};
}

export function getTransactionBucket(tx){return transactionBucket(tx);}
export function getTransactionKind(tx){return transactionKind(tx);}
