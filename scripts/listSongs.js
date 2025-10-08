import { GetDatabase, Play } from "./main.js";

let rawData = [];

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

