const fs = require('fs');
const content = fs.readFileSync('c:/Users/hp/Desktop/SENSEI-hackathon/sensei-frontend/src/app/page.tsx', 'utf-8');
const lines = content.split('\n');

// Find features
let featuresStart = -1;
let featuresEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const features = [')) {
    featuresStart = i;
  }
  if (featuresStart !== -1 && lines[i].includes('];') && i > featuresStart) {
    featuresEnd = i;
    break;
  }
}

// Find roleCards
let roleCardsStart = -1;
let roleCardsEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const roleCards = [')) {
    roleCardsStart = i;
  }
  if (roleCardsStart !== -1 && lines[i].includes('];') && i > roleCardsStart) {
    roleCardsEnd = i;
    break;
  }
}

if (featuresStart !== -1 && featuresEnd !== -1 && roleCardsStart !== -1 && roleCardsEnd !== -1) {
  const featuresContent = lines.slice(featuresStart, featuresEnd + 1).join('\n');
  const roleCardsContent = lines.slice(roleCardsStart, roleCardsEnd + 1).join('\n');

  // Remove them from lines
  // We need to remove from the bottom up to avoid index shifting.
  if (roleCardsStart > featuresStart) {
    lines.splice(roleCardsStart, roleCardsEnd - roleCardsStart + 1);
    lines.splice(featuresStart, featuresEnd - featuresStart + 1);
  } else {
    lines.splice(featuresStart, featuresEnd - featuresStart + 1);
    lines.splice(roleCardsStart, roleCardsEnd - roleCardsStart + 1);
  }

  // Find export default function LandingPage
  let insertIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('export default function LandingPage')) {
      insertIdx = i;
      break;
    }
  }

  if (insertIdx !== -1) {
    lines.splice(insertIdx, 0, featuresContent + '\n\n' + roleCardsContent + '\n\n');
    fs.writeFileSync('c:/Users/hp/Desktop/SENSEI-hackathon/sensei-frontend/src/app/page.tsx', lines.join('\n'));
    console.log('Moved constants outside');
  } else {
    console.log('LandingPage not found');
  }
} else {
  console.log('Constants not found', { featuresStart, featuresEnd, roleCardsStart, roleCardsEnd });
}
