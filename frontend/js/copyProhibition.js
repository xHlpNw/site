document.addEventListener('selectstart', event => event.preventDefault());

document.addEventListener('contextmenu', event => event.preventDefault());

document.addEventListener('keydown', event => {
    if ((event.ctrlKey && event.key.toLowerCase() === 'c') ||
        (event.ctrlKey && event.key.toLowerCase() === 'x') ||
        (event.ctrlKey && event.key.toLowerCase() === 'a')) {
        event.preventDefault();
    }
});

document.addEventListener('copy', event => {
    event.preventDefault();
    alert('Копирование текста запрещено на этом сайте.');
});

document.addEventListener('dragstart', event => event.preventDefault());