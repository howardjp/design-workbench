import type {ReactNode} from 'react';
import './krigsvold.css';
export function PatternLayout({navigation,context,children}:{navigation:ReactNode;context:ReactNode;children:ReactNode}){
 return <article className="krigsvold-pattern-lab"><header><p className="reference-kicker">Krigsvold · Experimental compositions</p><h2>Reference patterns.</h2><p>Purposeful regions, stable alignment and explicit state, exercised through complete transitions.</p>{navigation}</header><div className="krigsvold-pattern-work"><div>{children}</div><aside aria-label="Pattern rules"><h2>Scope and relationships</h2>{context}</aside></div></article>;
}
