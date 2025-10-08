
const home = document.getElementById('home');
const playlist = document.getElementById('playlist');
const player = document.getElementById('player');
const list = document.getElementById('list');


document.body.addEventListener('click', (e) => {
    let className = e.target.className;
    switch (className) {
        case 'tab-button-home':
            home.classList.add('active');
            playlist.classList.remove('active');
            player.classList.remove('active');
            list.classList.remove('active');
            break;
        case 'tab-button-playlist':
            home.classList.remove('active');
            playlist.classList.add('active');
            player.classList.remove('active');
            list.classList.remove('active');
            break;
        case 'tab-button-player':
            home.classList.remove('active');
            playlist.classList.remove('active');
            player.classList.add('active');
            list.classList.remove('active');
            break;
        case 'tab-button-list':
            home.classList.remove('active');
            playlist.classList.remove('active');
            player.classList.remove('active');
            list.classList.add('active');
            break;

    }

});