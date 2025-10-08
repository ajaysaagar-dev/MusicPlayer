
let database = [];

export function GetDatabase(_database) {
    database = _database;
}

const audio = document.getElementById('audio');
const slider = document.getElementById('slider');
const currentTime = document.getElementById('currentTime');
const totalTime = document.getElementById('totalTime');

audio.src = 'https://sentunes.online/mp3/Tamil%20Mp3/All/Surya%20Mp3%20Songs/Sillunu%20Oru%20Kaadhal%282006%29/Munbe%20Vaa%20En%20Vaa-%28SensongsMp3.Co%29.mp3';
audio.load();

slider.addEventListener('input', () => {
    audio.currentTime = slider.value;
});

document.getElementById('play-song').addEventListener('click', () => {
    audio.play();
});

document.getElementById('pause-song').addEventListener('click', () => {
    audio.pause();
});

export function Play(id) {

    let SONG = {};

    database.forEach(song => {
        if (song.id === id) {
            SONG = song;
        }
    });

    // Image Change
    document.querySelector('.cover img').src = SONG.imageUrl;
    document.querySelector('#song-name').innerHTML = SONG.songName;
    document.querySelector('#movie-name').innerHTML = SONG.movieName;

    audio.src = SONG.songUrl;
    audio.load();
    audio.play();

}

window.addEventListener('keydown', (e) => {
    if (e.key === '1') {
        Play('gf3xdn2eusqylvrceidv');
    }
})

setInterval(() => {

    console.log(database);

    // Slider
    slider.value = audio.currentTime;
    slider.max = audio.duration;

    // Timing
    currentTime.innerHTML = GetMinSec(audio.currentTime);
    totalTime.innerHTML = GetMinSec(audio.duration);
}, 1000);

function GetMinSec(seconds) {
    let sec = seconds % 60 < 10 ? '0' + parseInt(seconds % 60) : parseInt(seconds % 60);
    let min = parseInt((seconds / 60)) < 10 ? '0' + parseInt((seconds / 60)) : parseInt((seconds / 60));
    return min + ':' + sec;
}

console.log(GetMinSec(66));