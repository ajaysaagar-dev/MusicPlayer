import { GetDatabase, Play } from "./main.js";

let rawData = [];

let currentSongID = '';

let queue = [];
let CurrentIndex = 0;
let nextSongIndex = 0;
let prevSongIndex = 0;

const listEl = document.querySelector('.list');

listEl.addEventListener('click', (e) => {

});

fetch('./../database/songs.json')
    .then(res => res.json())
    .then(data => {
        rawData = data;
        GetDatabase(data)
        ListSongs();
    })

function ListSongs() {
    rawData.forEach(song => {
        AddSong(song.songName, song.movieName, song.id);
    });
}


function AddSong(songName, movieName, id) {
    listEl.innerHTML += `
        <div id="${id}" class="song">
            <h3>${songName}</h3>
            <h4>${movieName}</h4>
        </div>
        `;
}


listEl.addEventListener('click', (e) => {
    currentSongID = e.target.id;
    Play(currentSongID);
    // 

    const listArray = document.querySelectorAll('.list .song');

    listArray.forEach(el => {
        queue.push(el.id);
    });

    for (const index in queue) {
        let i = parseInt(index);
        if (currentSongID === queue[i]) {
            CurrentIndex = i;
            nextSongIndex = i + 1;
            prevSongIndex = i - 1;
        }
    }

    console.log(prevSongIndex, CurrentIndex, nextSongIndex);

});



document.getElementById('prev').addEventListener('click', () => {
    Play(queue[prevSongIndex]);
});

document.getElementById('next').addEventListener('click', () => {
    Play(queue[nextSongIndex]);
});