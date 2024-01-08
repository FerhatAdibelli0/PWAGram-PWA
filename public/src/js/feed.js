var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector(
  '#close-create-post-modal-btn'
);

function openCreatePostModal() {
  createPostArea.style.display = 'block';
  // This is because we want to show the prompt after this click occurs
  if (deferredEvent) {
    deferredEvent.prompt();

    deferredEvent.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'dismissed') {
        console.log('User dismissed the prompt');
      } else {
        console.log('User added the prompt');
      }
    });

    deferredEvent = null;
  }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);
