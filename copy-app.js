const fs = require('fs');
const path = require('path');

const src = 'src/app/(app)';
const dst = 'src/app/app';

function copyDir(srcDir, dstDir) {
  if (!fs.existsSync(dstDir)) {
    fs.mkdirSync(dstDir, { recursive: true });
  }
  
  const items = fs.readdirSync(srcDir);
  
  for (const item of items) {
    const srcPath = path.join(srcDir, item);
    const dstPath = path.join(dstDir, item);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}

if (fs.existsSync(src)) {
  copyDir(src, dst);
  console.log('Done - app folder copied');
} else {
  console.log('Source not found:', src);
}