const { exec } = require('child_process');
const path = require('path');

// Proje kok dizini
const projectDir = path.join(__dirname, '..');

console.log('VK Spine Stok Servis Baslatici calisiyor...');
console.log('Dizin:', projectDir);

// Uygulamayı baslat (npm run start)
// Not: Once 'npm run build' yapilmis olmalidir.
const startProcess = exec('npm run start', {
  cwd: projectDir
});

startProcess.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

startProcess.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

startProcess.on('close', (code) => {
  console.log(`Uygulama sureci ${code} kodu ile kapandi.`);
});
