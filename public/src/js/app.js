if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(() => {
    console.log('Service is registered');
  });
}

// This is because we prevent showing the propmt as it would do normally
let deferredEvent;
window.addEventListener('beforeinstallprompt', function (event) {
  console.log('beforeinstallprompt is fired');
  event.preventDefault();
  deferredEvent = event;
  return false;
});
