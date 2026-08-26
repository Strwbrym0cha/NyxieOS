import React,{useMemo,useState} from 'react';
import CosplayThumbnail from './CosplayThumbnail.jsx';
import {COSPLAY_CATEGORIES,filterCosplayProjects,getDaysRemaining,getNextCosplayPiece,getPackedCount,getPrimaryReference,getProjectProgress,getRemainingPieces,getReadyCount,getTargetDateLabel,normalizeProjectState,normalizeStatus} from './cosplay-derived.js';

const Card=({children,className=''})=><section className={'card '+className}>{children}</section>;
const STATES=['Wishlist','Planning','Making','Buying','Ready'];
const METHODS=['Make','Buy','Commission'];
const STATUSES=['Planning','In Progress','Ordered','Arrived','Ready'];
const REPAIRS=['None','Needs Repair','Repairing','Repaired'];
const money=value=>String.fromCharCode(36)+Math.max(0,Number(value)||0).toFixed(2);
const projectBlank={name:'',source:'',state:'Planning',targetEvent:'',targetDate:'',budget:0,notes:'',pieces:[],referenceImages:[],primaryReference:null};
const pieceBlank={name:'',category:'Other',method:'Make',cost:0,status:'Planning',seller:'',due:'',link:'',urgent:false,ordered:false,arrived:false,repairStatus:'None',packed:false,notes:''};
const referenceBlank={url:'',label:'',note:''};

function Field({label,children,wide=false}){return <label className={wide?'form-field form-field-wide':'form-field'}><span>{label}</span>{children}</label>}
function Toggle({label,checked,onChange}){return <label className="toggle-row"><input type="checkbox" checked={Boolean(checked)} onChange={onChange}/><span>{label}</span></label>}
function targetText(project){const date=getTargetDateLabel(project?.targetDate);return [project?.targetEvent,date].filter(Boolean).join(' · ')||'No target set'}

