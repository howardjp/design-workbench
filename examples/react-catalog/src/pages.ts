import catalog from '../../page-archetypes/content/catalog.json';
// Only compositions with the section and Markdown semantics implemented here.
export const selectedIds=['home','about','categories','case-study','documentation','privacy','terms','service','software','archive','category','projects','careers','events'];
export const pages=catalog.pages.filter(page=>selectedIds.includes(page.id));
export function validatePages() {
 if(pages.length!==selectedIds.length) throw Error('A selected catalog page is missing');
 for(const page of pages) for(const section of page.sections) {
  if('kind' in section && section.kind && !['cards','facts','listing'].includes(section.kind)) throw Error(`Unsupported section in ${page.id}`);
  if('body' in section && section.body && /[*_`\[\]<>\n]/.test(section.body)) throw Error(`Unsupported Markdown in ${page.id}`);
 }
}
