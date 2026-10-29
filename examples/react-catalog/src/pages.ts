import catalog from '../../page-archetypes/content/catalog.json';
import selectedIds from './selected.json';
export const pages=catalog.pages.filter(page=>selectedIds.includes(page.id));
export function validatePages() {
 if(pages.length!==selectedIds.length||new Set(selectedIds).size!==selectedIds.length) throw Error('A selected catalog page is missing or duplicated');
 for(const page of pages) for(const section of page.sections) {
  if('kind' in section && section.kind && !['cards','facts','listing','figure','table'].includes(section.kind)) throw Error(`Unsupported section in ${page.id}`);
 }
}
