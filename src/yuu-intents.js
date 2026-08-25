const RELATIONSHIP_PATTERN=/\b(relationship|relationships|dating|date|dates|crush|ex|exes|partner|partners|boyfriend|girlfriend|romance|romantic|love life|text my ex)\b/;
const MODULES={home:'home',plan:'plan',money:'money',cosplay:'cosplay',convention:'conventions',conventions:'conventions',travel:'travel',creator:'creator',content:'creator',wellness:'wellness',routine:'routines',routines:'routines',yuu:'yuu',settings:'settings'};

export function normalizeInput(value=''){return String(value).toLowerCase().replace(/[’‘]/g,"'").replace(/[—–]/g,'-').replace(/[^a-z0-9'$? ]/g,' ').replace(/\s+/g,' ').trim()}

export function parseIntent(input,{lastIntent=null}={}){
 const text=normalizeInput(input);
 if(!text)return {intent:'unknown',text};
 if(RELATIONSHIP_PATTERN.test(text))return {intent:'relationship_boundary',text};
 const add=text.match(/^(?:add|create|remember)\s+(.+?)(?:\s+to\s+(?:my\s+)?(?:tasks?|list))$/);
 if(add)return {intent:'add_task',title:add[1].trim(),text};
 const done=text.match(/^(?:mark|check off|complete|finish)\s+(.+?)(?:\s+done)?$/);
 if(done)return {intent:'complete_task',title:done[1].trim(),text};
 const open=text.match(/^(?:open|show|go to|take me to)\s+(?:the\s+)?(home|plan|money|cosplay|conventions?|travel|creator(?: hq)?|content|wellness|routines?|yuu(?: kun)?|settings)\b/);
 if(open){const key=open[1].replace(' yuu kun','yuu').replace(' hq','');return {intent:'open_module',module:MODULES[key]||'more',text}}
 const skip=text.match(/^skip(?: today)?\s+(?:my\s+)?routine(?:\s+(.+))?$/);
 if(skip){const title=(skip[1]||'').replace(/\s+today$/,'').trim();return {intent:'skip_routine',title,text}}
 if(/^(?:what else|anything else|and after that|what about tomorrow|and tomorrow)$/.test(text))return {intent:'follow_up',kind:text.includes('tomorrow')?'tomorrow':'more',lastIntent,text};
 if(/^(?:hi|hey|hello|yo|hiya|good morning|good evening)\b/.test(text))return {intent:'greeting',text};
 if(/^(?:thanks|thank you|thx|ty)\b/.test(text))return {intent:'thanks',text};
 if(/^(?:help|what can you do|commands|options)\b/.test(text))return {intent:'help',text};
 if(/\b(low energy|tired|wellness|water|meals?|sleep|rest day|movement|feeling exhausted)\b/.test(text))return {intent:'wellness_status',text};
 if(/\b(work window|work windows|shift|shifts|when should i work|when can i work|work today|work tonight)\b/.test(text))return {intent:'work_status',text};
 if(/\b(content|creator|film|filming|video|upload|shoot|posted|editing)\b/.test(text))return {intent:'creator_status',text};
 if(/\b(convention|conventions|con prep|con prep|con day|packing for the con|next con)\b/.test(text))return {intent:'convention_status',text};
 if(/\b(travel|trip|flight|flights|airline|airport|lodging|hotel|packing for my trip)\b/.test(text))return {intent:'travel_status',text};
 if(/\b(cosplay|costume|wig|jacket|boots|piece|pieces|ready for)\b/.test(text))return {intent:'cosplay_status',text};
 if(/\b(money|cash|wallet|weekly goal|weekly mission|earned|spendable|available today|how much do i have)\b/.test(text))return {intent:'money_status',text};
 if(/\b(routine|routines|ritual|steps)\b/.test(text))return {intent:'routine_status',text};
 if(/\b(today|to do|todo|task|tasks|my list|schedule|what do i need|what's on)\b/.test(text))return {intent:'today_tasks',text};
 if(/\b(coming up|upcoming|this week|next)\b/.test(text))return {intent:'upcoming',text};
 return {intent:'unknown',text};
}

export const supportedIntents=['greeting','today_tasks','upcoming','money_status','cosplay_status','convention_status','travel_status','creator_status','routine_status','wellness_status','work_status','help','thanks','unknown','relationship_boundary'];
