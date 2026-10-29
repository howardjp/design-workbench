import type {ReactNode} from 'react';
import {AppShell,family} from 'catalog-family';
import {DashboardNav,DashboardPeerLink,type DashboardRoute} from './DashboardNav';
import './dashboard-frame.css';
declare const __NIGHTJAR_PEER__:string;
export function DashboardFrame({current,children}:{current:DashboardRoute;children:ReactNode}) {
 return <div className={family} {...{[`data-${family}`]:'light'}}><AppShell brand={<a href={`${import.meta.env.BASE_URL}examples/`}>Northlight Field Institute</a>} navigationPlacement="none" navigation={null} utilities={null}>
  <div className="rd-workspace"><DashboardNav current={current}/><div className="rd-content"><DashboardPeerLink current={current} peerBase={__NIGHTJAR_PEER__}/>{children}</div></div>
 </AppShell></div>;
}
