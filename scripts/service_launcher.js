const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Proje kok dizini
const projectDir = path.join(__dirname, '..');
const logFile = path.join(projectDir, 'service.log');

function log(message) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFile, formattedMessage);
  console.log(message);
}

log('VK Spine Stok Servis Baslatici calisiyor...');
log('Dizin: ' + projectDir);

// Uygulamayı baslat (npm run start)
// Not: Once 'npm run build' yapilmis olmalidir.
const startProcess = spawn('npm.cmd', ['run', 'start'], {
  cwd: projectDir,
  shell: true
});

startProcess.stdout.on('data', (data) => {
  log(`stdout: ${data}`);
});

startProcess.stderr.on('data', (data) => {
  log(`stderr: ${data}`);
});

startProcess.on('close', (code) => {
  log(`Uygulama sureci ${code} kodu ile kapandi. Yeniden baslatiliyor...`);
  // Servis yoneticisi (node-windows) otomatik yeniden baslatacaktır, 
  // ancak burada ek mantık gerekirse eklenebilir.
});
