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
  if (!['.js', '.jsx', '.css'].includes(path.extname(f))) continue;
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // Replace remaining relative imports that should point to root folders
  content = content.replace(/from\s+['"](?:\.\.\/)+utils\/(.*?)['"]/g, 'from "@/utils/$1"');
  content = content.replace(/from\s+['"](?:\.\.\/)+services\/(.*?)['"]/g, 'from "@/services/$1"');
  content = content.replace(/from\s+['"](?:\.\.\/)+hooks\/(.*?)['"]/g, 'from "@/hooks/$1"');
  content = content.replace(/from\s+['"](?:\.\.\/)+data\/(.*?)['"]/g, 'from "@/data/$1"');
  content = content.replace(/from\s+['"](?:\.\.\/)+context\/(.*?)['"]/g, 'from "@/context/$1"');
  content = content.replace(/from\s+['"](?:\.\.\/)+store\/(.*?)['"]/g, 'from "@/store/$1"');
  content = content.replace(/from\s+['"](?:\.\.\/)+assets\/(.*?)['"]/g, 'from "@/assets/$1"');
  content = content.replace(/from\s+['"](?:\.\.\/)+styles\/(.*?)['"]/g, 'from "@/styles/$1"');
  
  // Also fix CSS imports
  content = content.replace(/@import\s+['"]\.\/styles\/(.*?)['"]/g, '@import "@/styles/$1"');

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    count++;
    console.log('Fixed relative paths in', f);
  }
}
console.log('Fixed', count, 'files');
