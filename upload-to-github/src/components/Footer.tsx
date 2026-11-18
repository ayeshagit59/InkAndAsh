import { footer, site } from "../content/site";

export function Footer() {
  const links = [
    { label: "LinkedIn", href: site.linkedinUrl },
    { label: "Instagram", href: site.instagramUrl },
    { label: "Medium", href: site.mediumUrl },
  ];

  return (
    <footer className="footer" id="footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-signoff">{footer.signoff}</p>
          <p className="footer-name">{footer.name}</p>
          <p className="footer-bio">{site.mediumBio}</p>
        </div>
        <nav aria-label="Elsewhere">
          <ul className="footer-links">
            {links.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noreferrer">
                  {l.label} <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="container footer-base">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <span>Paintings by Ink&amp;Ash. Song covers credit their original artists.</span>
      </div>
    </footer>
  );
}
