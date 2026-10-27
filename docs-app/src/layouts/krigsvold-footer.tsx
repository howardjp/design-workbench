import ownerBadge from "../../brand/jh-badge-1x1.svg";
import "./krigsvold-footer.css";

export function MasterFooter() { return (
<footer className="krigsvold-master-site-footer">
  <div className="krigsvold-master-footer-inner">
    <div className="krigsvold-master-footer-grid">
      <div className="krigsvold-master-footer-identity">
        <a className="krigsvold-master-footer-owner" href="https://jameshoward.us/" aria-label="James Howard website">
          <img src={ownerBadge} alt="" width="58" height="58" loading="lazy" />
          <span className="krigsvold-master-footer-site">react.krigsvolddesign.dev</span>
          <span className="krigsvold-master-footer-byline">A website of James Howard</span>
        </a>
        <p>Components, working patterns, and agent guidance grounded in krigsvold.org.</p>
      </div>
      <nav aria-label="Footer language"><h2>The language</h2><ul>
        <li><a href="https://krigsvolddesign.dev/design-language/">Principles and decisions</a></li>
        <li><a href="https://krigsvolddesign.dev/design-language/#patterns">Pattern contracts</a></li>
        <li><a href="https://krigsvolddesign.dev/design-language/#decisions">Source decisions</a></li>
      </ul></nav>
      <nav aria-label="Footer build"><h2>Build</h2><ul>
        <li><a href="https://react.krigsvolddesign.dev/">React reference</a></li>
        <li><a href="https://krigsvolddesign.dev/design-system/">Astro & foundations</a></li>
        <li><a href="https://krigsvolddesign.dev/agents/">MCP and builder skill</a></li>
      </ul></nav>
      <nav aria-label="Related websites"><h2>Elsewhere</h2><ul>
        <li><a href="https://jameshoward.us/">James Howard</a></li>
        <li><a href="https://krigsvold.org/">The Count of Krigsvold</a></li>
        <li><a href="https://martletdesign.dev/">Martlet</a></li>
      </ul></nav>
      <nav aria-label="Legal"><h2>Legal</h2><ul>
        <li><a href="https://krigsvolddesign.dev/privacy-and-cookie-notice/">Privacy Notice</a></li>
        <li><a href="https://krigsvolddesign.dev/privacy-and-cookie-notice/#cookie-settings">Cookie Settings</a></li>
        <li><a href="https://jameshoward.us/terms-of-use/">Terms of Use</a></li>
        <li><a href="https://jameshoward.us/copyright/">Copyright</a></li>
        <li><a href="https://krigsvolddesign.dev/privacy-and-cookie-notice/#copyright">Design Licensing</a></li>
      </ul></nav>
    </div>
    <div className="krigsvold-master-footer-base">
      <p>Copyright © 2026{new Date().getUTCFullYear() > 2026 ? `–${new Date().getUTCFullYear()}` : ''} James P. Howard, II</p>
    </div>
  </div>
</footer>
); }
