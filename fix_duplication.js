const fs = require('fs');
const content = fs.readFileSync('c:/Users/hp/Desktop/SENSEI-hackathon/sensei-frontend/src/app/page.tsx', 'utf-8');
const lines = content.split('\n');

let avatarsStart = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("['s1','s2','s3','s4','s5']")) {
    avatarsStart = i;
    break;
  }
}

let corruptionStart = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("backgroundSize: '30px 30px',") && lines[i+1] && lines[i+1].includes('zIndex: 0,')) {
    corruptionStart = i;
    break;
  }
}

if (avatarsStart !== -1 && corruptionStart !== -1) {
  // Find the end of the avatars map. It should be the closing </div> after avatarsStart.
  let avatarsEnd = -1;
  for (let i = avatarsStart; i < lines.length; i++) {
    if (lines[i].trim() === '</div>') {
      avatarsEnd = i;
      break;
    }
  }

  // Find the corruption end (next section features)
  let corruptionEnd = -1;
  for (let i = corruptionStart; i < lines.length; i++) {
    if (lines[i].includes('section id="section-features"')) {
      for (let j = i - 1; j > corruptionStart; j--) {
        if (lines[j].trim() === '</section>') {
          corruptionEnd = j;
          break;
        }
      }
      break;
    }
  }

  if (avatarsEnd !== -1 && corruptionEnd !== -1) {
    const replacement = `                </div>
                <div>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 3 }}>
                    {[...Array(5)].map((_, i) => (
                      <span key={i} style={{ color: '#F59E0B', fontSize: '0.85rem' }}>★</span>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#555', fontWeight: 600 }}>Trusted by <strong style={{ color: PURPLE }}>12,000+</strong> students & faculty</p>
                </div>
              </motion.div>

              {/* Hand-drawn decorative doodles */}
              <motion.div variants={fadeUp} style={{ marginTop: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {[
                  { emoji: '🎓', label: '15+ AI Agents' },
                  { emoji: '🧠', label: 'Smart Analytics' },
                  { emoji: '🎯', label: 'Risk Detection' },
                ].map(({ emoji, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(123,79,233,0.06)', border: '1.5px dashed rgba(123,79,233,0.2)', borderRadius: 10, padding: '0.4rem 0.85rem' }}>
                    <span style={{ fontSize: '1rem' }}>{emoji}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#444', letterSpacing: '0.03em' }}>{label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* RIGHT: hero illustration — Image */}
            <div className="hidden lg:block" style={{ position: 'relative', height: 620, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/images/hero-bg.png" alt="Campus Illustration" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>

          </div>
        </div>

        {/* bottom wave */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', pointerEvents: 'none' }}>
          <svg viewBox="0 0 1440 64" fill="none" preserveAspectRatio="none" style={{ display: 'block', height: 64, width: '100%' }}>
            <path d="M0,32 C360,64 1080,0 1440,32 L1440,64 L0,64 Z" fill="#FFFCF4" />
          </svg>
        </div>
      </section>`;

    lines.splice(avatarsEnd, corruptionEnd - avatarsEnd + 1, replacement);
    fs.writeFileSync('c:/Users/hp/Desktop/SENSEI-hackathon/sensei-frontend/src/app/page.tsx', lines.join('\n'));
    console.log('Fixed duplication and restored section');
  } else {
    console.log('Ends not found', { avatarsEnd, corruptionEnd });
  }
} else {
  console.log('Starts not found', { avatarsStart, corruptionStart });
}
