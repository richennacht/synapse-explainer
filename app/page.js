"use client";

import { useEffect, useMemo, useState } from "react";
import "./article.css";
import MathLine, {formulaFor} from "../components/MathLine";
import STDPGraph from "../components/STDPGraph";

const chapterMeta = [
 {id:"chapter-1",number:"CHAPTER 1",short:"Biology to silicon"},
 {id:"chapter-2",number:"CHAPTER 2",short:"Associative memory"},
 {id:"chapter-3",number:"CHAPTER 3",short:"BDH and BDH-CQ"}
];

function parseArticle(source){
 const body=source.slice(source.indexOf("\nCHAPTER 1\n")+1);
 const chunks=body.split(/(?:^|\n)CHAPTER (\d)\n/).slice(1);
 const chapters=[];
 for(let i=0;i<chunks.length;i+=2){
  const number=chunks[i],lines=chunks[i+1].split("\n").filter(line=>!/^─+$/.test(line.trim()));
  const title=lines.shift()?.trim()||"";
  const sections=[]; let intro=[]; let current=null;
  for(const raw of lines){
   const line=raw.trim(); if(!line) continue;
   const heading=line.match(/^(\d+\.\d+(?:\.\d+)?)\s{2,}(.+)$/);
   if(heading){current={number:heading[1],title:heading[2],lines:[],id:`section-${heading[1].replaceAll(".","-")}`};sections.push(current)}
   else if(current) current.lines.push(line); else intro.push(line);
  }
  chapters.push({id:`chapter-${number}`,number:`CHAPTER ${number}`,title,intro:intro.join(" "),sections});
 }
 return chapters;
}

export default function Page(){
 const [source,setSource]=useState(""),[chapterId,setChapterId]=useState("chapter-1"),[drawerOpen,setDrawerOpen]=useState(false);
 useEffect(()=>{fetch("/article.txt").then(r=>r.text()).then(setSource)},[]);
 useEffect(()=>{const close=e=>e.key==="Escape"&&setDrawerOpen(false);addEventListener("keydown",close);return()=>removeEventListener("keydown",close)},[]);
 const chapters=useMemo(()=>source?parseArticle(source):[],[source]);
 const active=chapters.find(ch=>ch.id===chapterId)||chapters[0];
 const choose=id=>{setChapterId(id);setDrawerOpen(false);scrollTo({top:0,behavior:"smooth"})};
 if(!active)return <main className="loading">Preparing the article…</main>;
 return <>
  <button className="drawer-trigger" aria-label="Open chapter navigation" aria-expanded={drawerOpen} aria-controls="chapter-drawer" onClick={()=>setDrawerOpen(v=>!v)}><span/><i/></button>
  <aside className="chapter-drawer" id="chapter-drawer" aria-hidden={!drawerOpen}><div className="drawer-heading"><span>Synapse Explainer</span><button aria-label="Close chapter navigation" onClick={()=>setDrawerOpen(false)}>×</button></div><p>From Biology to Silicon</p><div className="drawer-parts">{chapters.map((chapter,index)=><button key={chapter.id} aria-current={active.id===chapter.id?"page":undefined} onClick={()=>choose(chapter.id)}><small>{chapter.number}</small><b>{chapter.title}</b><span>{active.id===chapter.id?"Currently reading":"Open chapter"}</span></button>)}</div></aside>
  {drawerOpen&&<button className="drawer-scrim" aria-label="Close chapter navigation" onClick={()=>setDrawerOpen(false)}/>} 
  <nav className="section-index" aria-label={`${chapterMeta.find(x=>x.id===active.id)?.short||active.number} sections`}>{active.sections.map(section=><button key={section.id} onClick={()=>document.getElementById(section.id)?.scrollIntoView({behavior:"smooth"})}><i/><span>{section.number}</span> {section.title}</button>)}</nav>
  <main className="chapter-main" id="top"><article>
   <header className="chapter-intro"><time>{active.number} OF 3</time><h1>{active.title}</h1><p className="lead">{active.intro}</p></header>
   {active.sections.map(section=><section id={section.id} key={section.id}><span className="number">{section.number}</span><h2>{section.title}</h2><ArticleLines lines={section.lines} sectionNumber={section.number}/></section>)}
   <button className="next-part" onClick={()=>{const index=chapters.findIndex(ch=>ch.id===active.id);choose(chapters[(index+1)%chapters.length].id)}}><span>{active.id==="chapter-3"?"Return to Chapter 1":"Continue to the next chapter"}</span><span>→</span></button>
  </article></main>
 </>;
}

function ArticleLines({lines,sectionNumber}){return <>{lines.map((line,index)=>{
 const equation=formulaFor(line);
 const label=/^(Architectural Note|The Problem|Evidence Boundary|Where:|Step \d|Property$)/.test(line);
 const quote=line.startsWith('"When an axon');
 const citation=line.startsWith('— Donald Hebb');
 if(equation)return <MathLine line={line} key={index}/>;
 if(label)return <p className="article-note" key={index}>{line}</p>;
 if(quote)return <blockquote key={index}>{line}</blockquote>;
 if(citation)return <p className="quote-citation" key={index}>{line}</p>;
 return <p key={index}>{line}</p>;
 })}{sectionNumber==="1.4.1"&&<STDPGraph/>}</>}

