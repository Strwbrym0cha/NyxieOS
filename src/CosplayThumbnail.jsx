import React,{useState} from 'react';

export default function CosplayThumbnail({reference,className=''}) {
 const [failed,setFailed]=useState(false);
 const url=typeof reference==='string'?reference:reference?.url;
 const label=typeof reference==='object'&&reference?.label?reference.label:'Cosplay reference';
 if(!url||failed)return <div className={'cosplay-thumb cosplay-thumb-placeholder '+className} aria-label="Cosplay reference placeholder">✿</div>;
 return <img className={'cosplay-thumb '+className} src={url} alt={label} onError={()=>setFailed(true)} />;
}
