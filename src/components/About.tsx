import { about } from "../content/site";
import { FadeUp } from "./Reveal";

export function About() {
  return (
    <section className="about" id="about" aria-label="About">
      <div className="container about-grid">
        <FadeUp className="about-aside">
          <span aria-hidden="true">{about.aside}</span>
        </FadeUp>
        <div className="about-body">
          <FadeUp>
            <p className="about-lead">{about.lead}</p>
          </FadeUp>
          <FadeUp delay={0.08}>
            {about.body.map((p) => (
              <p key={p} className="about-p">
                {p}
              </p>
            ))}
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
