import {hydrateRoot} from 'react-dom/client';
import {App} from './app';
const relative=location.pathname.slice(import.meta.env.BASE_URL.replace(/\/$/,'').length);
const id=relative.match(/^\/examples\/([^/]+)\/?$/)?.[1];
if(!id) throw Error('Unknown catalog path');
hydrateRoot(document.getElementById('root')!,<App id={id}/>);
