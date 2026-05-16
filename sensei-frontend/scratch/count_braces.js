const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\rocke\\OneDrive\\Desktop\\sensei\\sensei-frontend\\src\\app\\student\\world\\[roomId]\\page.tsx', 'utf8');
let open = 0;
let close = 0;
for (let i = 0; i < content.length; i++) {
  if (content[i] === '{') open++;
  if (content[i] === '}') close++;
}
console.log(`Open: ${open}, Close: ${close}`);
if (open !== close) {
  console.log(`Mismatch: ${open - close}`);
}
