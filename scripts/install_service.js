var Service = require('node-windows').Service;
var path = require('path');

// Create a new service object
var svc = new Service({
  name: 'VK Spine Stok',
  description: 'VK Spine Stok Takip Sistemi Windows Servisi',
  script: path.join(__dirname, 'service_launcher.js'),
  nodeOptions: [
    '--harmony'
  ]
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function() {
  console.log('VK Spine Stok servisi basariyla kuruldu.');
  svc.start();
});

// Listen for the "alreadyinstalled" event
svc.on('alreadyinstalled', function() {
  console.log('VK Spine Stok servisi zaten kurulu.');
  svc.start(); // Zaten kuruluysa da baslatmayı dene
});

// Listen for the "start" event
svc.on('start', function() {
  console.log('VK Spine Stok servisi baslatildi.');
  console.log('Sistem su adreste calisiyor: http://localhost:3000');
});

// Uygulama hatası durumunda otomatik yeniden baslatma ayarları
svc.on('error', function(err) {
  console.error('Servis hatasi:', err);
});

svc.install();
