console.log("Let's write a JavaScript");

let currentSong = new Audio();
let songs = [];
let currFolder = "";

// Function to convert seconds to MM:SS
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

// Get list of songs from folder
async function getSongs(folder) {
  currFolder = folder;

  let response = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let html = await response.text();
  let div = document.createElement("div");
  div.innerHTML = html;
  let as = div.getElementsByTagName("a");

  songs = [];
  for (let link of as) {
    if (link.href.endsWith(".mp3")) {
      let songName = decodeURIComponent(link.href.split(`/${folder}/`)[1]);
      songs.push(songName);
    }
  }

  // Display songs in list
  let songUL = document.querySelector(".songList ul");
  songUL.innerHTML = "";
  for (let song of songs) {
    songUL.innerHTML += `
      <li>
        <img style="width: 24px; height: 24px;" class="invert" src="music.svg" alt="">
        <div class="info">
          <div>${song}</div>
          <div>Usman</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img style="width: 24px; height: 24px;" class="invert" src="play.svg" alt="">
        </div>
      </li>`;
  }

  // Add click event listeners to each song
  Array.from(document.querySelectorAll(".songList li")).forEach((li, index) => {
    li.addEventListener("click", () => {
      playMusic(songs[index]);
    });
  });
}

// Play music function
function playMusic(track, pause = false) {
  currentSong.src = `/${currFolder}/${encodeURIComponent(track)}`;
  currentSong.currentTrack = track; // Store current track for navigation
  if (!pause) {
    currentSong.play();
    play.src = "pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = track;
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

// Display albums
async function displayAlbums() {
  let response = await fetch(`http://127.0.0.1:5500/songs/`);
  let html = await response.text();
  let div = document.createElement("div");
  div.innerHTML = html;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");

  for (let a of anchors) {
    if (a.href.includes("/songs/") && !a.href.endsWith(".jpg") && !a.href.endsWith(".mp3")) {
      let folder = a.pathname.split("/songs/")[1].split("/")[0];
      let metaResponse = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
      let meta = await metaResponse.json();
      cardContainer.innerHTML += `
        <div data-folder="${folder}" class="card">
          <div class="play"><svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"
                                fill="black">
                                <path
                                    d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
                            </svg></div>
          <img src="songs/${folder}/cover.jpg" alt="">
          <h2>${meta.title}</h2>
          <p>${meta.description}</p>
        </div>`;
    }
  }

  // Album click loads songs
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", async () => {
      await getSongs(`songs/${card.dataset.folder}`);
    });
  });
}

// Initialize player
async function main() {
  await getSongs("songs/ApDhillon");
  playMusic(songs[0], true);
  displayAlbums();

  // Play/Pause button
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "pause.svg";
    } else {
      currentSong.pause();
      play.src = "play.svg";
    }
  });

  // Update progress bar
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Seekbar click
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Previous button
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.currentTrack);
    if (index > 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Next button
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.currentTrack);
    if (index < songs.length - 1) {
      playMusic(songs[index + 1]);
    }
  });

  // Volume controls
  document.querySelector(".range input").addEventListener("change", (e) => {
    currentSong.volume = e.target.value / 100;
  });

  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document.querySelector(".range input").value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document.querySelector(".range input").value = 10;
    }
  });

  // Sidebar toggle
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%";
  });
}

main();
