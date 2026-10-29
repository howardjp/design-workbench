import {hydrateRoot} from 'react-dom/client';
import {App} from './app';
import {requiresSpecial} from './pages';
const relative=location.pathname.slice(import.meta.env.BASE_URL.replace(/\/$/,'').length);
const id=/^\/examples\/?$/.test(relative)?'index':relative.match(/^\/examples\/([^/]+)\/?$/)?.[1];
if(!id) throw Error('Unknown catalog path');
const mount=document.getElementById('root')!;
if(requiresSpecial(id)) import('./special').then(({renderSpecial})=>hydrateRoot(mount,<App id={id} special={renderSpecial}/>));
else hydrateRoot(mount,<App id={id}/>);