export default function CosplayCrud({data,setData}){
 const cosplay=data.cosplay||{activeId:null,projects:[]};
 const projects=Array.isArray(cosplay.projects)?cosplay.projects:[];
 const [filter,setFilter]=useState('All');
 const [selected,setSelected]=useState(null);
 const [category,setCategory]=useState('All');
 const [projectEdit,setProjectEdit]=useState(null);
 const [pieceEdit,setPieceEdit]=useState(null);
 const [referenceEdit,setReferenceEdit]=useState(null);
 const project=projects.find(item=>String(item.id)===String(selected))||null;
 const saveProjects=(next,preferredActive=cosplay.activeId)=>{
   const active=next.find(item=>preferredActive!=null&&String(item.id)===String(preferredActive))||next[0]||null;
   const activeId=active?.id??null;
   setData({...data,cosplay:{...cosplay,projects:next,activeId,name:active?.name,progress:active?getProjectProgress(active):0,pieces:active?.pieces||[]}});
 };
 const setActive=id=>{const active=projects.find(item=>String(item.id)===String(id));setData({...data,cosplay:{...cosplay,activeId:active?.id??null,name:active?.name,progress:active?getProjectProgress(active):0,pieces:active?.pieces||[]}})};
 const removeProject=target=>{
   if(!window.confirm('Delete this cosplay project?'))return;
   const next=projects.filter(item=>String(item.id)!==String(target.id));
   const cleaned={...data,cosplay:{...cosplay,projects:next,activeId:next[0]?.id??null,name:next[0]?.name,progress:next[0]?getProjectProgress(next[0]):0,pieces:next[0]?.pieces||[]}};
   cleaned.creator={...data.creator,items:(data.creator?.items||[]).map(item=>String(item.cosplayId)===String(target.id)?{...item,cosplayId:null}:item)};
   cleaned.conventions={...data.conventions,items:(data.conventions?.items||[]).map(item=>({...item,linkedCosplayIds:(item.linkedCosplayIds||[]).filter(id=>String(id)!==String(target.id)),cosplayIds:(item.cosplayIds||[]).filter(id=>String(id)!==String(target.id))}))};
   setData(cleaned);setSelected(null);setProjectEdit(null);
 };
 const submitProject=event=>{
   event.preventDefault();
   const nextProject={...projectEdit,id:projectEdit.id??Date.now(),budget:Math.max(0,Number(projectEdit.budget)||0),pieces:Array.isArray(projectEdit.pieces)?projectEdit.pieces:[],referenceImages:Array.isArray(projectEdit.referenceImages)?projectEdit.referenceImages:[],state:projectEdit.state||'Planning'};
   saveProjects(projectEdit.id!=null?projects.map(item=>String(item.id)===String(nextProject.id)?nextProject:item):[...projects,nextProject]);
   setProjectEdit(null);
 };
 const submitPiece=event=>{
   event.preventDefault();
   if(!project)return;
   const nextPiece={...pieceEdit,id:pieceEdit.id??Date.now(),cost:Math.max(0,Number(pieceEdit.cost)||0),category:pieceEdit.category||'Other',method:pieceEdit.method||'Make',status:pieceEdit.status||'Planning',repairStatus:pieceEdit.repairStatus||'None',ordered:Boolean(pieceEdit.ordered),arrived:Boolean(pieceEdit.arrived),packed:Boolean(pieceEdit.packed),urgent:Boolean(pieceEdit.urgent)};
   const next=projects.map(item=>String(item.id)===String(project.id)?{...item,pieces:nextPiece.id&&item.pieces?.some(piece=>String(piece.id)===String(nextPiece.id))?(item.pieces||[]).map(piece=>String(piece.id)===String(nextPiece.id)?nextPiece:piece):[...(item.pieces||[]),nextPiece]}:item);
   saveProjects(next);setPieceEdit(null);
 };
 const submitReference=event=>{
   event.preventDefault();
   if(!project||!String(referenceEdit.url||'').trim())return;
   const nextRef={...referenceEdit,id:referenceEdit.id??Date.now(),url:String(referenceEdit.url).trim()};
   const refs=Array.isArray(project.referenceImages)?project.referenceImages:[];
   const nextRefs=nextRef.id&&refs.some(ref=>String(ref.id)===String(nextRef.id))?refs.map(ref=>String(ref.id)===String(nextRef.id)?nextRef:ref):[...refs,nextRef];
   const next=projects.map(item=>String(item.id)===String(project.id)?{...item,referenceImages:nextRefs,primaryReference:item.primaryReference||nextRef.id}:item);
   saveProjects(next);setReferenceEdit(null);
 };
 const removePiece=piece=>{
   if(!window.confirm('Delete this cosplay piece?'))return;
   saveProjects(projects.map(item=>String(item.id)===String(project.id)?{...item,pieces:(item.pieces||[]).filter(entry=>String(entry.id)!==String(piece.id))}:item));
 };
 const removeReference=reference=>{
   if(!window.confirm('Delete this reference?'))return;
   const next=projects.map(item=>{
     if(String(item.id)!==String(project.id))return item;
     const refs=(item.referenceImages||[]).filter(entry=>String(entry.id)!==String(reference.id));
     return {...item,referenceImages:refs,primaryReference:String(item.primaryReference)===String(reference.id)?(refs[0]?.id||null):item.primaryReference};
   });
   saveProjects(next);
 };
 const choosePrimary=reference=>saveProjects(projects.map(item=>String(item.id)===String(project.id)?{...item,primaryReference:reference.id}:item));
 const visible=useMemo(()=>filterCosplayProjects(projects,filter),[projects,filter]);
 const filteredPieces=(project?.pieces||[]).filter(piece=>category==='All'||normalizeStatus(piece.category)===normalizeStatus(category));
 if(project)return <ProjectDetail project={project} category={category} setCategory={setCategory} onBack={()=>{setSelected(null);setCategory('All')}} onEdit={()=>setProjectEdit({...project,state:normalizeProjectState(project.state),referenceImages:Array.isArray(project.referenceImages)?project.referenceImages:[]})} onDelete={()=>removeProject(project)} onEditPiece={piece=>setPieceEdit({...pieceBlank,...piece})} onAddPiece={()=>setPieceEdit({...pieceBlank})} onDeletePiece={removePiece} onEditReference={reference=>setReferenceEdit({...referenceBlank,...reference})} onAddReference={()=>setReferenceEdit({...referenceBlank})} onDeleteReference={removeReference} onChoosePrimary={choosePrimary} onSetActive={()=>setActive(project.id)} isActive={String(project.id)===String(cosplay.activeId)} pieceEdit={pieceEdit} setPieceEdit={setPieceEdit} submitPiece={submitPiece} referenceEdit={referenceEdit} setReferenceEdit={setReferenceEdit} submitReference={submitReference} filteredPieces={filteredPieces} />;
 return <><header><div><small>Build it piece by piece ✨</small><h1>Cosplay</h1></div><button className="primary" onClick={()=>setProjectEdit({...projectBlank})}>+ New Cosplay</button></header><div className="filter-chips cosplay-filter-chips">{['All','Making','Buying','Ready','Wishlist'].map(item=><button type="button" className={filter===item?'selected':''} onClick={()=>setFilter(item)} key={item}>{item}</button>)}</div>{visible.map(item=><ProjectCard key={item.id} project={item} isActive={String(item.id)===String(cosplay.activeId)} onOpen={()=>setSelected(item.id)} onEdit={()=>setProjectEdit({...item,state:normalizeProjectState(item.state),referenceImages:Array.isArray(item.referenceImages)?item.referenceImages:[]})} onDelete={()=>removeProject(item)} onSetActive={()=>setActive(item.id)}/>)}{!visible.length&&<Card className="empty-state"><b>No cosplays in this view yet ✨</b><p>All projects remain safe in the All filter.</p></Card>}{projectEdit&&<ProjectForm edit={projectEdit} setEdit={setProjectEdit} submit={submitProject}/>}</>;
}

