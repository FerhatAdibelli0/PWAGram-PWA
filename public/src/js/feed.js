var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector(
  '#close-create-post-modal-btn'
);
var sharedMomentsArea = document.querySelector('#shared-moments');
const form = document.querySelector('form');
const locationInputValue = document.querySelector('#location');
const titleInputValue = document.querySelector('#title');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
  setTimeout(() => {
    createPostArea.style.transform = 'translateY(0)';
  }, 1);

  if (deferredPrompt) {
    deferredPrompt?.prompt();

    deferredPrompt?.userChoice?.then(function (choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }

  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.getRegistrations().then((registrations) => {
  //     for (let i = 0; i < registrations.length; i++) {
  //       registrations[i].unregister();
  //     }
  //   });
  // }
}

function closeCreatePostModal() {
  createPostArea.style.transform = 'translateY(100vh)';
  setTimeout(() => {
    createPostArea.style.display = 'none';
  }, 1000);
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

//This is unused now to cache some data occationally
function onSaveButtonClicked(event) {
  console.log('clicked');
  if ('caches' in window) {
    caches.open('user-react').then((cache) => {
      cache.addAll(['https://httpbin.org/get', '/src/images/sf-boat.jpg']);
    });
  } else {
    console.log('Caches dont exist');
  }
}

function clearCard() {
  if (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function updateUI(dataArray) {
  clearCard();
  for (let i = 0; i < dataArray.length; i++) {
    createCard(dataArray[i]);
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (
    locationInputValue.value.trim() === '' ||
    titleInputValue.value.trim() === ''
  ) {
    alert('Check your input values');
    return;
  }
  closeCreatePostModal();

  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then((sw) => {
      sw.sync.register('sync-new-post');
    });
  }
});

function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = `url("${data.image}")`;
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  // var cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'Save!';
  // cardSaveButton.addEventListener('click', onSaveButtonClicked);
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}
let dataFromWeb = false;
const api =
  'https://pwagram-5e122-default-rtdb.europe-west1.firebasedatabase.app/posts.json';

fetch(api)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    console.log('From web :', data);
    dataFromWeb = true;
    const dataArray = [];
    for (let key in data) {
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
  });

console.log(window);
if ('indexedDB' in window) {
  realAllData('posts').then((data) => {
    if (!dataFromWeb) {
      console.log('From caches', data);
      updateUI(data);
    }
  });
}

// if ('caches' in window) {
//   caches
//     .match(api)
//     .then((response) => {
//       if (response) {
//         return response.json();
//       }
//     })
//     .then((data) => {
//       console.log('From caches', data);
//       if (!dataFromWeb) {
//         const dataArray = [];
//         for (let key in data) {
//           dataArray.push(data[key]);
//         }
//         updateUI(dataArray);
//       }
//     });
// }
