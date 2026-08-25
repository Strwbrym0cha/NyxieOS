const finitePositive=value=>{
 const number=typeof value==='string'&&value.trim()===''?0:Number(value);
 return Number.isFinite(number)&&number>0?number:0;
};

export function toMoneyNumber(value){
 return finitePositive(value);
}

const normalizedStatus=value=>String(value??'').trim().toLowerCase();
const listFrom=(value,key)=>Array.isArray(value)?value:Array.isArray(value?.[key])?value[key]:[];

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
   return {
     id:project?.id,
     name:project?.name||'Untitled cosplay',
     estimatedTotal:Math.max(0,estimatedTotal),
     remainingNeed:Math.max(0,remainingNeed),
     hasPieceCosts
   };
 });
 return {
   projects:breakdown,
   estimatedTotal:breakdown.reduce((sum,project)=>sum+project.estimatedTotal,0),
   remainingNeed:breakdown.reduce((sum,project)=>sum+project.remainingNeed,0)
 };
}

export function getConventionMoneyNeeds(conventions={}){
 const items=listFrom(conventions,'items');
 const breakdown=items
   .filter(item=>toMoneyNumber(item?.budgetEstimate)>0&&normalizedStatus(item?.status)!=='completed')
   .map(item=>({id:item?.id,name:item?.name||'Untitled convention',planned:toMoneyNumber(item?.budgetEstimate)}));
 return {items:breakdown,total:breakdown.reduce((sum,item)=>sum+item.planned,0)};
}

export function getTravelMoneyNeeds(travel={}){
 const trips=listFrom(travel,'trips');
 const breakdown=trips
   .filter(trip=>{
     const status=normalizedStatus(trip?.status);
     return toMoneyNumber(trip?.budgetEstimate)>0&&status!=='complete'&&status!=='completed';
   })
   .map(trip=>({id:trip?.id,name:trip?.name||trip?.destination||'Untitled trip',planned:toMoneyNumber(trip?.budgetEstimate)}));
 return {trips:breakdown,total:breakdown.reduce((sum,trip)=>sum+trip.planned,0)};
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
 return {
   cosplay,
   conventions,
   travel,
   manualUpcoming,
   total:Math.max(0,cosplay.remainingNeed+conventions.total+travel.total+manualUpcoming)
 };
}
