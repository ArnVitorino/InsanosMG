const fs = require('fs');
const path = require('path');

const srcRoot = 'C:\\Cois\\Issi\\versao-0.2';
const destRoot = 'C:\\Cois\\Issi';

function copyRecursive(src, dest, ignore = []) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      if (ignore.includes(item)) continue;
      copyRecursive(path.join(src, item), path.join(dest, item), ignore);
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('Restaurando Versão 0.2...');
copyRecursive(path.join(srcRoot, 'server'), path.join(destRoot, 'server'));
copyRecursive(path.join(srcRoot, 'data'), path.join(destRoot, 'data'));
copyRecursive(path.join(srcRoot, 'client'), path.join(destRoot, 'client'), ['node_modules']);
fs.copyFileSync(path.join(srcRoot, 'package.json'), path.join(destRoot, 'package.json'));
fs.copyFileSync(path.join(srcRoot, 'iniciar.bat'), path.join(destRoot, 'iniciar.bat'));
fs.copyFileSync(path.join(srcRoot, 'README.md'), path.join(destRoot, 'README.md'));

console.log('Versão 0.2 restaurada com sucesso!');

