const DATE_RE=/^\d{4}-\d{2}-\d{2}$/;
const DAY_MS=86400000;
const RESET_DEFAULTS=['Unpack','Laundry','Charge devices','Put documents away','Review spending','Clear travel bag','Back up photos/content','Note anything to replace'];

export const localTravelDate=(value=new Date())=>{
  if(typeof value==='string'&&DATE_RE.test(value))return value;
  const date=value instanceof Date?new Date(value):new Date(value);
  if(Number.isNaN(date.getTime()))return localTravelDate(new Date());
  return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');
};
export const localTravelNoon=value=>{
  if(typeof value==='string'&&DATE_RE.test(value))return new Date(Number(value.slice(0,4)),Number(value.slice(5,7))-1,Number(value.slice(8,10)),12);
  const date=value instanceof Date?new Date(value):new Date(value||new Date()); date.setHours(12,0,0,0); return date;
};
export const shiftTravelDate=(value,amount)=>{const date=localTravelNoon(value);date.setDate(date.getDate()+Number(amount||0));return localTravelDate(date)};
const dateTimeKey=(date,time='')=>{const safe=typeof date==='string'&&DATE_RE.test(date)?date:'9999-12-31';return safe+'T'+(time||'23:59')};
const asArray=value=>Array.isArray(value)?value:[];
const asObject=value=>value&&typeof value==='object'?value:{};

