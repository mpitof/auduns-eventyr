// Comic state management
let currentComic = null;
let totalComics = 0;
const IMAGE_FOLDER = 'images/comics';

// DOM elements
const comicImage = document.getElementById('comic-image');
const comicNumber = document.getElementById('comic-number');
const firstBtn = document.getElementById('first-btn');
const prevBtn = document.getElementById('prev-btn');
const randomBtn = document.getElementById('random-btn');
const nextBtn = document.getElementById('next-btn');
const lastBtn = document.getElementById('last-btn');

// Initialize on page load
async function init() {
    // Find the highest numbered comic
    totalComics = await findLatestComic();

    if (totalComics === 0) {
        displayError();
        return;
    }

    // Load the latest comic by default
    loadComic(totalComics);

    // Set up event listeners
    firstBtn.addEventListener('click', () => loadComic(1));
    prevBtn.addEventListener('click', () => loadComic(currentComic - 1));
    nextBtn.addEventListener('click', () => loadComic(currentComic + 1));
    lastBtn.addEventListener('click', () => loadComic(totalComics));
    randomBtn.addEventListener('click', loadRandomComic);

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboard);
}

// Find the latest comic by trying to load images
async function findLatestComic() {
    let maxComic = 0;

    // Check up to 999 (reasonable upper limit)
    for (let i = 1; i <= 999; i++) {
        const imageUrl = getImageUrl(i);
        const exists = await checkImageExists(imageUrl);

        if (exists) {
            maxComic = i;
        } else if (i > maxComic + 5) {
            // If we've checked 5 beyond the last found comic, stop
            break;
        }
    }

    return maxComic;
}

// Check if an image exists by trying to load it
function checkImageExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

// Get image URL for a comic number
function getImageUrl(number) {
    const paddedNumber = String(number).padStart(3, '0');
    return `${IMAGE_FOLDER}/${paddedNumber}.png`;
}

// Load a specific comic
async function loadComic(number) {
    if (number < 1 || number > totalComics) return;

    currentComic = number;
    const imageUrl = getImageUrl(number);

    // Add loading state
    comicImage.classList.add('loading');

    // Load the image
    const img = new Image();
    img.onload = () => {
        comicImage.src = imageUrl;
        comicImage.alt = `Auduns eventyr #${number}`;
        comicNumber.textContent = `#${number}`;
        comicImage.classList.remove('loading');
        updateNavigationButtons();
    };
    img.onerror = () => {
        displayError();
    };
    img.src = imageUrl;
}

// Load a random comic
function loadRandomComic() {
    if (totalComics === 0) return;

    let randomNum;
    do {
        randomNum = Math.floor(Math.random() * totalComics) + 1;
    } while (randomNum === currentComic && totalComics > 1);

    loadComic(randomNum);
}

// Update navigation button states
function updateNavigationButtons() {
    firstBtn.disabled = currentComic === 1;
    prevBtn.disabled = currentComic === 1;
    nextBtn.disabled = currentComic === totalComics;
    lastBtn.disabled = currentComic === totalComics;
}

// Keyboard navigation
function handleKeyboard(e) {
    switch(e.key) {
        case 'ArrowLeft':
            if (currentComic > 1) loadComic(currentComic - 1);
            break;
        case 'ArrowRight':
            if (currentComic < totalComics) loadComic(currentComic + 1);
            break;
        case 'Home':
            loadComic(1);
            break;
        case 'End':
            loadComic(totalComics);
            break;
    }
}

// Display error message
function displayError() {
    comicNumber.textContent = '?';
    comicImage.alt = 'Fant ingen tegneserier';
    comicImage.style.display = 'none';

    const wrapper = document.querySelector('.comic-wrapper');
    const errorMsg = document.createElement('div');
    errorMsg.style.cssText = 'text-align: center; padding: 3rem; color: var(--color-text-light);';
    errorMsg.innerHTML = `
        <p style="font-size: 1.2rem; margin-bottom: 0.5rem;">🎨</p>
        <p>Ingen tegneserier funnet ennå!</p>
        <p style="font-size: 0.9rem; margin-top: 0.5rem;">Legg til bilder i mappen <code>images/</code></p>
    `;
    wrapper.appendChild(errorMsg);
}

// Start the app
init();