function ProjectCard({project,isActive,onOpen,onEdit,onDelete,onSetActive}){
 const reference=getPrimaryReference(project);const remaining=getRemainingPieces(project);const next=getNextCosplayPiece(project);
 return <Card className={'cosplay-project-card '+(isActive?'active-project':'')}><div className="cosplay-card-top"><CosplayThumbnail reference={reference}/><div className="cosplay-card-copy"><b>{project.name||'Untitled cosplay'}</b><small>{project.source||'Source not set'}</small><span className="cosplay-state">{normalizeProjectState(project.state)}</span></div></div><div className="cosplay-card-meta"><strong>{getProjectProgress(project)}% ready</strong><span>{targetText(project)}</span><span>{remaining.length} piece{remaining.length===1?'':'s'} remaining</span></div>{next&&<p className="next-piece"><b>Next:</b> {next.name}{next.due?' · due '+next.due:''}{next.urgent?' · urgent':''}</p>}<div className="card-actions"><button type="button" className="edit-action" onClick={onOpen}>Open</button><button type="button" className="edit-action" onClick={onEdit}>Edit</button>{!isActive&&<button type="button" className="secondary" onClick={onSetActive}>Make current</button>}<button type="button" className="delete-action" onClick={onDelete}>Delete</button></div></Card>;
}

