async function loadVideos() {
  const response = await fetch("http://localhost:3000/videos", {
    credentials: "include",
  });
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
    videoEl.dataset.id = video.id;
    videoEl.innerHTML = `
            <div class="thumbnail">
                <img src="http://localhost:3000${video.thumbnail_url}" alt="Video Thumbnail" />
            </div>
            <div class="videoInfo">
                <h4 class="videoTitle">${video.title}</h4>
                <p class="channelName">${video.username}</p>
            </div>
        `;

    videoEl.addEventListener("click", () => {
      console.log("Clicking video id:", video.id);
      window.location.href = `video.html?id=${video.id}`;
    });

    videoGrid.appendChild(videoEl);
  });
}

loadVideos();

function closeVideo() {
  playerModal.style.display = "none";
  playerVideo.pause();
  playerVideo.src = "";
}

async function searchItems() {
  const query = document.querySelector(".searchbar").value.trim();
  console.log("Searching for:", query);
  if (!query) {
    loadVideos();
    return;
  }

  const response = await fetch(
    `http://localhost:3000/search?q=${encodeURIComponent(query)}`,
    {
      credentials: "include",
    },
  );
  const videos = await response.json();

  const videoGrid = document.querySelector(".videoGrid");
  videoGrid.innerHTML = "";

  if (videos.length === 0) {
    videoGrid.innerHTML = "<p>No videos found.</p>";
    return;
  }

  videos.forEach((video) => {
    const videoEl = document.createElement("div");
    videoEl.classList.add("video");
    videoEl.dataset.id = video.id;
    videoEl.innerHTML = `
            <div class="thumbnail">
                <img src="http://localhost:3000${video.thumbnail_url}" alt="Video Thumbnail" />
            </div>
            <div class="videoInfo">
                <h4 class="videoTitle">${video.title}</h4>
                <p class="channelName">${video.username}</p>
            </div>
        `;
    videoEl.addEventListener("click", () => {
      window.location.href = `video.html?id=${video.id}`;
    });
    videoGrid.appendChild(videoEl);
  });
}
