// Comic state management
let currentComic = null;
let totalComics = 0;
let IMAGE_FOLDER = 'images/comics';

// Preload cache
const preloadCache = new Set();

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
    try {
        // Load config
        const response = await fetch('comics.json');
        const config = await response.json();

        totalComics = config.totalComics;
        IMAGE_FOLDER = config.imageFolder;

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
    } catch (error) {
        console.error('Failed to load config:', error);
        displayError();
    }
}

// Get image URL for a comic number
function getImageUrl(number) {
    const paddedNumber = String(number).padStart(3, '0');
    return `${IMAGE_FOLDER}/${paddedNumber}.png`;
}

// Preload adjacent comics for better UX
function preloadAdjacentComics(number) {
    const toPreload = [];

    // Preload previous comic
    if (number > 1) {
        toPreload.push(number - 1);
    }

    // Preload next comic
    if (number < totalComics) {
        toPreload.push(number + 1);
    }

    toPreload.forEach(num => {
        if (!preloadCache.has(num)) {
            const img = new Image();
            img.src = getImageUrl(num);
            preloadCache.add(num);
        }
    });
}

// Load a specific comic
function loadComic(number) {
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

        // Preload adjacent comics after current comic loads
        preloadAdjacentComics(number);
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
