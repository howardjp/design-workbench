import {Article, DataTable, TableOfContents, family} from 'docs-family';
import {FormPattern} from './lab/patterns';
import './research-project.css';

const sections = [
  {id:'research-question', label:'Research question'},
  {id:'research-method', label:'Study method'},
  {id:'research-observations', label:'Observations'},
  {id:'research-limits', label:'Limits and next steps'},
  {id:'research-materials', label:'Request materials'},
];
const stations = [
  ['Upper reach', 'W-01', '18', '16.2', 'Complete'],
  ['Woodland tributary', 'W-02', '16', '15.4', 'Two visits missing'],
  ['Town crossing', 'W-03', '18', '18.1', 'Complete'],
  ['Lower reach', 'W-04', '17', '18.7', 'One visit missing'],
];
function StudyBody(){return <>
  <section id="research-question" tabIndex={-1}>
    <h2>What changes along a stream?</h2>
    <p>A useful field study begins with a question narrow enough to investigate. This fictional project asks how stream temperature varies between four stations, and whether that variation persists across repeated visits.</p>
    <p>The purpose is to make the evidence inspectable. A station average is only a summary: the observation dates, missing visits, equipment notes, and measurement conditions belong beside it.</p>
  </section>
  <section id="research-method" tabIndex={-1}>
    <h2>A repeatable field method</h2>
    <p>The proposed protocol pairs a fixed sampling route with a shared field sheet. At each station, the team records the time, water temperature, recent rainfall, and any departure from the procedure. Repeat measurements help distinguish a persistent difference from a single unusual visit.</p>
    <ol><li>Check the instrument against a reference before leaving.</li><li>Visit the stations in the same order and record the actual time.</li><li>Retain missing observations as missing, with a reason.</li><li>Review the field sheet before calculating summaries.</li></ol>
    <p>These are illustrative project decisions, not a validated sampling protocol.</p>
  </section>
  <section id="research-observations" tabIndex={-1}>
    <h2>Observations, with their gaps</h2>
    <p id="research-data-note">Invented demonstration data. Temperatures are fictional means in degrees Celsius; visit counts are included so unequal coverage remains visible.</p>
    <DataTable caption="Four fictional monitoring stations" aria-describedby="research-data-note">
      <thead><tr><th scope="col">Station</th><th scope="col">Identifier</th><th scope="col">Visits</th><th scope="col">Mean temperature (°C)</th><th scope="col">Coverage</th></tr></thead>
      <tbody>{stations.map(([name,id,visits,temperature,coverage])=><tr key={id}><th scope="row">{name}</th><td>{id}</td><td className="research-number">{visits}</td><td className="research-number">{temperature}</td><td>{coverage}</td></tr>)}</tbody>
    </DataTable>
    <p className="research-table-help">On a narrow screen, focus the table region and scroll horizontally to compare every column.</p>
  </section>
  <section id="research-limits" tabIndex={-1}>
    <h2>What these numbers cannot establish</h2>
    <p>These invented summaries support no environmental conclusion. Even with real observations, differences in sampling time and missing visits would need examination before attributing a temperature difference to land cover or development.</p>
    <p>The next study decision would be whether to add synchronized measurements. Publishing the protocol and the observation-level records would let another team assess that decision.</p>
  </section>
</>;}
function Materials(){return <section id="research-materials" tabIndex={-1} className="research-materials">
  <FormPattern heading="Request research materials" formLabel="Research materials request" />
  <p className="research-boundary">This is an interactive design specimen. No research team receives the request. Navigation away or a reload clears the demonstration; only Reset specimen asks before discarding changed entries.</p>
</section>;}
function Context(){return <aside className="research-context" aria-label="Study context">
  <h2>Study record</h2><dl><dt>Project</dt><dd>Watershed field notes</dd><dt>Stage</dt><dd>Demonstration</dd><dt>Coverage</dt><dd>Four fictional stations</dd><dt>Materials</dt><dd>Protocol, field sheet, observation register</dd></dl>
  <p>All names, measurements, and study details on this page are illustrative.</p>
</aside>;}
export function ResearchProject(){
  const title='Following the water';
  const summary='A watershed monitoring project, from a clear question to an inspectable record.';
  return <div className={`research-project research-${family}`}>
    {family==='martlet'?<>
      <Article titleLevel={2} title={title} eyebrow="Research project · Demonstration" summary={summary}
        metadata="Fictional study · Sample data · No submissions are sent"
        contents={<TableOfContents items={sections} label="Project contents" />}>
        <StudyBody /><Context /><Materials />
      </Article>
    </>:<>
      <header className="research-intro"><p>Research project · Demonstration</p><h2>{title}</h2><p className="research-deck">{summary}</p><p>Fictional study · Sample data · No submissions are sent</p></header>
      <nav className="research-section-nav" aria-label="Project contents">{sections.map(s=><a href={`#${s.id}`} key={s.id}>{s.label}</a>)}</nav>
      <div className="research-regions"><article aria-label="Study methods and observations"><StudyBody /></article><Context /></div>
      <Materials />
    </>}
  </div>;
}
