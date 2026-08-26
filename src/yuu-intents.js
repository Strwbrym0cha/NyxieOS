const RELATIONSHIP_PATTERN=/\b(relationship|relationships|dating|crush|ex|exes|partner|partners|boyfriend|girlfriend|romance|romantic|love life|text my ex)\b/;
const MODULES={home:'home',plan:'plan',money:'money',cosplay:'cosplay',convention:'conventions',conventions:'conventions',travel:'travel',creator:'creator',content:'creator',wellness:'wellness',routine:'routines',routines:'routines',yuu:'yuu',settings:'settings'};

export function normalizeInput(value=''){return String(value).toLowerCase().replace(/[’‘]/g,"'").replace(/[—–]/g,'-').replace(/[^a-z0-9'$ ]/g,' ').replace(/\s+/g,' ').trim()}

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
 if(/\b(what mode am i in|which mode|current mode|what are we doing today)\b/.test(text))return {intent:'mode_status',text};
 if(/\b(what do i need to remember today|remember today)\b/.test(text))return {intent:'reminder_status',topic:'today',text};
 if(/\b(anything important today|what is important today|what's important today|important today)\b/.test(text))return {intent:'reminder_status',topic:'important',text};
 if(/\b(what is overdue|what's overdue|overdue reminders|overdue)\b/.test(text))return {intent:'reminder_status',topic:'overdue',text};
 if(/\b(what reminders are coming up|upcoming reminders|reminders? coming up)\b/.test(text))return {intent:'reminder_status',topic:'upcoming',text};
 if(/\b(what do i need to remember|reminders?|remember)\b/.test(text))return {intent:'reminder_status',topic:'today',text};
 if(/\b(how much should i make|make per day|per remaining day|aim to make|target today|today target)\b/.test(text))return {intent:'money_status',topic:'dailyTarget',text};
 if(/\b(bills?|subscriptions?|obligations?)\b/.test(text))return {intent:'money_status',topic:'obligations',text};
 if(/\b(gig profit|gig earnings|gig expenses|logged gig)\b/.test(text))return {intent:'money_status',topic:'gigProfit',text};
 if(/\b(convention fund|travel fund|cosplay fund|savings fund|savings goal)\b/.test(text))return {intent:'money_status',topic:'fund',subject:(text.match(/(convention fund|travel fund|cosplay fund|savings fund|savings goal)/)||[])[1]||'',text};
 if(/\b(planned needs|planned expenses|planned upcoming|how much .*planned)\b/.test(text))return {intent:'money_status',topic:'planned',text};
 if(/\b(how much|cost|budget|need|planned)\b.*\bcosplay\b/.test(text))return {intent:'money_status',topic:'cosplay',text};
 if(/\b(how am i doing|how am i today|wellness today)\b/.test(text))return {intent:'wellness_status',topic:'today',text};
 if(/\b(how much water|water have i had|water today)\b/.test(text))return {intent:'wellness_status',topic:'water',text};
 if(/\b(did i eat|have i eaten|meals today|what did i eat)\b/.test(text))return {intent:'wellness_status',topic:'meals',text};
 if(/\b(how did i sleep|sleep last night|how was my sleep)\b/.test(text))return {intent:'wellness_status',topic:'sleep',text};
 if(/\b(did i work out|did i workout|movement today|gym today|exercise today)\b/.test(text))return {intent:'wellness_status',topic:'movement',text};
 if(/\b(how was my week|wellness this week|week wellness)\b/.test(text))return {intent:'wellness_status',topic:'week',text};
 if(/\b(low energy|tired|wellness|water|meals?|sleep|rest day|movement|feeling exhausted)\b/.test(text))return {intent:'wellness_status',text};
 if(/\b(work window|work windows|shift|shifts|when should i work|when can i work|work today|work tonight)\b/.test(text))return {intent:'work_status',text};
 if(/\b(what do i need to film|what should i film|to film|film next)\b/.test(text))return {intent:'creator_status',topic:'toFilm',text};
 if(/\b(what am i editing|editing queue|what.*editing)\b/.test(text))return {intent:'creator_status',topic:'editing',text};
 if(/\b(what needs to post|post soon|posting today|what am i posting)\b/.test(text))return {intent:'creator_status',topic:'posting',text};
 if(/\b(what content.*con|content.*convention|con content)\b/.test(text))return {intent:'creator_status',topic:'convention',text};
 if(/\b(who am i shooting with|who.*shooting|collaborator|photographer)\b/.test(text))return {intent:'creator_status',topic:'collaborators',text};
 const caption=text.match(/(?:what caption did i write|what is the caption|what caption).*?\bfor\s+(.+)$/);
 if(caption)return {intent:'creator_status',topic:'caption',subject:caption[1].trim(),text};
 if(/\b(what caption|caption did i write)\b/.test(text))return {intent:'creator_status',topic:'caption',text};
 if(/\b(creator work.*attention|creator.*attention|content needs attention)\b/.test(text))return {intent:'creator_status',topic:'attention',text};
 if(/\b(content|creator|film|filming|video|upload|shoot|posted|editing)\b/.test(text))return {intent:'creator_status',text};
 if(/\b(what.s next at the con|what is next at the con|next at the convention|next at con)\b/.test(text))return {intent:'convention_status',topic:'next',text};
 if(/\b(what should i prep next|prep next|what do i prep)\b/.test(text))return {intent:'convention_status',topic:'prep',text};
 if(/\b(photoshoot|photoshoot today|photoshoots today)\b/.test(text))return {intent:'convention_status',topic:'photoshoots',text};
 if(/\b(content.*need|content.*left|how much content)\b/.test(text))return {intent:'convention_status',topic:'content',text};
 if(/\b(convention|conventions|con prep|con prep|con day|packing for the con|next con)\b/.test(text))return {intent:'convention_status',text};
 if(/\b(travel|trip|flight|flights|airline|airport|lodging|hotel|packing for my trip)\b/.test(text))return {intent:'travel_status',text};
 if(/\b(still need to buy|what.*need.*buy)\b/.test(text))return {intent:'cosplay_status',topic:'buy',text};
 if(/\b(still need to buy|need to buy|what.*buy|buy|commission)\b/.test(text)&&/\b(cosplay|costume|piece|wig|contacts|shoes|prop)\b/.test(text))return {intent:'cosplay_status',topic:'buy',text};
 if(/\bcontacts?\b/.test(text))return {intent:'cosplay_status',topic:'contacts',text};
 if(/\bshoes?\b/.test(text))return {intent:'cosplay_status',topic:'shoes',text};
 if(/\b(repair|repairs|repairing)\b/.test(text))return {intent:'cosplay_status',topic:'repairs',text};
 if(/\b(not packed|isn.t packed|what.*packed|packed)\b/.test(text))return {intent:'cosplay_status',topic:'packed',text};
 if(/\b(what piece is next|piece is next|next piece)\b/.test(text))return {intent:'cosplay_status',topic:'next',text};
 if(/\b(how ready|ready is my cosplay|readiness)\b/.test(text))return {intent:'cosplay_status',topic:'readiness',text};
 if(/\b(cosplay|costume|wig|jacket|boots|piece|pieces|ready for)\b/.test(text))return {intent:'cosplay_status',topic:'attention',text};
 if(/\b(money|cash|wallet|weekly goal|weekly mission|earned|spendable|available today|how much do i have)\b/.test(text))return {intent:'money_status',text};
 if(/\b(what routines do i have today|routines? today|what routines apply)\b/.test(text))return {intent:'routine_status',topic:'today',text};
 if(/\b(what routine is left|what routines? remain|routine.*left)\b/.test(text))return {intent:'routine_status',topic:'remaining',text};
 if(/\b(how far am i in my routine|routine progress|how much.*routine.*done)\b/.test(text))return {intent:'routine_status',topic:'progress',text};
 if(/\b(did i skip my routine|did i skip a routine|skipped routine)\b/.test(text))return {intent:'routine_status',topic:'skipped',text};
 if(/\b(what is the tiny version|tiny version|tiny routine)\b/.test(text))return {intent:'routine_status',topic:'tiny',text};
 if(/\b(can i do this tomorrow|try tomorrow|routine tomorrow)\b/.test(text))return {intent:'routine_status',topic:'tomorrow',text};
 if(/\b(routine|routines|ritual|steps)\b/.test(text))return {intent:'routine_status',text};
 if(/\b(today|to do|todo|task|tasks|my list|schedule|what do i need|what's on)\b/.test(text))return {intent:'today_tasks',text};
 if(/\b(coming up|upcoming|this week|next)\b/.test(text))return {intent:'upcoming',text};
 return {intent:'unknown',text};
}

export const supportedIntents=['greeting','today_tasks','upcoming','mode_status','reminder_status','money_status','cosplay_status','convention_status','travel_status','creator_status','routine_status','wellness_status','work_status','help','thanks','unknown','relationship_boundary'];
