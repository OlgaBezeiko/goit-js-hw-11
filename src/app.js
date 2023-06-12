
import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const apiKey = '37186684-bf0e56ef3772573cd43b5dd3e';
let currentPage = 1;
let currentQuery = '';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');

searchForm.addEventListener('submit', handleSearchFormSubmit);
loadMoreButton.addEventListener('click', loadMoreImages);

async function handleSearchFormSubmit(event) {
  event.preventDefault();
  currentPage = 1;
  currentQuery = searchForm.searchQuery.value.trim();

  if (currentQuery === '') {
    Notiflix.Notify.failure('Please enter a search query.');
    return;
  }

  clearGallery();
  await fetchImages();
}

async function fetchImages() {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: apiKey,
        q: currentQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: currentPage,
        per_page: 40,
      },
    });

    const { data } = response;

    if (data.hits.length === 0) {
      Notiflix.Notify.info('Sorry, there are no images matching your search query. Please try again.');
    } else {
      renderImages(data.hits);
      showLoadMoreButton();
      const lightbox = new SimpleLightbox('.gallery a', {});
      lightbox.refresh();
    }

    if (data.totalHits <= currentPage * 40) {
      hideLoadMoreButton();
      Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    } else {
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
    }

    const { height: cardHeight } = document.querySelector('.gallery').firstElementChild.getBoundingClientRect();
    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  } catch (error) {
    console.error(error);
    Notiflix.Notify.failure('Failed to fetch images. Please try again later.');
  }
}

function renderImages(images) {
  const html = images
    .map(
      (image) => `
      <div class="photo-card">
        <a href="${image.largeImageURL}" data-lightbox="gallery" data-title="${image.tags}">
          <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
        </a>
        <div class="info">
          <p class="info-item">
            <b>Likes:</b> ${image.likes}
          </p>
          <p class="info-item">
            <b>Views:</b> ${image.views}
          </p>
          <p class="info-item">
            <b>Comments:</b> ${image.comments}
          </p>
          <p class="info-item">
            <b>Downloads:</b> ${image.downloads}
          </p>
        </div>
      </div>
    `
    )
    .join('');

  gallery.innerHTML += html;
}

function clearGallery() {
  gallery.innerHTML = '';
}

function showLoadMoreButton() {
  loadMoreButton.style.display = 'block';
}

function hideLoadMoreButton() {
  loadMoreButton.style.display = 'none';
}

async function loadMoreImages() {
  currentPage++;
  await fetchImages();
}
