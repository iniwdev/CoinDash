const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let list = [];
  for (let f of fs.readdirSync(dir)) {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      list = list.concat(getFiles(p));
    } else {
      list.push(p);
    }
  }
  return list;
}

const files = getFiles('apps/web/src');
let count = 0;
for (let f of files) {
  if (!['.js', '.jsx'].includes(path.extname(f))) continue;
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // Replace mixed quotes: `import x from '@/path"` or `import x from "@/path'`
  // Basically, any import path starting with @/
  content = content.replace(/(import\s+.*?from\s+)(['"])(@\/.*?)(['"];?)/g, '$1"$3";');
  
  // also dynamic imports
  content = content.replace(/(import\()(['"])(@\/.*?)(['"]\))/g, '$1"$3")');

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    count++;
    console.log('Normalized quotes in', f);
  }
}
console.log('Fixed', count, 'files');
