const fs = require('fs');
const content = fs.readFileSync('c:/Users/hp/Desktop/SENSEI-hackathon/sensei-frontend/src/app/page.tsx', 'utf-8');
const lines = content.split('\n');

// Find the lines for the right side
let startIdx = -1;
let endIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('RIGHT: hero illustration')) {
    startIdx = i;
  }
  // The block ends with a </div> that closes the parent container.
  // We need to find the correct closing div.
  // In our previous edit, we had:
  // </motion.div>
  // </div>
  // which was lines 534 and 535.
}

// Let's use a more robust way: find the start, and then find the NEXT section or the closing of the grid.
// The next section is usually "bottom wave" or "STATS STRIP".
let nextSectionIdx = -1;
for (let i = startIdx; i < lines.length; i++) {
  if (lines[i].includes('bottom wave') || lines[i].includes('STATS STRIP')) {
    nextSectionIdx = i;
    break;
  }
}

if (startIdx !== -1 && nextSectionIdx !== -1) {
  // We want to replace from startIdx to just before the next section.
  // But we need to keep the closing divs of the grid if they are in that range.
  // Let's look at the structure:
  // <div className="hidden lg:block" ...> ... </div>
  // So we just need to replace the content of the right column, or the whole right column div.
  
  // Let's find the closing </div> of the right column.
  // It should be before the next section.
  let rightColumnEndIdx = -1;
  let divCount = 0;
  for (let i = startIdx; i < nextSectionIdx; i++) {
    if (lines[i].includes('<div')) divCount++;
    if (lines[i].includes('</div')) divCount--;
    // This is naive, let's just find the last </div> before the "bottom wave" or similar.
  }
}

// Let's just use the line numbers from the previous view_file.
// Lines 475 to 535.
// Let's verify line 475 is still correct after removing the circle.
// Removing the circle deleted ~4 lines.
// So startIdx should be around 471.

// Let's rewrite the script to find the start by string match and then count brackets or just replace a known block.
// Let's use string match for the start of the block and the end of the block.

const startStr = 'RIGHT: hero illustration';
const endStr = '</div>'; // This is too common.

// Let's just use the line numbers I saw in the view_file (adjusted for deletion).
// Original start: 475.
// We deleted 4 lines.
// So new start is ~471.
// Let's check the file content at 471.

const fileContent = fs.readFileSync('c:/Users/hp/Desktop/SENSEI-hackathon/sensei-frontend/src/app/page.tsx', 'utf-8');
const linesArray = fileContent.split('\n');

let targetStart = -1;
for(let i=0; i<linesArray.length; i++) {
  if(linesArray[i].includes('RIGHT: hero illustration')) {
    targetStart = i;
    break;
  }
}

if (targetStart !== -1) {
  // Find the end of the block. It should be the closing div of the "hidden lg:block" container.
  // Let's find the next </div> that matches the indentation or just the next one before the bottom wave.
  let targetEnd = -1;
  for(let i=targetStart; i<linesArray.length; i++) {
    if(linesArray[i].includes('bottom wave') || linesArray[i].includes('STATS STRIP')) {
      // Find the last </div> before this.
      for(let j=i-1; j>targetStart; j--) {
        if(linesArray[j].trim() === '</div>') {
          targetEnd = j;
          break;
        }
      }
      break;
    }
  }

  if (targetEnd !== -1) {
    const newRightSide = `            {/* RIGHT: hero illustration — Image */}
            <div className="hidden lg:block" style={{ position: 'relative', height: 620, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/images/hero-bg.png" alt="Campus Illustration" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>`;
    
    linesArray.splice(targetStart, targetEnd - targetStart + 1, newRightSide);
    fs.writeFileSync('c:/Users/hp/Desktop/SENSEI-hackathon/sensei-frontend/src/app/page.tsx', linesArray.join('\n'));
    console.log('Replaced with image');
  } else {
    console.log('End not found');
  }
} else {
  console.log('Start not found');
}
