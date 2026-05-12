import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');

// Helper to get all files in a directory recursively
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

// 1. Build a map of all files in src/
// Key: filename without extension (e.g., 'Navbar')
// Value: alias path (e.g., '@/components/layout/Navbar')
const allFiles = getAllFiles(srcDir);
const fileMap = {};

allFiles.forEach(filePath => {
  const ext = path.extname(filePath);
  const basename = path.basename(filePath, ext);
  // Only map JS/JSX files for component/hook imports
  if (['.js', '.jsx'].includes(ext)) {
    const relativePath = path.relative(srcDir, filePath).replace(/\\/g, '/');
    fileMap[basename] = `@/${relativePath.replace(/\.jsx?$/, '')}`;
  }
});

// Hardcode context paths if they are still in src/context
// (Since we didn't move them, they should still be there)
['AiContext', 'AuthContext', 'CryptoContext', 'SearchContext', 'WatchlistContext'].forEach(ctx => {
  fileMap[ctx] = `@/context/${ctx}`;
});


// 2. Process each JS/JSX file and fix relative imports
let modifiedCount = 0;

allFiles.forEach(filePath => {
  if (!['.js', '.jsx'].includes(path.extname(filePath))) return;

  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // Match import statements with relative paths
  // e.g., import { Something } from '../../components/Something'
  // Regex looks for from followed by quotes containing ./ or ../
  const importRegex = /(import\s+.*?from\s+['"])(\.\.?\/.*?)((?:\.jsx?)?['"])/g;
  
  content = content.replace(importRegex, (match, prefix, importPath, suffix) => {
    // Extract the basename of the imported file
    const importedBasename = path.basename(importPath);
    
    // Check if we have this basename in our map
    if (fileMap[importedBasename]) {
      // prefix ends with quote: `import x from "`
      // fileMap value: `@/path/Component`
      // suffix might be `.jsx"` or `"` or `';`
      // We want to reconstruct it with the original quote character that is at the very end of prefix
      const quote = prefix.slice(-1);
      // Remove the trailing quote from prefix for easier concatenation
      const cleanPrefix = prefix.slice(0, -1);
      // We don't want the .jsx extension anymore since Vite can resolve without it (optional, but cleaner)
      // and we just add the quote back. Wait, let's just keep the exact suffix quote/semicolon.
      const endChar = suffix.match(/['";]+$/) ? suffix.match(/['";]+$/)[0] : quote;
      
      return `${cleanPrefix}${quote}${fileMap[importedBasename]}${endChar}`;
    }
    
    // If not in map, might be an asset or something else, leave it alone
    return match;
  });

  // Also handle dynamic imports: import('../../components/...')
  const dynamicImportRegex = /(import\(['"])(\.\.?\/.*?)((?:\.jsx?)?['"]\))/g;
  content = content.replace(dynamicImportRegex, (match, prefix, importPath, suffix) => {
    const importedBasename = path.basename(importPath);
    if (fileMap[importedBasename]) {
      const quote = prefix.slice(-1);
      const cleanPrefix = prefix.slice(0, -1);
      const endChar = suffix.match(/['"\)]+$/) ? suffix.match(/['"\)]+$/)[0] : `')`;
      return `${cleanPrefix}${quote}${fileMap[importedBasename]}${endChar}`;
    }
    return match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    modifiedCount++;
    console.log(`Updated imports in: ${path.relative(srcDir, filePath)}`);
  }
});

console.log(`\nImport fix complete. Modified ${modifiedCount} files.`);

// Special case: Fix CSS imports in main.jsx and App.jsx if broken
const mainJsxPath = path.join(srcDir, 'app', 'main.jsx');
if (fs.existsSync(mainJsxPath)) {
  let mainContent = fs.readFileSync(mainJsxPath, 'utf-8');
  mainContent = mainContent.replace(/import\s+['"]\.\/index\.css['"];?/, 'import "@/app/index.css";');
  mainContent = mainContent.replace(/import\s+App\s+from\s+['"]\.\/App\.jsx['"];?/, 'import App from "@/app/App";');
  fs.writeFileSync(mainJsxPath, mainContent, 'utf-8');
}

const appJsxPath = path.join(srcDir, 'app', 'App.jsx');
if (fs.existsSync(appJsxPath)) {
  let appContent = fs.readFileSync(appJsxPath, 'utf-8');
  appContent = appContent.replace(/import\s+['"]\.\/App\.css['"];?/, 'import "@/app/App.css";');
  fs.writeFileSync(appJsxPath, appContent, 'utf-8');
}