export const defaultPostTripReset=()=>RESET_DEFAULTS.map((title,index)=>({id:'reset-'+Date.now()+'-'+index,title,done:false}));
export function normalizeTrip(rawTrip,index=0){
  const source=asObject(rawTrip);
  return {
    ...source,
    id:source.id??'trip-'+index,
    name:source.name||'Untitled trip',
    destination:source.destination||'',
    startDate:source.startDate||'',
    endDate:source.endDate||source.startDate||'',
    status:source.status||'Planning',
    linkedConventionId:source.linkedConventionId??null,
    flights:asArray(source.flights),
    stays:asArray(source.stays),
    transport:asArray(source.transport||source.groundTransport),
    itinerary:asArray(source.itinerary),
    packing:asArray(source.packing),
    confirmations:asArray(source.confirmations),
    foodSpots:asArray(source.foodSpots),
    postTripReset:asArray(source.postTripReset),
    weatherNote:source.weatherNote||'',
    weatherLink:source.weatherLink||''
  };
}
export function normalizeTravelRoot(rawTravel){
  const source=asObject(rawTravel);
  return {
    ...source,
    activeId:source.activeId??null,
    trips:asArray(source.trips).map(normalizeTrip),
    packingTemplates:asArray(source.packingTemplates)
  };
}
export function getActiveTrip(rawTravel,date=localTravelDate()){
  const root=Array.isArray(rawTravel)?{trips:rawTravel,activeId:null}:normalizeTravelRoot(rawTravel);
  const active=root.trips.find(trip=>String(trip.id)===String(root.activeId));
  if(active)return active;
  const current=root.trips.find(trip=>trip.status==='Traveling'&&isTripDay(trip,date));
  return current||null;
}
export function getUpcomingTrips(rawTravel,date=localTravelDate()){
  const root=Array.isArray(rawTravel)?{trips:rawTravel}:normalizeTravelRoot(rawTravel);
  return root.trips.filter(trip=>!['complete','completed'].includes(String(trip.status||'').toLowerCase())&&trip.startDate&&trip.startDate>=localTravelDate(date)).slice().sort((a,b)=>dateTimeKey(a.startDate).localeCompare(dateTimeKey(b.startDate)));
}
export function getTripCountdown(trip,date=localTravelDate()){
  if(!trip?.startDate)return 'Dates TBD';
  const start=localTravelNoon(trip.startDate);const today=localTravelNoon(localTravelDate(date));
  const diff=Math.round((start-today)/DAY_MS);
  if(diff<=0&&trip.endDate&&localTravelDate(date)<=trip.endDate)return 'Today';
  if(diff<0)return 'In progress';
  return diff===1?'1 day away':diff+' days away';
}
export function isTripDay(trip,date=localTravelDate()){
  if(!trip)return false;
  const key=localTravelDate(date);return Boolean(trip.startDate&&key>=trip.startDate&&(!trip.endDate||key<=trip.endDate));
}
export function getNextFlight(trip,date=localTravelDate()){
  const flights=asArray(trip?.flights).slice().sort((a,b)=>dateTimeKey(a.departureDate||a.date,a.departureTime).localeCompare(dateTimeKey(b.departureDate||b.date,b.departureTime)));
  if(!flights.length)return null;
  const today=localTravelDate(date);
  return flights.find(flight=>(flight.departureDate||flight.date||'9999')>=today)||flights[0];
}
export function getCurrentOrNextStay(trip,date=localTravelDate()){
  const stays=asArray(trip?.stays).slice().sort((a,b)=>dateTimeKey(a.checkInDate||a.date,a.checkInTime).localeCompare(dateTimeKey(b.checkInDate||b.date,b.checkInTime)));
  const today=localTravelDate(date);
  return stays.find(stay=>(stay.checkInDate||'9999')<=today&&(!stay.checkOutDate||stay.checkOutDate>=today))||stays.find(stay=>(stay.checkInDate||'9999')>=today)||stays[0]||null;
}
export function getTripPackingProgress(trip){
  const items=asArray(trip?.packing);const packed=items.filter(item=>Boolean(item.packed)).length;
  const categories={};
  items.forEach(item=>{const category=item.category||'Other';categories[category]??={total:0,packed:0};categories[category].total+=1;if(item.packed)categories[category].packed+=1});
  Object.keys(categories).forEach(key=>{const item=categories[key];item.percentage=item.total?Math.round(item.packed/item.total*100):0});
  return {total:items.length,packed,remaining:Math.max(0,items.length-packed),percentage:items.length?Math.round(packed/items.length*100):0,categories};
}
export function getTripConfirmationsSummary(trip){
  const entries=[];
  asArray(trip?.confirmations).forEach(item=>entries.push({id:item.id,label:item.label||'Trip reference',value:item.value||'',notes:item.notes||'',source:'Trip'}));
  asArray(trip?.flights).forEach(item=>{if(item.confirmation)entries.push({id:'flight-'+item.id,label:'Flight '+(item.airline||'')+' '+(item.flightNumber||''),value:item.confirmation,notes:item.terminalGate||'',source:'Flight'});});
  asArray(trip?.stays).forEach(item=>{if(item.confirmation)entries.push({id:'stay-'+item.id,label:item.name||'Stay',value:item.confirmation,notes:item.address||'',source:'Stay'});});
  asArray(trip?.transport).forEach(item=>{if(item.confirmation)entries.push({id:'transport-'+item.id,label:item.type||'Transport',value:item.confirmation,notes:item.pickup||'',source:'Transport'});});
  return entries;
}
export function getTripDayAgenda(trip,date=localTravelDate()){
  const key=localTravelDate(date);
  return asArray(trip?.itinerary).filter(item=>item.date===key).slice().sort((a,b)=>dateTimeKey(a.date,a.time).localeCompare(dateTimeKey(b.date,b.time)));
}
export function getTripPackingByCategory(trip,category='All'){
  const items=asArray(trip?.packing);return category==='All'?items:items.filter(item=>(item.category||'Other')===category);
}
export function getLinkedConvention(trip,conventions=[]){
  return asArray(conventions).find(item=>String(item.id)===String(trip?.linkedConventionId))||null;
}
export function getTripReadiness(trip,date=localTravelDate()){
  const active=isTripDay(trip,date)||trip?.status==='Traveling';
  const flight=getNextFlight(trip,date);const stay=getCurrentOrNextStay(trip,date);
  return {active,flight,stay,agenda:getTripDayAgenda(trip,date),packing:getTripPackingProgress(trip),confirmations:getTripConfirmationsSummary(trip),emergencyInfo:trip?.emergencyInfo||''};
}
export function getTravelSummary(rawTravel,date=localTravelDate()){
  const root=normalizeTravelRoot(rawTravel);const active=getActiveTrip(root,date);const upcoming=getUpcomingTrips(root,date);const trip=active&&!['complete','completed'].includes(String(active.status||'').toLowerCase())?active:(upcoming[0]||active||null);
  return {trip,activeTrip:active,upcomingTrips:upcoming,nextFlight:getNextFlight(trip,date),nextStay:getCurrentOrNextStay(trip,date),packing:trip?getTripPackingProgress(trip):{total:0,packed:0,remaining:0,percentage:0,categories:{}},confirmations:trip?getTripConfirmationsSummary(trip):[],agenda:trip?getTripDayAgenda(trip,date):[],countdown:trip?getTripCountdown(trip,date):null};
}
export function getResetDefaults(){return RESET_DEFAULTS.slice();}
