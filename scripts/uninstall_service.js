var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name: 'VK Spine Stok',
  script: require('path').join(__dirname, 'service_launcher.js')
});

// Listen for the "uninstall" event, which indicates the
// process is now uninstalled.
svc.on('uninstall', function() {
  console.log('VK Spine Stok servisi basariyla silindi.');
  console.log('Servis durduruldu ve kaldirildi.');
});

// Uninstall the service.
svc.uninstall();
