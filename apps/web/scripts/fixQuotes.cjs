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
  
  // The broken pattern is: from @/something" or from @/something'
  // Let's replace 'from @/' with 'from "@/' where from is preceded by space
  let original = content;
  content = content.replace(/from\s+@\//g, 'from "@/');
  
  // also fix from@/ if it exists
  content = content.replace(/from@\//g, 'from "@/');

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    count++;
    console.log('Fixed quotes in', f);
  }
}
console.log('Fixed', count, 'files');
