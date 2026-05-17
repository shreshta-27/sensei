const fs = require('fs');
const content = fs.readFileSync('c:/Users/hp/Desktop/SENSEI-hackathon/sensei-frontend/src/app/page.tsx', 'utf-8');
const lines = content.split('\n');

// Find constants inside LandingPage
let navLinksStart = -1;
let platformsEnd = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const navLinks =')) {
    navLinksStart = i;
  }
  if (navLinksStart !== -1 && lines[i].includes('];') && i > navLinksStart) {
    platformsEnd = i; // This will find the LAST closing bracket after navLinks.
    // Wait, let's be more specific.
  }
}

// Let's just find the block from line 255 to 275 in the current view.
// navLinks is at 255.
// platforms ends at 275.
// Let's check if they are there.

let targetStart = -1;
let targetEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const navLinks =')) {
    targetStart = i;
  }
  if (targetStart !== -1 && lines[i].includes('const platforms =')) {
    // Keep going until we find the closing ]; of platforms
    for (let j = i; j < lines.length; j++) {
      if (lines[j].trim() === '];') {
        targetEnd = j;
        break;
      }
    }
    break;
  }
}

if (targetStart !== -1 && targetEnd !== -1) {
  const constantsContent = lines.slice(targetStart, targetEnd + 1).join('\n');
  lines.splice(targetStart, targetEnd - targetStart + 1);

  // Find export default function LandingPage
  let insertIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('export default function LandingPage')) {
      insertIdx = i;
      break;
    }
  }

  if (insertIdx !== -1) {
    lines.splice(insertIdx, 0, constantsContent + '\n\n');
    fs.writeFileSync('c:/Users/hp/Desktop/SENSEI-hackathon/sensei-frontend/src/app/page.tsx', lines.join('\n'));
    console.log('Moved all constants outside');
  } else {
    console.log('LandingPage not found');
  }
} else {
  console.log('Constants not found');
}
