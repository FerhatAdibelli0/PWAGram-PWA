var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector(
  '#close-create-post-modal-btn'
);
var sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
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
  createPostArea.style.display = 'none';
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

function createCard() {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url("/src/images/sf-boat.jpg")';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = 'San Francisco Trip';
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = 'In San Francisco';
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
const api = 'https://httpbin.org/post';

fetch(api, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  body: JSON.stringify({ message: 'Something that is not important.' }),
})
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    console.log('From web :', data);
    dataFromWeb = true;
    clearCard();
    createCard();
  });

if ('caches' in window) {
  caches
    .match(api)
    .then((response) => {
      if (response) {
        return response.json();
      }
    })
    .then((data) => {
      console.log('From caches', data);
      if (!dataFromWeb) {
        clearCard();
        createCard();
      }
    });
}
