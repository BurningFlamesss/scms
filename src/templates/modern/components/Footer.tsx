import React, { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { footerLinks, siteSchool } from "#content/site";
const isOpen=()=>{const now=new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Kathmandu'}));const day=now.getDay(),h=now.getHours();return day!==6&&h>=9&&h<16};
export default function Footer() {
  const [open, setOpen] = useState(isOpen());
  useEffect(() => {
    const i = setInterval(() => setOpen(isOpen()), 60000);
    return () => clearInterval(i);
  }, []);
  return (
    <footer data-testid="site-footer" style={{background: 'var(--c-black)', color: 'var(--c-white)'}}>
      <div className="footer-grid" style={{maxWidth: '1200px', margin: '0 auto', padding: '48px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px'}}>
        <section>
          <div className="footer-crest" style={{width: '48px', height: '48px', background: 'var(--c-red)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-white)', fontWeight: 'bold', fontSize: '24px', marginBottom: '16px'}}>E</div>
          <p className="devanagari" data-testid="footer-school-name-nepali" style={{color: 'var(--c-white)'}}>
            {siteSchool.nepali}
          </p>
          <strong data-testid="footer-school-name" style={{color: 'var(--c-white)', display: 'block', marginBottom: '8px'}}>{siteSchool.name}</strong>
          <p style={{color: 'var(--c-white)/70'}}>{siteSchool.address}</p>
        </section>
        <section>
          <h2 style={{color: 'var(--c-yellow)', marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em'}}>Quick links</h2>
          {footerLinks.map(([l, to]) => (
            <Link to={to} key={to} data-testid={`footer-${l.toLowerCase().replaceAll(' ', '-')}`} style={{display: 'block', marginBottom: '8px', color: 'var(--c-white)', textDecoration: 'none', transition: 'color 0.2s'}}>
              {l}
            </Link>
          ))}
        </section>
        <section>
          <h2 style={{color: 'var(--c-yellow)', marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em'}}>Contact record</h2>
          <a href={`tel:${siteSchool.phoneNtc}`} data-testid="footer-ntc-phone" style={{display: 'block', marginBottom: '8px', color: 'var(--c-white)', textDecoration: 'none', transition: 'color 0.2s'}}>
            {siteSchool.phoneNtc}
          </a>
          <a href={`tel:${siteSchool.phoneNcell}`} data-testid="footer-ncell-phone" style={{display: 'block', marginBottom: '8px', color: 'var(--c-white)', textDecoration: 'none', transition: 'color 0.2s'}}>
            {siteSchool.phoneNcell}
          </a>
          <a href={`mailto:${siteSchool.email}`} data-testid="footer-email" style={{display: 'block', marginBottom: '8px', color: 'var(--c-white)', textDecoration: 'none', transition: 'color 0.2s'}}>
            {siteSchool.email}
          </a>
        </section>
        <section>
          <h2 style={{color: 'var(--c-yellow)', marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em'}}>School hours</h2>
          <p className="open-state" data-testid="footer-open-state" style={{marginBottom: '8px'}}>
            <span style={{color: open ? 'var(--c-yellow)' : 'var(--c-white)/50'}}>{open ? '● OPEN NOW' : '○ CLOSED NOW'}</span>
          </p>
          <p style={{color: 'var(--c-white)/70'}}>SUN–FRI · 09:00–16:00</p>
          <p style={{color: 'var(--c-white)/70'}}>SAT · CLOSED</p>
        </section>
      </div>
      <div className="footer-bottom" style={{borderTop: '1px solid var(--c-white)/20', padding: '24px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px'}}>
        <span data-testid="footer-registration" style={{color: 'var(--c-white)/70'}}>{siteSchool.registration}</span>
        <span style={{color: 'var(--c-white)/70'}}>WEBSITE SYSTEM · 2026</span>
        <div style={{fontFamily: 'var(--font-display)', fontSize: 'clamp(48px,7vw,110px)', lineHeight: '0.9', color: 'var(--c-red)'}}>
          With Everest
        </div>
      </div>
    </footer>
  );
}