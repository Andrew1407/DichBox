import React from 'react';
import '../styles/footer.css';

const Footer = () => (
  <div id="footer" data-testid="footer-test">
    <p id="version">
      <small>
       <b>version: 0.5.6</b>
      </small>
      </p>
    <p>
      <b>DichES</b>
    </p>  
    <p>
      <b>
        <small>
          <a id="repo-ref" href="https://github.com/Andrew1407/DichBox" target="_blank">git repo</a>
        </small>
      </b>
    </p>
  </div>
);

export default Footer;
