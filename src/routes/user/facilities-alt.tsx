import { createFileRoute } from "@tanstack/react-router";
import React,{useState} from 'react';
import {X} from 'lucide-react';
import {facilities,pageCopy} from '#/lib/site';

export const Route = createFileRoute("/user/facilities-alt")({
	component: RouteComponent,
});

function RouteComponent() {
  const [active,setActive]=useState(facilities[0]);
  const [panel,setPanel]=useState(false);
  const choose=(facility:typeof facilities[number])=>{setActive(facility);setPanel(true)};
  return (
    <>
      <header className="page-header content">
        <p className="eyebrow">{pageCopy.facilities.eyebrow}</p>
        <h1>{pageCopy.facilities.title.split('\n').map(x=><React.Fragment key={x}>{x}<br/></React.Fragment>)}</h1>
        <p className="lead">{pageCopy.facilities.support}</p>
      </header>
      <section className="campus-plan content">
        <div className="plan-visual">
          <p className="eyebrow">INTERACTIVE CAMPUS PLAN</p><h2>CHOOSE A ROOM.</h2>
          <div className="plan-canvas">
            <svg viewBox="0 0 350 280" role="img" aria-label="Top-down campus plan">
              {facilities.map(f=><g key={f.id}><path d={f.block.d}/><circle cx={f.block.cx} cy={f.block.cy} r="23"/><text x={f.block.cx} y={f.block.cy}>{f.name.slice(0,2).toUpperCase()}</text></g>)}
            </svg>
            <div className="plan-hotspots">
              {facilities.map(f=><button key={f.id} aria-label={`Open ${f.name}`} onFocus={()=>setActive(f)} onMouseEnter={()=>setActive(f)} onClick={()=>choose(f)} style={{left:`${f.block.cx/3.5}%`,top:`${f.block.cy/2.8}%`}} data-testid={`plan-${f.id}-button`}><span className="sr-only">{f.name}</span></button>)}
            </div>
          </div>
        </div>
        <div className="plan-list">
          <img src={active.images[0].src} alt={active.images[0].alt} width={active.images[0].width} height={active.images[0].height}/>
          <h3 data-testid="active-facility-name">{active.name}</h3><p>{active.room} · {active.specs[1]}</p>
          {facilities.map(f=><button className={active.id===f.id?'active':''} onClick={()=>choose(f)} data-testid={`facility-list-${f.id}`} key={f.id}>{f.name}<span>↗</span></button>)}
        </div>
      </section>
      {panel&&<aside className="facility-panel" aria-label={`${active.name} details`} data-testid="facility-detail-panel">
        <button onClick={()=>setPanel(false)} aria-label="Close facility details" data-testid="facility-panel-close"><X/></button>
        <img src={active.images[1].src} alt={active.images[1].alt} width={active.images[1].width} height={active.images[1].height}/><span>{active.room}</span><h2>{active.name}</h2>{active.specs.map(x=><p key={x}>{x}</p>)}
      </aside>}
      <section className="walkthrough content"><p className="eyebrow">ROOM-BY-ROOM RECORD</p>{facilities.map((f,i)=><article key={f.id} data-testid={`walkthrough-${f.id}`}><img src={f.images[0].src} alt={f.images[0].alt} width={f.images[0].width} height={f.images[0].height} loading="lazy"/><div><span>ROOM {String(i+1).padStart(2,'0')} / {f.room}</span><h2>{f.name}</h2>{f.specs.map(x=><p key={x}>{x}</p>)}</div></article>)}</section>
    </>
  );
}