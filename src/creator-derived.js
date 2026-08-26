const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const CREATOR_STAGES = ['Ideas','To Film','Editing','Ready','Posted'];
export const CREATOR_PLATFORMS = ['TikTok','Instagram','YouTube','X / Twitter','Other'];
export const COLLABORATOR_ROLES = ['Photographer','Videographer','Editor','Cosplayer','Vendor','Brand','Other'];
export const COLLAB_STATUSES = ['Pitch / Inquiry','Discussing','Confirmed','Delivering','Complete'];

export const localDate = (value = new Date()) => {
  if (typeof value === 'string' && DATE_RE.test(value)) return value;
  const date = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return localDate(new Date());
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2,'0') + '-' + String(date.getDate()).padStart(2,'0');
};
const idFor = (prefix, index = 0) => prefix + '-' + Date.now() + '-' + index;
const normalizeList = (list, prefix) => (Array.isArray(list) ? list : []).map((entry, index) => {
  const source = entry && typeof entry === 'object' ? entry : {text:String(entry || '')};
  return {...source, id:source.id ?? idFor(prefix, index), text:source.text ?? source.name ?? '', done:Boolean(source.done)};
});
const normalizePlatformChecklist = (item, platforms) => {
  const existing = Array.isArray(item.platformChecklist) ? item.platformChecklist : [];
  return platforms.map((platform, index) => {
    const found = existing.find(entry => entry?.platform === platform);
    return found ? {...found, platform, ready:Boolean(found.ready), posted:Boolean(found.posted)} : {id:idFor('platform', index),platform,ready:false,posted:false};
  });
};
export function normalizeCreatorItem(rawItem = {}) {
  const item = rawItem && typeof rawItem === 'object' ? rawItem : {};
  const legacyPlatform = item.platform || '';
  const platforms = Array.isArray(item.platforms) ? item.platforms.filter(Boolean) : (legacyPlatform ? [legacyPlatform] : []);
  const safePlatforms = Array.from(new Set(platforms));
  return {
    ...item,
    id:item.id ?? idFor('item'),
    title:item.title || 'Untitled content',
    stage:CREATOR_STAGES.includes(item.stage) ? item.stage : 'Ideas',
    platform:legacyPlatform || safePlatforms[0] || '',
    platforms:safePlatforms,
    collaboratorIds:Array.isArray(item.collaboratorIds) ? item.collaboratorIds : [],
    shootList:normalizeList(item.shootList,'shoot'),
    editChecklist:normalizeList(item.editChecklist,'edit'),
    platformChecklist:normalizePlatformChecklist(item,safePlatforms),
    captionDraft:item.captionDraft || '',
    hashtags:Array.isArray(item.hashtags) ? item.hashtags : [],
    archiveLinks:Array.isArray(item.archiveLinks) ? item.archiveLinks : [],
    analytics:item.analytics && typeof item.analytics === 'object' ? item.analytics : {},
    editDate:item.editDate || '',
    reminderAt:item.reminderAt || '',
    reminderDismissed:Boolean(item.reminderDismissed),
    brandCollabId:item.brandCollabId ?? null
  };
}
export function normalizeCreatorRoot(rawCreator) {
  const source = rawCreator && typeof rawCreator === 'object' ? rawCreator : {};
  return {
    ...source,
    items:(Array.isArray(source.items) ? source.items : []).map(normalizeCreatorItem),
    collaborators:Array.isArray(source.collaborators) ? source.collaborators : [],
    hashtagBank:Array.isArray(source.hashtagBank) ? source.hashtagBank : [],
    archiveLinks:Array.isArray(source.archiveLinks) ? source.archiveLinks : [],
    collabs:Array.isArray(source.collabs) ? source.collabs : []
  };
}
const itemList = input => Array.isArray(input) ? input.map(normalizeCreatorItem) : normalizeCreatorRoot(input).items;
export function getItemsByStage(input, stage) {
  return itemList(input).filter(item => item.stage === stage);
}
const dateFor = value => typeof value === 'string' && DATE_RE.test(value) ? value : value ? localDate(value) : '';
export function getCreatorCalendarEntries(input) {
  return itemList(input).flatMap(item => {
    const entries = [];
    if (item.shootDate) entries.push({id:item.id+'-shoot',itemId:item.id,date:dateFor(item.shootDate),type:'Shoot',label:'Shoot',item});
    if (item.editDate) entries.push({id:item.id+'-edit',itemId:item.id,date:dateFor(item.editDate),type:'Edit',label:'Edit',item});
    if (item.uploadDeadline) entries.push({id:item.id+'-post',itemId:item.id,date:dateFor(item.uploadDeadline),type:'Post',label:'Post deadline',item});
    if (item.reminderAt) entries.push({id:item.id+'-reminder',itemId:item.id,date:dateFor(String(item.reminderAt).slice(0,10)),type:'Reminder',label:'Reminder',item});
    return entries.filter(entry => entry.date);
  });
}
export function getCreatorItemsForDate(input, date) {
  const key = dateFor(date);
  const entries = getCreatorCalendarEntries(input).filter(entry => entry.date === key);
  return Array.from(new Map(entries.map(entry => [entry.itemId, entry.item])).values());
}
export function getUpcomingCreatorDeadlines(input, today = localDate()) {
  return itemList(input).flatMap(item => ['shootDate','editDate','uploadDeadline'].map(field => ({item,field,date:dateFor(item[field])})).filter(entry => entry.date && entry.date >= today).sort((a,b)=>a.date.localeCompare(b.date));
}
export function getCreatorReminderItems(input, today = localDate()) {
  return itemList(input).filter(item => item.reminderAt && !item.reminderDismissed).map(item => ({item,date:dateFor(String(item.reminderAt).slice(0,10))})).filter(entry => entry.date).sort((a,b)=>a.date.localeCompare(b.date));
}
export function getConventionCreatorItems(input, conventionId) {
  return itemList(input).filter(item => String(item.conventionId ?? '') === String(conventionId ?? ''));
}
export function getConventionCreatorSummary(input, convention) {
  const items = getConventionCreatorItems(input, convention?.id);
  const counts = CREATOR_STAGES.reduce((all, stage) => ({...all,[stage]:items.filter(item=>item.stage===stage).length}), {});
  const target = Math.max(0, Number(convention?.content?.target) || 0);
  const done = Math.max(0, Number(convention?.content?.done) || 0);
  return {items,counts,target,done,remaining:Math.max(0,target-done)};
}
const progress = list => {
  const values = Array.isArray(list) ? list : [];
  return {done:values.filter(item=>item.done).length,total:values.length};
};
export function getItemShootProgress(item) { return progress(normalizeCreatorItem(item).shootList); }
export function getItemEditProgress(item) { return progress(normalizeCreatorItem(item).editChecklist); }
export function getItemPlatformProgress(item) {
  const normalized = normalizeCreatorItem(item);
  return {done:normalized.platformChecklist.filter(entry=>entry.posted).length,total:normalized.platformChecklist.length,ready:normalized.platformChecklist.filter(entry=>entry.ready).length};
}
export function getLinkedCollaborators(item, collaborators = []) {
  const ids = new Set(normalizeCreatorItem(item).collaboratorIds.map(String));
  return (Array.isArray(collaborators) ? collaborators : []).filter(contact => ids.has(String(contact?.id)));
}
export function getDailyCreatorFocus(input, date = localDate()) {
  const items = itemList(input);
  const entries = getCreatorCalendarEntries(items).filter(entry => entry.date === date);
  const due = items.filter(item => item.uploadDeadline === date || item.reminderAt?.slice(0,10) === date);
  return {
    date,
    shoots:entries.filter(entry=>entry.type==='Shoot').map(entry=>entry.item),
    edits:entries.filter(entry=>entry.type==='Edit').map(entry=>entry.item),
    posts:entries.filter(entry=>entry.type==='Post').map(entry=>entry.item),
    reminders:items.filter(item=>item.reminderAt?.slice(0,10) === date && !item.reminderDismissed),
    due:Array.from(new Map([...due,...entries.map(entry=>entry.item)].map(item=>[item.id,item])).values())
  };
}
export function getItemsDueSoon(input, today = localDate(), days = 3) {
  const end = new Date(today+'T12:00:00');
  end.setDate(end.getDate()+days);
  const endKey = localDate(end);
  return itemList(input).filter(item => [item.shootDate,item.editDate,item.uploadDeadline].some(value => {const date=dateFor(value);return date && date>=today && date<=endKey}));
}
