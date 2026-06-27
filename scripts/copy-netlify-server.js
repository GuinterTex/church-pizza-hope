import fs from 'fs';
import path from 'path';

const root = process.cwd();
const source = path.resolve(root, 'dist', 'server');
const target = path.resolve(root, 'netlify', 'functions', 'dist', 'server');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    throw new Error(`Source directory does not exist: ${src}`);
  }

  fs.mkdirSync(dest, { recursive: true });

  for (const item of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.resolve(src, item.name);
    const destPath = path.resolve(dest, item.name);

    if (item.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (item.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(source, target);
console.log(`Copied ${source} to ${target}`);
