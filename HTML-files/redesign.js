async function loadVideos() {
  const response = await fetch("http://localhost:3000/videos");
  const videos = await response.json();

  for (let i = videos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [videos[i], videos[j]] = [videos[j], videos[i]];
  }

  const videoGrid = document.querySelector(".videoGrid");
  videoGrid.innerHTML = "";

  videos.forEach((video) => {
    const videoEl = document.createElement("div");
    videoEl.classList.add("video");
    videoEl.dataset.src = `http://localhost:3000${video.video_url}`;
    videoEl.innerHTML = `
            <div class="thumbnail">
                <img src="http://localhost:3000${video.thumbnail_url}" alt="Video Thumbnail" />
            </div>
            <div class="videoInfo">
                <h4 class="videoTitle">${video.title}</h4>
                <p class="channelName">${video.username}</p>
            </div>
        `;
    videoGrid.appendChild(videoEl);
  });

  document.querySelectorAll(".video").forEach((video) => {
    video.addEventListener("click", () => {
      const src = video.dataset.src;
      playerVideo.src = src;
      playerModal.style.display = "flex";
      playerVideo.play();
    });
  });
}

const playerVideo = document.getElementById("playerVideo");
const playerModal = document.getElementById("playerModal");

loadVideos();

function closeVideo() {
  playerModal.style.display = "none";
  playerVideo.pause();
  playerVideo.src = "";
}

function searchItems() {}
