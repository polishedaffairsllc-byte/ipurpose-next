/** UG-reference layouts. Input is private reconciled copy; this module contains no contacts or tokens. */
export const SIZE={width:1280,height:720};
export const LINKS=[
 {slide:1,destination:'ipurpose',label:'Visit iPurpose (opens in a new tab)',box:[66,40,310,66]},
 {slide:1,destination:'founder',label:'Visit Renita Hamilton (opens in a new tab)',box:[66,628,245,34]},
 {slide:2,destination:'ipurpose',label:'Visit iPurpose (opens in a new tab)',box:[57,40,600,68]},
 {slide:2,destination:'founder',label:'WHO BUILT IT — Renita Hamilton, MPS, Founder & CEO (opens in a new tab)',box:[57,445,1166,204]},
];
const C={indigo:'#4B4E6D',lavender:'#9C88FF',peach:'#FCC4B7',sage:'#88B04B',gold:'#E6C87C',mist:'#F5F7FA',white:'#FFFFFF',border:'#DADDE5'};
function shape(s,name,x,y,w,h,fill,geometry='rect',stroke='none'){return s.shapes.add({name,geometry,position:{left:x,top:y,width:w,height:h},fill,line:{fill:stroke,width:stroke==='none'?0:1,style:'solid'},...(geometry==='roundRect'?{borderRadius:12}: {})});}
function txt(s,name,text,x,y,w,h,size=24,color=C.indigo,bold=false,serif=false){const t=shape(s,name,x,y,w,h,'none','textbox');t.text=text;t.text.style={typeface:serif?'DejaVu Serif':'Carlito',fontSize:size,color,bold,wrap:'square',autoFit:'none',verticalAlignment:'top',insets:0};return t;}
function card(s,name,x,y,w,h,accent=C.lavender,fill=C.white){shape(s,name,x,y,w,h,fill,'roundRect',C.border);shape(s,name+'-accent',x,y+12,8,h-24,accent);}
function footer(s,n,dark=false){const color=dark?C.white:C.indigo;txt(s,'footer-wordmark','iPurpose',57,677,100,20,12,color,true);txt(s,'footer-philosophy','Soul · Systems · AI.',163,677,220,20,12,color);txt(s,'footer-copyright','© 2026 iPurpose. All rights reserved.',535,677,400,20,11,color);txt(s,'footer-confidential','CONFIDENTIAL CONCEPT FOR DISCUSSION',956,679,266,18,9,color);txt(s,'footer-number',String(n),1230,676,20,20,12,color,true);}
export function authorDeck(presentation,record){
 const start=presentation.slides.items.length;
 for(const data of record.slides){
  const n=data.number,s=presentation.slides.add({width:1280,height:720});s.background.fill=n===1||n===3?C.indigo:C.mist;
  const ps=data.paragraphs;
  if(n===1){
   shape(s,'cover-lavender',970,-170,480,480,C.lavender,'ellipse');shape(s,'cover-peach',1080,400,350,350,C.peach,'ellipse');shape(s,'cover-gold',894,561,116,116,C.gold,'ellipse');
   txt(s,'linked-wordmark','iPurpose',66,40,500,75,58,C.white,true,true);txt(s,'philosophy','Soul · Systems · AI.',67,125,600,30,21,C.white);
   const institution=ps[0]; const badgeSize=institution.length>75?17:institution.length>53?19:22;
   shape(s,'institution-frame',66,201,988,74,'none','roundRect',C.gold);txt(s,'institution-title',institution,84,217,952,54,badgeSize,C.gold,true);
   txt(s,'opening-title',ps[1],66,316,1010,170,40,C.white,true,true);
   txt(s,'recipient',record.prepared_for,66,526,965,80,20,C.gold);
   txt(s,'linked-founder','Renita Hamilton, MPS — Founder & CEO, iPurpose.',66,630,1050,40,22,C.white,true);
  }else{
   shape(s,'top-rule',0,0,1280,10,C.lavender);
   const dark=n===3,color=dark?C.white:C.indigo;
   txt(s,'slide-title',data.title,57,45,1166,99,data.title.length>43?35:42,color,true,true);
   if(n===2){
    txt(s,'introduction',ps[0],57,132,1166,65,21);
    const split=ps[1].split(': ');txt(s,'framework',split[0],420,203,790,50,29,C.indigo,true,true);
    const bits=split.slice(1).join(': ').split('; ');
    ['Soul','Systems','AI'].forEach((title,i)=>{const x=57+i*397;card(s,'pillar-'+i,x,272,372,145,[C.lavender,C.sage,C.gold][i]);txt(s,'pillar-title-'+i,title,x+27,290,320,32,25,C.indigo,true);txt(s,'pillar-copy-'+i,bits[i]||'',x+27,335,320,72,21);});
    shape(s,'founder-card',57,445,1166,204,C.white,'roundRect',C.lavender);
    txt(s,'founder-label','WHO BUILT IT',89,463,1000,25,14,C.indigo,true);
    const bio=ps[2].replace(/^WHO BUILT IT: /,'');const stop=bio.indexOf('. ');
    txt(s,'founder-heading',bio.slice(0,stop+1),89,500,1097,40,24,C.indigo,true,true);
    txt(s,'founder-biography',bio.slice(stop+2),89,550,1097,82,20);
   }else if(n===5){
    ps.slice(0,3).forEach((t,i)=>{const y=160+i*126;card(s,'week-'+i,57,y,1166,108,[C.lavender,C.sage,C.gold][i]);const colon=t.indexOf(': ');txt(s,'week-label-'+i,t.slice(0,colon),83,y+17,225,70,23,C.indigo,true);txt(s,'week-copy-'+i,t.slice(colon+2),325,y+17,862,80,22);});
    txt(s,'scope',ps[3],57,557,1166,75,20);
   }else if(n===3){
    txt(s,'institutional-context',ps[0],57,164,1166,133,28,C.white);
    card(s,'rationale-card',57,320,1166,213,C.gold);
    txt(s,'rationale',ps[1],88,345,1104,162,26);
    txt(s,'complement',ps[2],57,568,1166,74,22,C.white);
   }else if(n===8){
    txt(s,'invitation',ps[0],57,173,1166,162,32,C.indigo,true,true);
    card(s,'perspective-card',57,368,1166,130,C.peach);txt(s,'perspective',ps[1],88,396,1104,90,25);
    shape(s,'invitation-cta',57,543,1166,73,C.indigo,'roundRect');txt(s,'invitation-cta-copy',ps[2].replace(/^CTA: /,''),84,562,1110,44,24,C.white,true);
   }else{
    txt(s,'main-statement',ps[0],57,168,1166,138,27);
    card(s,'institution-card',57,332,1166,177,[C.lavender,C.peach,C.sage][n%3]);txt(s,'institution-application',ps[1],88,355,1104,134,24);
    txt(s,'closing-statement',ps[2],57,545,1166,99,21);
   }
   footer(s,n,dark);
  }
 }
 return {start,end:presentation.slides.items.length,links:LINKS};
}
