const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

function replaceInFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace ../../lib/ and ../lib/ with @/lib/
    content = content.replace(/\.\.\/\.\.\/lib\//g, '@/lib/');
    content = content.replace(/\.\.\/lib\//g, '@/lib/');
    
    // Replace ../../context/ and ../context/ with @/context/
    content = content.replace(/\.\.\/\.\.\/context\//g, '@/context/');
    content = content.replace(/\.\.\/context\//g, '@/context/');

    // Replace ../../hooks/ and ../hooks/ with @/hooks/
    content = content.replace(/\.\.\/\.\.\/hooks\//g, '@/hooks/');
    content = content.replace(/\.\.\/hooks\//g, '@/hooks/');

    // Replace ../../theme.config and ../theme.config with @/theme.config
    content = content.replace(/\.\.\/\.\.\/theme\.config/g, '@/theme.config');
    content = content.replace(/\.\.\/theme\.config/g, '@/theme.config');

    // Replace ../../components/ and ../components/ in context with @/...
    // Let's just catch all ../ and ../../ that go to root dirs: common, admin, student, teacher, lib, context, hooks
    const rootDirs = ['common', 'admin', 'student', 'teacher', 'lib', 'context', 'hooks', 'theme.config'];
    
    for (const d of rootDirs) {
        let regex2 = new RegExp(`\\.\\.\\/\\.\\.\\/${d}\\/`, 'g');
        let regex1 = new RegExp(`\\.\\.\\/${d}\\/`, 'g');
        content = content.replace(regex2, `@/${d}/`);
        content = content.replace(regex1, `@/${d}/`);
    }

    fs.writeFileSync(filePath, content, 'utf8');
}

walkDir('src', replaceInFile);
console.log("Fixed relative imports.");
