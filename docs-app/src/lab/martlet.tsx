import type {ReactNode} from 'react';
import './martlet.css';
export function PatternLayout({navigation,context,children}:{navigation:ReactNode;context:ReactNode;children:ReactNode}){
 return <article className="martlet-pattern-lab"><header><p className="reference-kicker">Martlet · Experimental compositions</p><h2>Patterns for substantial work.</h2><p>Relationships, readable sequence and continuity, exercised through complete state changes.</p>{navigation}</header><div className="martlet-pattern-work">{children}</div><aside aria-label="Pattern rules"><h2>Keep the relationships clear.</h2>{context}</aside></article>;
}
