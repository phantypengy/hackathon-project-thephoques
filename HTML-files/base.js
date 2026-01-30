let progress = document.getElementById("progressBar");
let song = document.getElementById("audioPlayer");
let playBtn = document.getElementById("playButton");

song.onloadedmetadata = function () {
  progress.max = song.duration;
  progress.value = song.currentTime;
};

function pausePlay() {
  if (song.paused) {
    song.play();
    document.getElementById("playButton").src = "media/pause.png";

    if (song.play()) {
      setInterval(() => {
        progressBar.value = song.currentTime;
      }, 500);
    }

    progress.onchange = function () {
      song.currentTime = progress.value;
    };
  } else {
    song.pause();
    document.getElementById("playButton").src = "media/play.png";
  }
}
