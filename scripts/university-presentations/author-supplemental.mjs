/** Supplemental approved HBCU copy. Reuse the reference's native helpers; never regenerate earlier decks. */
import { C, shape, txt, card, footer, LINKS } from './author.mjs';
export function authorSupplementalDeck(presentation,record) {
 const start=presentation.slides.items.length;
 for(const data of record.slides) {
  const n=data.number,ps=data.paragraphs,s=presentation.slides.add({width:1280,height:720});
  const dark=n===1||n===3;s.background.fill=dark?C.indigo:C.mist;
  if(n===1) {
   shape(s,'cover-lavender',970,-170,480,480,C.lavender,'ellipse');shape(s,'cover-peach',1080,400,350,350,C.peach,'ellipse');shape(s,'cover-gold',894,561,116,116,C.gold,'ellipse');
   txt(s,'linked-wordmark','iPurpose',66,40,500,75,58,C.white,true,true);txt(s,'philosophy','Soul · Systems · AI.',67,125,600,30,21,C.white);
   shape(s,'institution-frame',66,190,988,64,'none','roundRect',C.gold);txt(s,'institution-title',ps[0],84,207,952,40,23,C.gold,true);
   txt(s,'opening-title',ps[1],66,282,1010,122,34,C.white,true,true);
   txt(s,'opening-description',ps[2],66,424,1010,80,22,C.white);
   txt(s,'recipient',ps[3],66,527,965,74,20,C.gold);
   txt(s,'presented-by','Presented by',66,608,500,20,14,C.white);
   txt(s,'linked-founder',ps[4].replace(/^Presented by /,''),66,630,1050,40,22,C.white,true);
  } else {
   shape(s,'top-rule',0,0,1280,10,C.lavender);
   txt(s,'slide-title',data.title,57,45,1166,n===2?85:76,data.title.length>48?32:38,dark?C.white:C.indigo,true,true);
   if(n===2) {
    txt(s,'introduction',ps[1],57,145,1166,83,22);
    ps.slice(2,5).forEach((t,i)=>{const x=57+i*397,colon=t.indexOf(':');card(s,'pillar-'+i,x,250,372,177,[C.lavender,C.sage,C.gold][i]);txt(s,'pillar-title-'+i,t.slice(0,colon+1),x+25,266,324,30,24,C.indigo,true);txt(s,'pillar-copy-'+i,t.slice(colon+2),x+25,301,324,118,20);});
    shape(s,'founder-card',57,445,1166,204,C.white,'roundRect',C.lavender);
    const bio=ps[5],stop=bio.indexOf('. ');txt(s,'founder-label','WHO BUILT IT',89,463,1097,26,14,C.indigo,true);
    txt(s,'founder-heading',bio.slice(0,stop+1).replace(/^WHO BUILT IT — /,''),89,500,1097,40,24,C.indigo,true,true);
    txt(s,'founder-biography',bio.slice(stop+2),89,550,1097,82,22);
   } else {
    txt(s,'subtitle',ps[0],57,134,1166,60,23,dark?C.gold:C.indigo,true);
    if(n===3) {
     txt(s,'institutional-context',ps[1],57,213,1166,143,24,C.white);
     card(s,'rationale-card',57,381,1166,157,C.gold);txt(s,'rationale',ps[2],88,400,1104,128,23);
     txt(s,'working-question',ps[3],57,566,1166,84,22,C.white);
    } else if(n===5) {
     ps.slice(1,4).forEach((t,i)=>{const y=206+i*128,stop=t.indexOf('. ');card(s,'week-'+i,57,y,1166,115,[C.lavender,C.sage,C.gold][i]);txt(s,'week-label-'+i,t.slice(0,stop+1),83,y+16,225,91,20,C.indigo,true);txt(s,'week-copy-'+i,t.slice(stop+2),325,y+15,862,94,20);});
     txt(s,'scope',ps[4],57,603,1166,58,19);
    } else if(n===8) {
     txt(s,'invitation',ps[1],57,209,1166,128,25,C.indigo,true,true);
     card(s,'perspective-card',57,360,1166,109,C.peach);txt(s,'perspective',ps[2],88,378,1104,84,22);
     txt(s,'signature',ps.slice(3,5).join(' — '),57,490,1166,30,20,C.indigo,true);
     txt(s,'website-details',ps.slice(5).join('   ·   '),57,530,1166,30,20);
     shape(s,'invitation-cta',57,584,1166,62,C.indigo,'roundRect');txt(s,'invitation-cta-copy','Request a partnership conversation.',84,600,1110,35,24,C.white,true);
    } else {
     txt(s,'main-statement',ps[1],57,213,1166,150,25);
     card(s,'institution-card',57,385,1166,163,[C.lavender,C.peach,C.sage][n%3]);txt(s,'institution-application',ps[2],88,406,1104,134,23);
     txt(s,'closing-statement',ps[3],57,575,1166,80,21);
    }
   }
   footer(s,n,dark);
  }
 }
 return {start,end:presentation.slides.items.length,links:LINKS};
}
