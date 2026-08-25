import React,{useEffect,useRef,useState} from 'react';
import {normalizeInput,parseIntent} from './yuu-intents.js';
import {generateReply} from './yuu-dialogue.js';
import {getPlannerContext,localDate,shiftDate} from './yuu-context.js';

const HISTORY_LIMIT=50;
const QUICK_PROMPTS=['Today','Coming Up','Money','Cosplay','Content','Convention','Travel','Low Energy'];
const promptText={Today:'What do I need to do today?',Coming Up:"What's coming up?",Money:"How's my money?",Cosplay:'What cosplay needs attention?',Content:'What content is due?',Convention:"How's convention prep?",Travel:"What's my travel plan?",'Low Energy':"I'm low energy"};
const trimHistory=history=>(history||[]).slice(-HISTORY_LIMIT);
const message=(role,text,state='normal')=>({id:Date.now()+Math.random(),role,text,state,createdAt:new Date().toISOString()});
const titleMatch=(title,query)=>{const a=normalizeInput(title),b=normalizeInput(query);return a===b||a.includes(b)||b.includes(a)};

export default function YuuChat({data,setData,setScreen}){
 const history=data.yuu?.history||[];
 const [input,setInput]=useState('');
 const [pending,setPending]=useState(null);
 const historyRef=useRef(null);
 useEffect(()=>{const node=historyRef.current;if(node)node.scrollTop=node.scrollHeight},[history.length]);
 const saveMessages=(userText,reply,intent,mutate)=>{
   setData(previous=>{
     const current=previous.yuu?.history||[];
     const nextHistory=trimHistory([...current,message('user',userText),message('yuu',reply.text,reply.state)]);
     const next={...previous,yuu:{...(previous.yuu||{}),history:nextHistory,lastIntent:intent}};
     return mutate?mutate(next):next;
   });
 };
 const addYuuOnly=(text,state='normal',mutate)=>setData(previous=>{
   const current=previous.yuu?.history||[];
   const next={...previous,yuu:{...(previous.yuu||{}),history:trimHistory([...current,message('yuu',text,state)])}};
   return mutate?mutate(next):next;
 });
 const answer=(raw)=>{
   const text=String(raw||'').trim();
   if(!text)return;
   const parsed=parseIntent(text,{lastIntent:data.yuu?.lastIntent});
   let intent=parsed.intent;
   let options={seed:history.length};
   if(parsed.intent==='follow_up'){
     const prior=parsed.lastIntent||data.yuu?.lastIntent;
     const canContinue=['today_tasks','upcoming','money_status','cosplay_status','convention_status','travel_status','creator_status','routine_status','wellness_status','work_status'].includes(prior);
     if(!canContinue){
       saveMessages(text,{text:'Tell me which planner area you want to continue with: tasks, money, cosplay, conventions, travel, content, routines, work, or wellness.',state:'normal'},'unknown');
       return;
     }
     intent=prior;
     options={...options,more:parsed.kind==='more'};
     if(parsed.kind==='tomorrow'){
       if(prior!=='today_tasks'&&prior!=='work_status'){
         saveMessages(text,{text:'Tomorrow is a little vague from here. Pick a planner area and I shall check it.',state:'normal'},'unknown');
         return;
       }
       options.date=shiftDate(localDate(),1);
     }
   }
   if(parsed.intent==='add_task'){
     setPending({type:'add_task',title:parsed.title,userText:text});
     saveMessages(text,{text:'Add “'+parsed.title+'” to today’s anytime tasks?',state:'normal'},'today_tasks');
     return;
   }
   if(parsed.intent==='complete_task'){
     const matches=(data.tasks||[]).filter(task=>!task.done&&titleMatch(task.title,parsed.title));
     if(matches.length!==1){
       const reply=matches.length?'I found more than one match: '+matches.map(task=>task.title).join(', ')+'. Tell me the exact title.':'I could not find one clear unfinished task matching that.';
       saveMessages(text,{text:reply,state:'normal'},'today_tasks');
       return;
     }
     setPending({type:'complete_task',taskId:matches[0].id,title:matches[0].title,userText:text});
     saveMessages(text,{text:'Mark “'+matches[0].title+'” complete?',state:'normal'},'today_tasks');
     return;
   }
   if(parsed.intent==='skip_routine'){
     const routines=data.routines||[];
     const matches=routines.filter(routine=>!parsed.title||titleMatch(routine.name,parsed.title));
     if(matches.length!==1){
       const reply=matches.length?'Which routine should I skip? '+matches.map(routine=>routine.name).join(', ')+'.':'I could not find that routine.';
       saveMessages(text,{text:reply,state:'normal'},'routine_status');
       return;
     }
     setPending({type:'skip_routine',routineId:matches[0].id,title:matches[0].name,userText:text});
     saveMessages(text,{text:'Skip “'+matches[0].name+'” for today?',state:'normal'},'routine_status');
     return;
   }
   const reply=generateReply(intent,data,data.settings,options);
   saveMessages(text,reply,intent);
   if(parsed.intent==='open_module')setScreen(parsed.module);
 };
 const confirmPending=()=>{
   if(!pending)return;
   const today=localDate();
   if(pending.type==='add_task'){
     const title=pending.title;
     addYuuOnly('Added “'+title+'” to today’s tasks. Try not to make it lonely.', 'proud',previous=>({...previous,tasks:[...(previous.tasks||[]),{id:Date.now(),title,date:today,time:null,done:false,urgent:false}],yuu:{...(previous.yuu||{}),lastIntent:'today_tasks'}}));
   }else if(pending.type==='complete_task'){
     addYuuOnly('Done. “'+pending.title+'” is marked complete.', 'proud',previous=>({...previous,tasks:(previous.tasks||[]).map(task=>task.id===pending.taskId?{...task,done:true}:task),yuu:{...(previous.yuu||{}),lastIntent:'today_tasks'}}));
   }else if(pending.type==='skip_routine'){
     addYuuOnly('Fine. “'+pending.title+'” is skipped for today. Try again tomorrow.', 'sleepy',previous=>({...previous,routines:(previous.routines||[]).map(routine=>routine.id===pending.routineId?{...routine,skipped:{...(routine.skipped||{}),[today]:true}}:routine),yuu:{...(previous.yuu||{}),lastIntent:'routine_status'}}));
   }
   setPending(null);
 };
 const cancelPending=()=>{addYuuOnly('No change made. I will pretend that was your plan.', 'normal');setPending(null)};
 const greeting= data.settings?.yuuEnabled===false?'Prompts are off. You can wake me back up in Settings.':'Yare yare. I am Yuu-Kun. Ask me about your planner, or tap a prompt below.';
 return <><header className="yuu-chat-header"><div><small>More · Local planner assistant</small><h1>Yuu-Kun</h1></div><div className={'yuu-chat-avatar yuu-state-'+(history[history.length-1]?.state||'normal')}>Y</div></header><div className="yuu-chat-shell"><div className="yuu-chat-history" ref={historyRef} aria-live="polite">{!history.length&&<div className="yuu-message yuu-message-bubble"><div className="yuu-message-avatar">Y</div><p>{greeting}</p></div>}{history.map(item=><div className={'yuu-message '+(item.role==='user'?'user-message':'yuu-message-bubble')} key={item.id}>{item.role!=='user'&&<div className="yuu-message-avatar">Y</div>}<p>{item.text}</p></div>)}{pending&&<div className="yuu-confirm"><p>Ready when you are.</p><div><button className="primary" onClick={confirmPending}>Confirm</button><button className="secondary" onClick={cancelPending}>Cancel</button></div></div>}</div><div className="yuu-quick-prompts" aria-label="Quick prompts">{QUICK_PROMPTS.map(prompt=><button key={prompt} className="quick-prompt" onClick={()=>answer(promptText[prompt])}>{prompt}</button>)}</div><form className="yuu-composer" onSubmit={event=>{event.preventDefault();answer(input);setInput('')}}><input aria-label="Message Yuu-Kun" value={input} onChange={event=>setInput(event.target.value)} placeholder="Ask Yuu-Kun…" autoComplete="off"/><button className="primary" type="submit" aria-label="Send message">Send</button></form></div></>;
}
