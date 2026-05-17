const fs = require('fs');

const content = fs.readFileSync('c:/Users/hp/Desktop/SENSEI-hackathon/sensei-frontend/src/app/page.tsx', 'utf-8');
const lines = content.split('\n');

const newContent = `                  <p style={{ fontSize: '0.82rem', color: '#555', fontWeight: 600 }}>Trusted by <strong style={{ color: PURPLE }}>12,000+</strong> students & faculty</p>
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

            {/* RIGHT: hero illustration — isometric campus scene */}
            <div className="hidden lg:block" style={{ position: 'relative', height: 620 }}>

              {/* ── Isometric Campus Building (center) ── */}
              <motion.div
                initial={{ opacity: 0, scale: 0.7, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.2, ease: CUBIC_BEZIER }}
                style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 5 }}
              >
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
                  <div style={{ position: 'relative', width: 340, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                    {/* Pulsing glow behind brain */}
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.15, 0.45, 0.15] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)', width: 200, height: 200, background: 'radial-gradient(circle, rgba(123,79,233,0.5), transparent 65%)', borderRadius: '50%', filter: 'blur(30px)', pointerEvents: 'none', zIndex: 0 }}
                    />

                    {/* Holographic ring effect */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                      style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 160, height: 160, borderRadius: '50%', border: '2px solid rgba(123,79,233,0.2)', pointerEvents: 'none', zIndex: 1 }}
                    >
                      <div style={{ position: 'absolute', top: -4, left: '50%', width: 8, height: 8, borderRadius: '50%', background: PURPLE, boxShadow: \`0 0 12px \${PURPLE}\` }} />
                    </motion.div>
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 130, height: 130, borderRadius: '50%', border: '1.5px dashed rgba(123,79,233,0.15)', pointerEvents: 'none', zIndex: 1 }}
                    >
                      <div style={{ position: 'absolute', top: -3, left: '50%', width: 6, height: 6, borderRadius: '50%', background: NOTE_YELLOW, boxShadow: \`0 0 8px \${NOTE_YELLOW}\` }} />
                    </motion.div>

                    {/* Brain orb */}
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], boxShadow: ['0 0 50px rgba(123,79,233,0.7), 0 0 100px rgba(123,79,233,0.3)', '0 0 80px rgba(123,79,233,0.9), 0 0 160px rgba(123,79,233,0.5)', '0 0 50px rgba(123,79,233,0.7), 0 0 100px rgba(123,79,233,0.3)'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ width: 120, height: 120, background: \`radial-gradient(circle at 35% 35%, #C4B5FD, \${PURPLE}, \${PURPLE_DARK})\`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 6, position: 'relative', flexShrink: 0 }}
                    >
                      <Brain size={58} color="#fff" />
                    </motion.div>

                    {/* Isometric Campus Building SVG */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      style={{ marginTop: -16, zIndex: 4, position: 'relative' }}
                    >
                      <svg viewBox="0 0 340 220" fill="none" style={{ width: 340, height: 220 }}>
                        <defs>
                          <linearGradient id="isoL" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#2D1B69"/><stop offset="100%" stopColor="#1A1040"/></linearGradient>
                          <linearGradient id="isoR" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#231550"/><stop offset="100%" stopColor="#160D35"/></linearGradient>
                          <linearGradient id="isoT" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#4A2D99"/><stop offset="100%" stopColor="#7B4FE9"/></linearGradient>
                          <linearGradient id="grassG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#66BB6A"/><stop offset="100%" stopColor="#388E3C"/></linearGradient>
                          <filter id="wGlow"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                        </defs>

                        {/* Ground platform - isometric */}
                        <polygon points="170,195 50,140 170,85 290,140" fill="url(#grassG)" opacity="0.35" />
                        <polygon points="170,195 50,140 50,155 170,210" fill="#2E7D32" opacity="0.25" />
                        <polygon points="170,195 290,140 290,155 170,210" fill="#1B5E20" opacity="0.25" />

                        {/* Ground glow */}
                        <ellipse cx="170" cy="200" rx="100" ry="12" fill="rgba(123,79,233,0.2)" />

                        {/* Main building - left face */}
                        <polygon points="90,85 170,50 170,160 90,180" fill="url(#isoL)" />
                        {/* Main building - right face */}
                        <polygon points="170,50 250,85 250,180 170,160" fill="url(#isoR)" />
                        {/* Main building - top face */}
                        <polygon points="90,85 170,50 250,85 170,120" fill="url(#isoT)" />

                        {/* Windows - left face */}
                        {[0,1,2,3].map(ri => [0,1,2].map(wi => (
                          <rect key={\`wl\${ri}\${wi}\`} x={100 + wi * 20 + ri * 1.5} y={100 + ri * 16} width={11} height={9} rx={1.5}
                            fill={((ri + wi) % 3 !== 0) ? '#A78BFA' : '#3D2080'} opacity={((ri + wi) % 3 !== 0) ? 0.9 : 0.35}
                            filter={((ri + wi) % 3 !== 0) ? 'url(#wGlow)' : undefined} />
                        )))}
                        {/* Windows - right face */}
                        {[0,1,2,3].map(ri => [0,1,2].map(wi => (
                          <rect key={\`wr\${ri}\${wi}\`} x={178 + wi * 20 - ri * 1.5} y={100 + ri * 16} width={11} height={9} rx={1.5}
                            fill={((ri + wi) % 2 !== 0) ? '#C4B5FD' : '#2A1B56'} opacity={((ri + wi) % 2 !== 0) ? 0.82 : 0.3}
                            filter={((ri + wi) % 2 !== 0) ? 'url(#wGlow)' : undefined} />
                        )))}

                        {/* Entrance */}
                        <rect x={157} y={150} width={26} height={16} rx={3} fill="#0D0820" />
                        <path d="M157,153 Q170,142 183,153" fill="#A78BFA" opacity="0.3" />

                        {/* Roof antenna */}
                        <rect x={163} y={42} width={14} height={9} rx={2} fill="#3D2480" />
                        <line x1="170" y1="42" x2="170" y2="24" stroke="rgba(123,79,233,0.7)" strokeWidth="2" />
                        <circle cx="170" cy="21" r="4" fill="#A78BFA" opacity="0.9" />

                        {/* SENSEI label on building */}
                        <text x="170" y="138" textAnchor="middle" fill="#C4B5FD" fontSize="8" fontWeight="900" letterSpacing="3" opacity="0.8">SENSEI</text>

                        {/* Left wing */}
                        <polygon points="68,115 90,100 90,160 68,170" fill="#170E32" />
                        {[0,1,2].map(i => (
                          <rect key={\`swl\${i}\`} x={73} y={120 + i * 15} width={8} height={7} rx={1} fill="#7B4FE9" opacity="0.55" />
                        ))}
                        {/* Right wing */}
                        <polygon points="250,100 272,115 272,170 250,160" fill="#170E32" />
                        {[0,1,2].map(i => (
                          <rect key={\`swr\${i}\`} x={254} y={120 + i * 15} width={8} height={7} rx={1} fill="#7B4FE9" opacity="0.55" />
                        ))}

                        {/* Trees */}
                        <ellipse cx="58" cy="175" rx="14" ry="9" fill="#43A047" opacity="0.85" />
                        <ellipse cx="58" cy="169" rx="10" ry="8" fill="#66BB6A" opacity="0.9" />
                        <rect x="55" y="178" width="5" height="7" rx="1" fill="#4E342E" />

                        <ellipse cx="280" cy="175" rx="14" ry="9" fill="#43A047" opacity="0.85" />
                        <ellipse cx="280" cy="169" rx="10" ry="8" fill="#66BB6A" opacity="0.9" />
                        <rect x="277" y="178" width="5" height="7" rx="1" fill="#4E342E" />

                        {/* Small trees */}
                        <ellipse cx="75" cy="185" rx="8" ry="5" fill="#388E3C" opacity="0.7" />
                        <ellipse cx="265" cy="185" rx="8" ry="5" fill="#388E3C" opacity="0.7" />

                        {/* Path/road */}
                        <line x1="170" y1="168" x2="170" y2="200" stroke="rgba(200,200,200,0.3)" strokeWidth="6" strokeLinecap="round" />
                      </svg>
                    </motion.div>

                    {/* Twinkling particles around campus */}
                    {[...Array(16)].map((_, i) => (
                      <motion.div key={\`p\${i}\`}
                        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5] }}
                        transition={{ duration: 1.8 + i * 0.3, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
                        style={{ position: 'absolute', top: \`\${5 + (i * 11) % 90}%\`, left: \`\${2 + (i * 13) % 95}%\`, width: i % 4 === 0 ? 5 : 3, height: i % 4 === 0 ? 5 : 3, background: [PURPLE, NOTE_YELLOW, NOTE_GREEN, '#81D4FA', '#FFD700', NOTE_PINK][i % 6], borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }}
                      />
                    ))}
                  </div>
                </motion.div>
              </motion.div>

              {/* ── Dotted connection lines from center to labels ── */}
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
                {/* Curved dotted paths to each label */}
                <path d="M 50% 40% Q 35% 20% 22% 10%" fill="none" stroke="rgba(123,79,233,0.25)" strokeWidth="1.5" strokeDasharray="4 4" />
                <path d="M 50% 40% Q 65% 20% 78% 10%" fill="none" stroke="rgba(123,79,233,0.25)" strokeWidth="1.5" strokeDasharray="4 4" />
                <path d="M 38% 45% Q 15% 40% 2% 38%" fill="none" stroke="rgba(123,79,233,0.25)" strokeWidth="1.5" strokeDasharray="4 4" />
                <path d="M 62% 45% Q 85% 40% 95% 38%" fill="none" stroke="rgba(123,79,233,0.25)" strokeWidth="1.5" strokeDasharray="4 4" />
                <path d="M 38% 65% Q 20% 75% 12% 78%" fill="none" stroke="rgba(123,79,233,0.25)" strokeWidth="1.5" strokeDasharray="4 4" />
                <path d="M 62% 65% Q 80% 75% 88% 78%" fill="none" stroke="rgba(123,79,233,0.25)" strokeWidth="1.5" strokeDasharray="4 4" />
              </svg>

              {/* ── Floating sticky note labels ── */}
              <FloatingLabel label="STUDENTS"      color={NOTE_YELLOW}   Icon={GraduationCap} posStyle={{ top: '0%',     left: '15%' }}  rotate={-4} delay={0.2} />
              <FloatingLabel label="FACULTY"       color={NOTE_PINK}     Icon={BookOpen}      posStyle={{ top: '0%',     right: '12%' }} rotate={5}  delay={0.35} />
              <FloatingLabel label="AI POWERED"    color={NOTE_PEACH}    Icon={Zap}           posStyle={{ top: '20%',    right: '-5%' }} rotate={-3} delay={0.5} />
              <FloatingLabel label="ANALYTICS"     color={NOTE_GREEN}    Icon={BarChart3}     posStyle={{ top: '32%',    left: '-8%' }}  rotate={3}  delay={0.28} />
              <FloatingLabel label="WELLNESS"      color={NOTE_BLUE}     Icon={Heart}         posStyle={{ bottom: '15%', left: '5%' }}   rotate={-5} delay={0.44} />
              <FloatingLabel label="ADMIN"         color={NOTE_LAVENDER} Icon={Building2}     posStyle={{ top: '55%',    right: '-5%' }} rotate={4}  delay={0.55} />
              <FloatingLabel label="INTERVENTIONS" color={NOTE_YELLOW}   Icon={Target}        posStyle={{ bottom: '8%',  right: '15%' }} rotate={-3} delay={0.65} />

              {/* Decorative elements */}
              <DoodleStar style={{ top: '12%', left: '48%', color: PURPLE, opacity: 0.5, fontSize: '1.2rem' }} />
              <DoodleStar style={{ bottom: '25%', left: '20%', color: '#4CAF50', opacity: 0.45, fontSize: '1rem' }} />
              <DoodleStar style={{ top: '45%', right: '8%', color: '#F57F17', opacity: 0.5, fontSize: '0.9rem' }} />
              <DoodleStar style={{ bottom: '5%', left: '40%', color: PURPLE, opacity: 0.35, fontSize: '0.8rem' }} />

              {/* Floating pencil doodle */}
              <motion.span
                animate={{ rotate: [0, -10, 5, 0], y: [0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ position: 'absolute', top: '8%', right: '38%', fontSize: '1.1rem', opacity: 0.25, pointerEvents: 'none' }}
              >✏️</motion.span>

              {/* Floating paperclip */}
              <motion.span
                animate={{ rotate: [0, 8, -5, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ position: 'absolute', bottom: '30%', right: '5%', fontSize: '1.3rem', opacity: 0.2, pointerEvents: 'none' }}
              >📎</motion.span>
            </div>
`;

// Note: we're splicing from index 455 to 589 inclusive.
// index 455 is line 456 (0-indexed). The duplicate chunk starts from line 456 down to 589 (index 588).
// The last valid line before the corruption was 455 (index 454).
// Wait, the arrays in split are 0-indexed.
// line 455: `                  </div>` -> index 454.
// line 456: `        backgroundSize: '30px 30px',` -> index 455.
// line 589: `            </div>` -> index 588.
const before = lines.slice(0, 455);
const after = lines.slice(589);
const finalLines = [...before, newContent, ...after];
fs.writeFileSync('c:/Users/hp/Desktop/SENSEI-hackathon/sensei-frontend/src/app/page.tsx', finalLines.join('\n'));
