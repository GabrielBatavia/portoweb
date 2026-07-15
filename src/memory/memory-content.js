const contactActions = `
  <div class="memory-actions">
    <a href="/Gabriel-Batavia-CV.pdf" target="_blank" rel="noreferrer">Open CV ↗</a>
    <a href="mailto:gabrielbatavia7@gmail.com">Email Gabriel</a>
    <a href="https://github.com/GabrielBatavia" target="_blank" rel="noreferrer">GitHub ↗</a>
  </div>
`;

export const MEMORY_CONTENT = {
  profile: {
    number: "01",
    title: "Profile",
    html: `
      <div class="memory-intro">
        <span class="memory-intro-label">Applied intelligence / useful outcomes</span>
        <p class="memory-lead">An Informatics Engineering student turning AI research into systems people can actually use.</p>
      </div>
      <div class="memory-list">
        <article class="memory-entry">
          <div class="memory-date">2023 — Present</div>
          <div>
            <h3>State Polytechnic of Malang</h3>
            <p class="memory-meta">Informatics Engineering · GPA 3.71 / 4.00</p>
          </div>
          <p>Focused on artificial intelligence, computer vision, large language models, and applied machine learning systems.</p>
        </article>
        <article class="memory-entry">
          <div class="memory-date">Current focus</div>
          <div>
            <h3>AI that leaves the notebook</h3>
            <p class="memory-meta">Industry · Accessibility · Robotics</p>
          </div>
          <p>Gabriel combines model development, product thinking, web systems, and communication to move technical work closer to real users.</p>
        </article>
        <article class="memory-entry">
          <div class="memory-date">Opportunity</div>
          <div>
            <h3>Ready to contribute and learn fast</h3>
            <p class="memory-meta">Internship · Junior AI Engineering</p>
          </div>
          <p>Seeking a team where practical engineering, research curiosity, and measurable impact matter more than isolated demos.</p>
        </article>
      </div>
      ${contactActions}
    `,
  },
  experience: {
    number: "02",
    title: "Experience",
    html: `
      <div class="memory-intro">
        <span class="memory-intro-label">Three professional chapters</span>
        <p class="memory-lead">Industrial AI, product delivery, and robotics leadership—each grounded in real constraints.</p>
      </div>
      <div class="memory-list">
        <article class="memory-entry">
          <div class="memory-date">Jan 2026 — Present</div>
          <div>
            <h3>Computer Vision Engineer Intern</h3>
            <p class="memory-meta">PT Petrokimia Gresik</p>
          </div>
          <ul>
            <li>Contributed to an internal web system used to streamline processes for eight team members.</li>
            <li>Collaborates with researchers on computer vision models for industrial and business requirements.</li>
            <li>Contributed to three successful AI project implementations.</li>
          </ul>
        </article>
        <article class="memory-entry">
          <div class="memory-date">Apr 2025 — Present</div>
          <div>
            <h3>AI Engineer</h3>
            <p class="memory-meta">CV LetConnect Canada</p>
          </div>
          <ul>
            <li>Designed LLM architecture and inference pipelines for mobile and web applications.</li>
            <li>Supported AI features launched on the Apple App Store and Google Play Store.</li>
            <li>Helped secure three foundation collaborations through AI product demonstrations.</li>
          </ul>
        </article>
        <article class="memory-entry">
          <div class="memory-date">Nov 2024 — Present</div>
          <div>
            <h3>Head of Image Processing</h3>
            <p class="memory-meta">Polinema Robotics · AROC_PL</p>
          </div>
          <ul>
            <li>Leads eight members building image processing for humanoid robots.</li>
            <li>Develops real-time computer vision for the Indonesian Humanoid Soccer Robot Contest.</li>
            <li>Improved object detection and image processing accuracy by up to 70% through pipeline optimization.</li>
          </ul>
        </article>
      </div>
      <div class="memory-actions">
        <button type="button" data-memory-question="What makes your experience relevant to an AI engineering team?">Ask about this experience</button>
        <a href="/Gabriel-Batavia-CV.pdf" target="_blank" rel="noreferrer">Verify in CV ↗</a>
      </div>
    `,
  },
  work: {
    number: "03",
    title: "Selected work",
    html: `
      <div class="memory-intro">
        <span class="memory-intro-label">Systems with a reason to exist</span>
        <p class="memory-lead">Accessibility, safety, and support—not AI features searching for a problem.</p>
      </div>
      <div class="memory-list">
        <article class="memory-entry">
          <div class="memory-date">Accessibility</div>
          <div>
            <h3>LLMForAutism</h3>
            <p class="memory-meta">Malang Autism Center collaboration</p>
          </div>
          <p>A specialized LLM-based system supporting children with verbal autism. The product is planned for official launch and intellectual property registration by Malang Autism Center.</p>
        </article>
        <article class="memory-entry">
          <div class="memory-date">Communication</div>
          <div>
            <h3>Sign Language Application</h3>
            <p class="memory-meta">Academic project</p>
          </div>
          <p>A sign language application developed with lecturers and community partners to support communication for deaf users.</p>
        </article>
        <article class="memory-entry">
          <div class="memory-date">Environmental safety</div>
          <div>
            <h3>IoT Fire Prevention</h3>
            <p class="memory-meta">Academic project</p>
          </div>
          <p>An IoT monitoring system integrating sensors and detection logic for early identification and prevention of peatland fire risks.</p>
        </article>
      </div>
      <div class="memory-actions">
        <button type="button" data-memory-question="Which project best represents how you solve real problems?">Ask about these projects</button>
        <a href="mailto:gabrielbatavia7@gmail.com">Discuss a project</a>
      </div>
    `,
  },
  recognition: {
    number: "04",
    title: "Recognition",
    html: `
      <div class="memory-intro">
        <span class="memory-intro-label">Recognition / credentials / teaching</span>
        <p class="memory-lead">Technical execution backed by national competitions, cloud credentials, and knowledge sharing.</p>
      </div>
      <div class="memory-list">
        <article class="memory-entry">
          <div class="memory-date">Oct 2025</div>
          <div><h3>Best Innovation Award</h3><p class="memory-meta">Hackathon Compsphere · President University</p></div>
          <p>Created an AI-powered game prototype for PT Kereta Api Indonesia and was recognized for creativity, innovation, and technical execution.</p>
        </article>
        <article class="memory-entry">
          <div class="memory-date">Oct 2025</div>
          <div><h3>Second Place</h3><p class="memory-meta">KMIPN · Innovation Creation Category</p></div>
          <p>Recognized for LLMForAutism, developed with Malang Autism Center to support children with verbal autism.</p>
        </article>
        <article class="memory-entry">
          <div class="memory-date">Oct 2024</div>
          <div><h3>Second Runner-Up + Audience Favorite</h3><p class="memory-meta">AI Innovation Challenge · COMPFEST 16</p></div>
          <p>Built an LLM-powered education system helping Indonesian students understand industry needs and career preparation.</p>
        </article>
        <article class="memory-entry">
          <div class="memory-date">Credentials</div>
          <div><h3>Azure · AWS · English</h3><p class="memory-meta">Professional development</p></div>
          <p>Microsoft Certified Azure AI Engineer Associate, Azure AI-102 training, AWS re/Start 2025, and TOEIC score 820.</p>
        </article>
        <article class="memory-entry">
          <div class="memory-date">Teaching</div>
          <div><h3>Speaker, mentor, workshop assistant</h3><p class="memory-meta">AI and student development</p></div>
          <p>Has supported an NVIDIA workshop, spoken nationally about AI and mental health, presented AI productivity workflows, and mentored Informatics students.</p>
        </article>
      </div>
      ${contactActions}
    `,
  },
};
