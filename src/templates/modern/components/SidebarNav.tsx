import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useRouterState } from '@tanstack/react-router';
import { nav, siteSchool } from "#content/site";

const links=[['Home','/'],...nav,['Contact','/contact']] as const;

export default function SidebarNav(){
  const [open,setOpen]=useState(false);
  const path=useRouterState({select:s=>s.location.pathname});
  useEffect(()=>setOpen(false),[path]);
  return <header className="topnav-shell" data-testid="site-header">
    <nav aria-label="Main" className="topnav content" data-testid="main-navigation">
      <Link to="/" className="topnav-brand" data-testid="nav-home-brand">
        <span className="crest" aria-hidden="true">E</span>
        <span className="topnav-wordmark"><strong>{siteSchool.short}</strong><small>POKHARA · NEPAL</small></span>
      </Link>
      <button className="topnav-menu-button" aria-expanded={open} aria-controls="topnav-links" onClick={()=>setOpen(!open)} data-testid="mobile-navigation-trigger">
        {open?<X/>:<Menu/>}<span>Menu</span>
      </button>
      <div id="topnav-links" className={`topnav-links ${open?'open':''}`}>
        {links.map(([label,to])=><Link key={to} to={to} className={path===to?'active':''} aria-current={path===to?'page':undefined} data-testid={`nav-${label.toLowerCase().replaceAll(' ','-')}`}>{label}</Link>)}
      </div>
      <Link to="/login" className="topnav-login" data-testid="nav-login-link">Portal Login <span aria-hidden="true">↗</span></Link>
    </nav>
  </header>;
}