function ProjectDetail({project,category,setCategory,onBack,onEdit,onDelete,onEditPiece,onAddPiece,onDeletePiece,onEditReference,onAddReference,onDeleteReference,onChoosePrimary,onSetActive,isActive,pieceEdit,setPieceEdit,submitPiece,referenceEdit,setReferenceEdit,submitReference,filteredPieces}){
 const references=Array.isArray(project.referenceImages)?project.referenceImages:[];const primary=getPrimaryReference(project);const remaining=getRemainingPieces(project);const pieces=Array.isArray(project.pieces)?project.pieces:[];const repairs=pieces.filter(piece=>normalizeStatus(piece.repairStatus)&&normalizeStatus(piece.repairStatus)!=='none'&&normalizeStatus(piece.repairStatus)!=='repaired');
 return <><header><div><small>{project.source||'Cosplay project'}</small><h1>{project.name||'Untitled cosplay'}</h1></div><button type="button" className="secondary" onClick={onBack}>Back</button></header><Card className="cosplay-overview"><div className="cosplay-overview-top"><CosplayThumbnail reference={primary} className="cosplay-thumb-large"/><div><b>{project.name||'Untitled cosplay'}</b><small>{project.source||'Source not set'}</small><span className="cosplay-state">{normalizeProjectState(project.state)}</span></div></div><div className="cosplay-detail-grid"><span><small>Target</small><b>{targetText(project)}</b></span><span><small>Budget</small><b>{money(project.budget)}</b></span><span><small>Progress</small><b>{getProjectProgress(project)}%</b></span><span><small>Ready</small><b>{getReadyCount(project)} / {pieces.length}</b></span><span><small>Packed</small><b>{getPackedCount(project)} / {pieces.length}</b></span><span><small>Remaining</small><b>{remaining.length}</b></span></div>{getNextCosplayPiece(project)&&<p className="next-piece"><b>Next attention:</b> {getNextCosplayPiece(project).name}</p>}{repairs.length>0&&<p className="repair-callout">{repairs.length} piece{repairs.length===1?'':'s'} need repair</p>}{project.notes&&<p className="muted">{project.notes}</p>}<div className="card-actions"><button type="button" className="edit-action" onClick={onEdit}>Edit project</button><button type="button" className="delete-action" onClick={onDelete}>Delete project</button>{!isActive&&<button type="button" className="secondary" onClick={onSetActive}>Make current</button>}</div></Card><Card><div className="section-title-row"><h2>Reference Images</h2><button type="button" className="primary compact-action" onClick={onAddReference}>+ Add</button></div>{references.length?references.map(reference=><div className="cosplay-reference-row" key={reference.id}><CosplayThumbnail reference={reference}/><div className="reference-copy"><b>{reference.label||'Reference'}</b>{reference.note&&<small>{reference.note}</small>}<small>{String(reference.url)}</small></div>{String(project.primaryReference)===String(reference.id)&&<span className="selected-chip">Primary</span>}<div className="card-actions"><button type="button" className="edit-action" onClick={()=>onEditReference(reference)}>Edit</button><button type="button" className="secondary" onClick={()=>onChoosePrimary(reference)}>Primary</button><button type="button" className="delete-action" onClick={()=>onDeleteReference(reference)}>Delete</button></div></div>):<p className="empty-state">No reference links yet. Add a URL when you find inspiration.</p>}{referenceEdit&&<ReferenceForm edit={referenceEdit} setEdit={setReferenceEdit} submit={submitReference}/>}</Card><Card><div className="section-title-row"><h2>Pieces</h2><button type="button" className="primary compact-action" onClick={onAddPiece}>+ Add piece</button></div><div className="filter-chips cosplay-category-chips">{['All','Wig','Contacts','Shoes','Prop','Makeup'].map(item=><button type="button" className={category===item?'selected':''} onClick={()=>setCategory(item)} key={item}>{item}</button>)}</div>{filteredPieces.length?filteredPieces.map(piece=><PieceRow key={piece.id} piece={piece} onEdit={()=>onEditPiece(piece)} onDelete={()=>onDeletePiece(piece)}/>):<p className="empty-state">No pieces in this category yet.</p>}{pieceEdit&&<PieceForm edit={pieceEdit} setEdit={setPieceEdit} submit={submitPiece}/>}</Card></>;
}

function ProjectForm({edit,setEdit,submit}){
 const known=STATES.includes(edit.state)?STATES:[...STATES,edit.state].filter(Boolean);
 return <Card className="cosplay-editor"><form className="log-form cosplay-form-grid" onSubmit={submit}><h2>{edit.id?'Edit cosplay':'New cosplay'}</h2><Field label="Character / project name"><input required value={edit.name||''} onChange={event=>setEdit({...edit,name:event.target.value})}/></Field><Field label="Source / series"><input value={edit.source||''} onChange={event=>setEdit({...edit,source:event.target.value})}/></Field><Field label="Project state"><select value={edit.state||'Planning'} onChange={event=>setEdit({...edit,state:event.target.value})}>{known.map(state=><option key={state}>{state}</option>)}</select></Field><Field label="Target convention"><input value={edit.targetEvent||''} onChange={event=>setEdit({...edit,targetEvent:event.target.value})}/></Field><Field label="Target date"><input type="date" value={edit.targetDate||''} onChange={event=>setEdit({...edit,targetDate:event.target.value})}/></Field><Field label="Budget estimate"><input type="number" min="0" step=".01" value={edit.budget??0} onChange={event=>setEdit({...edit,budget:event.target.value})}/></Field><Field label="Notes" wide><textarea value={edit.notes||''} onChange={event=>setEdit({...edit,notes:event.target.value})}/></Field><div className="form-actions"><button type="submit" className="primary">Save</button><button type="button" className="secondary" onClick={()=>setEdit(null)}>Cancel</button></div></form></Card>;
}

