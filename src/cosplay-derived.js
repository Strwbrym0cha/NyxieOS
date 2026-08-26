const DAY_MS=86400000;
const KNOWN_STATES={wishlist:'Wishlist',planning:'Planning',making:'Making',buying:'Buying','in progress':'Making',ready:'Ready'};
const KNOWN_CATEGORIES=['Wig','Contacts','Shoes','Prop','Makeup','Costume','Accessory','Other'];

export const normalizeStatus=value=>String(value??'').trim().toLowerCase();
export const isReady=piece=>normalizeStatus(piece?.status)==='ready';
export const normalizeProjectState=value=>{
 const raw=String(value??'').trim();
 return KNOWN_STATES[normalizeStatus(raw)]||raw||'Planning';
};
const localNoon=value=>{
 if(value instanceof Date)return new Date(value.getFullYear(),value.getMonth(),value.getDate(),12);
 const raw=String(value||'');
 if(/^\\d{4}-\\d{2}-\\d{2}$/.test(raw)){const parts=raw.split('-').map(Number);return new Date(parts[0],parts[1]-1,parts[2],12)}
 const date=new Date(raw);return Number.isNaN(date.getTime())?null:new Date(date.getFullYear(),date.getMonth(),date.getDate(),12);
};
const todayNoon=()=>localNoon(new Date());
export const getProjectProgress=project=>{
 const pieces=Array.isArray(project?.pieces)?project.pieces:[];
 if(pieces.length)return Math.round(pieces.filter(isReady).length/pieces.length*100);
 const legacy=Number(project?.progress);
 return Number.isFinite(legacy)?Math.max(0,Math.min(100,legacy)):0;
};
export const getRemainingPieces=project=>(Array.isArray(project?.pieces)?project.pieces:[]).filter(piece=>!isReady(piece));
export const getPackedCount=project=>(Array.isArray(project?.pieces)?project.pieces:[]).filter(piece=>Boolean(piece?.packed)).length;
export const getDaysRemaining=targetDate=>{
 const target=localNoon(targetDate);const today=todayNoon();
 return target?Math.round((target-today)/DAY_MS):null;
};
export const getTargetDateLabel=targetDate=>{
 const days=getDaysRemaining(targetDate);
 if(days===null)return '';
 if(days<0)return 'Past target date';
 if(days===0)return 'Target day';
 return days+' days left';
};
export const getNextCosplayPiece=project=>{
 const pieces=getRemainingPieces(project);
 return pieces.map((piece,index)=>({...piece,__index:index})).sort((a,b)=>{
   const urgent=Number(Boolean(b.urgent))-Number(Boolean(a.urgent));
   if(urgent)return urgent;
   const ad=a.due?String(a.due):'9999-12-31',bd=b.due?String(b.due):'9999-12-31';
   const due=ad.localeCompare(bd);if(due)return due;
   return String(a.name||'').localeCompare(String(b.name||''))||a.__index-b.__index;
 })[0]||null;
};
export const getDueSoonPieces=(project,days=7)=>{
 const today=todayNoon();const limit=new Date(today.getTime()+days*DAY_MS);
 return getRemainingPieces(project).filter(piece=>{
   const due=localNoon(piece.due);return due&&due>=today&&due<=limit;
 }).sort((a,b)=>String(a.due).localeCompare(String(b.due)));
};
export const getPrimaryReference=project=>{
 const refs=Array.isArray(project?.referenceImages)?project.referenceImages:[];
 const primary=project?.primaryReference;
 if(primary&&typeof primary==='object'&&primary.url)return primary;
 if(primary){
   const match=refs.find(ref=>String(ref.id)===String(primary));
   if(match)return match;
   if(String(primary).startsWith('http://')||String(primary).startsWith('https://'))return {url:String(primary),label:'Primary reference'};
 }
 const fallback=project?.primaryImage||project?.image||project?.imageUrl||project?.referenceImage;
 if(fallback)return typeof fallback==='object'?fallback:{url:String(fallback),label:'Primary reference'};
 return refs.find(ref=>ref?.url)||null;
};
export const filterCosplayProjects=(projects=[],filter='All')=>{
 const list=Array.isArray(projects)?projects:[];
 if(filter==='All')return list;
 const target=normalizeStatus(filter);
 return list.filter(project=>normalizeStatus(normalizeProjectState(project?.state))===target);
};
export const getReadyCount=project=>{
 const pieces=Array.isArray(project?.pieces)?project.pieces:[];
 return pieces.filter(isReady).length;
};
export const getTargetDateStatus=getTargetDateLabel;
export const COSPLAY_CATEGORIES=KNOWN_CATEGORIES;
