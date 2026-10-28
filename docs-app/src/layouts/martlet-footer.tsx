import ownerBadge from "../../brand/jh-badge-1x1.svg";


export function MasterFooter() { return (
<footer className="martlet-master-site-footer">
  <div className="martlet-master-footer-container martlet-master-footer-grid">
    <nav aria-label="Footer build"><h2>Build</h2><ul>
      <li><a href="https://react.martletdesign.dev/">React reference</a></li>
      <li><a href="https://martletdesign.dev/design-system/">Astro & foundations</a></li>
      <li><a href="https://martletdesign.dev/agents/">MCP and builder skill</a></li>
    </ul></nav>
    <nav aria-label="Related websites"><h2>Elsewhere</h2><ul>
      <li><a href="https://jameshoward.us/">James Howard</a></li>
      <li><a href="https://prism7.app/">Prism 7</a></li>
      <li><a href="https://krigsvolddesign.dev/">Krigsvold</a></li>
    </ul></nav>
    <nav aria-label="Legal"><h2>Notices</h2><ul>
      <li><a href="https://martletdesign.dev/privacy-and-cookie-notice/">Privacy Notice</a></li>
      <li><a href="https://martletdesign.dev/privacy-and-cookie-notice/#cookie-settings">Cookie Settings</a></li>
      <li><a href="https://jameshoward.us/terms-of-use/">Terms of Use</a></li>
      <li><a href="https://jameshoward.us/copyright/">Copyright</a></li>
      <li><a href="https://martletdesign.dev/privacy-and-cookie-notice/#copyright">Design Licensing</a></li>
    </ul></nav>
  </div>
  <div className="martlet-master-footer-container martlet-master-footer-bottom">
    <a className="martlet-master-footer-identity" href="https://jameshoward.us/" aria-label="James Howard website">
      <img src={ownerBadge} alt="" width="56" height="56" loading="lazy" />
      <span><strong>react.martletdesign.dev</strong><br />A website of James Howard</span>
    </a>
    <p>Copyright © 2026{new Date().getUTCFullYear() > 2026 ? `–${new Date().getUTCFullYear()}` : ''} James P. Howard, II</p>
  </div>
</footer>
); }