function PieceRow({piece,onEdit,onDelete}){
 const purchase=normalizeStatus(piece.method)==='buy'||normalizeStatus(piece.method)==='commission';const repair=normalizeStatus(piece.repairStatus);
 return <div className="cosplay-piece-row"><div className="piece-copy"><b>{piece.name||'Untitled piece'}</b><small>{piece.category||'Other'} · {piece.method||'Make'} · {money(piece.cost)}{piece.due?' · due '+piece.due:''}</small><small>{piece.status||'Planning'}{purchase&&piece.ordered?' · Ordered':''}{purchase&&piece.arrived?' · Arrived':''}</small>{repair&&repair!=='none'&&repair!=='repaired'&&<span className="repair-chip">{piece.repairStatus}</span>}{piece.packed&&<span className="packed-chip">Packed</span>}{piece.urgent&&<span className="urgent">Urgent</span>}</div><div className="card-actions"><button type="button" className="edit-action" onClick={onEdit}>Edit</button><button type="button" className="delete-action" onClick={onDelete}>Delete</button></div></div>;
}

function PieceForm({edit,setEdit,submit}){
 const purchase=normalizeStatus(edit.method)==='buy'||normalizeStatus(edit.method)==='commission';
 return <Card className="cosplay-editor"><form className="log-form cosplay-form-grid" onSubmit={submit}><h2>{edit.id?'Edit piece':'Add piece'}</h2><Field label="Name"><input required value={edit.name||''} onChange={event=>setEdit({...edit,name:event.target.value})}/></Field><Field label="Category"><select value={edit.category||'Other'} onChange={event=>setEdit({...edit,category:event.target.value})}>{COSPLAY_CATEGORIES.map(item=><option key={item}>{item}</option>)}</select></Field><Field label="Method"><select value={edit.method||'Make'} onChange={event=>setEdit({...edit,method:event.target.value})}>{METHODS.map(item=><option key={item}>{item}</option>)}</select></Field><Field label="Cost"><input type="number" min="0" step=".01" inputMode="decimal" value={edit.cost??0} onChange={event=>setEdit({...edit,cost:event.target.value})}/></Field><Field label="Status"><select value={edit.status||'Planning'} onChange={event=>setEdit({...edit,status:event.target.value})}>{STATUSES.map(item=><option key={item}>{item}</option>)}</select></Field><Field label="Seller / creator"><input value={edit.seller||''} onChange={event=>setEdit({...edit,seller:event.target.value})}/></Field><Field label="Link"><input type="url" value={edit.link||''} onChange={event=>setEdit({...edit,link:event.target.value})}/></Field><Field label="Due date"><input type="date" value={edit.due||''} onChange={event=>setEdit({...edit,due:event.target.value})}/></Field><div className="form-field form-field-wide"><span>Flags</span><div className="toggle-grid"><Toggle label="Urgent" checked={edit.urgent} onChange={event=>setEdit({...edit,urgent:event.target.checked})}/><Toggle label="Packed" checked={edit.packed} onChange={event=>setEdit({...edit,packed:event.target.checked})}/>{purchase&&<><Toggle label="Ordered" checked={edit.ordered} onChange={event=>setEdit({...edit,ordered:event.target.checked})}/><Toggle label="Arrived" checked={edit.arrived} onChange={event=>setEdit({...edit,arrived:event.target.checked})}/></>}</div></div><Field label="Repair status"><select value={edit.repairStatus||'None'} onChange={event=>setEdit({...edit,repairStatus:event.target.value})}>{REPAIRS.map(item=><option key={item}>{item}</option>)}</select></Field><Field label="Notes" wide><textarea value={edit.notes||''} onChange={event=>setEdit({...edit,notes:event.target.value})}/></Field><div className="form-actions"><button type="submit" className="primary">Save</button><button type="button" className="secondary" onClick={()=>setEdit(null)}>Cancel</button></div></form></Card>;
}

function ReferenceForm({edit,setEdit,submit}){
 return <Card className="cosplay-editor"><form className="log-form" onSubmit={submit}><h3>{edit.id?'Edit reference':'Add reference'}</h3><Field label="Image URL"><input required type="url" value={edit.url||''} onChange={event=>setEdit({...edit,url:event.target.value})}/></Field><Field label="Label"><input value={edit.label||''} onChange={event=>setEdit({...edit,label:event.target.value})}/></Field><Field label="Note"><textarea value={edit.note||''} onChange={event=>setEdit({...edit,note:event.target.value})}/></Field><div className="form-actions"><button type="submit" className="primary">Save</button><button type="button" className="secondary" onClick={()=>setEdit(null)}>Cancel</button></div></form></Card>;
}
