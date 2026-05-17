const fs = require('fs');
const content = fs.readFileSync('c:/Users/hp/Desktop/SENSEI-hackathon/sensei-frontend/src/app/page.tsx', 'utf-8');
const lines = content.split('\n');

// Find the last lines
let targetIdx = -1;
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes('</footer>')) {
    // Find the closing div of the main container
    for (let j = i; j < lines.length; j++) {
      if (lines[j].trim() === '</div>' && lines[j+1] && lines[j+1].trim() === ');') {
        targetIdx = j;
        break;
      }
    }
    break;
  }
}

if (targetIdx !== -1) {
  lines.splice(targetIdx + 1, 0, '    </>');
  fs.writeFileSync('c:/Users/hp/Desktop/SENSEI-hackathon/sensei-frontend/src/app/page.tsx', lines.join('\n'));
  console.log('Closed fragment');
} else {
  console.log('Target not found');
}
