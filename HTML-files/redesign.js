async function loadVideos() {
  try {
    const response = await fetch("/videos", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to load videos");
    }

    const videos = await response.json();

    for (let i = videos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [videos[i], videos[j]] = [videos[j], videos[i]];
    }

    updateSectionHeader("Featured Archive", "Explore recently uploaded videos");
    renderVideos(videos, "No videos available yet.");
  } catch (error) {
    console.error("Load videos error:", error);
    renderEmptyState("Something went wrong while loading videos.");
  }
}

function renderVideos(videos, emptyMessage = "No videos found.") {
  const videoGrid = document.querySelector(".videoGrid");
  videoGrid.innerHTML = "";

  if (!videos || videos.length === 0) {
    renderEmptyState(emptyMessage);
    return;
  }

  videos.forEach((video) => {
    const videoEl = document.createElement("div");
    videoEl.classList.add("video");
    videoEl.dataset.id = video.id;
    videoEl.innerHTML = `
      <div class="thumbnail">
        <img src="${video.thumbnail_url}" alt="Video Thumbnail" />
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

function renderEmptyState(message) {
  const videoGrid = document.querySelector(".videoGrid");
  videoGrid.innerHTML = `
    <div class="emptyState">
      <h3>No videos to show</h3>
      <p>${message}</p>
    </div>
  `;
}

function updateSectionHeader(title, subtext) {
  const sectionHeading = document.querySelector(".sectionHeading");
  const sectionSubtext = document.querySelector(".sectionSubtext");

  if (sectionHeading) {
    sectionHeading.textContent = title;
  }

  if (sectionSubtext) {
    sectionSubtext.textContent = subtext;
  }
}

loadVideos();

function closeVideo() {
  const playerModal = document.getElementById("playerModal");
  const playerVideo = document.getElementById("playerVideo");

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

  try {
    const response = await fetch(`/search?q=${encodeURIComponent(query)}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Search failed");
    }

    const videos = await response.json();

    updateSectionHeader(
      `Search Results`,
      `Showing results for "${query}"`
    );

    renderVideos(videos, `No videos found for "${query}".`);
  } catch (error) {
    console.error("Search error:", error);
    renderEmptyState("Something went wrong while searching.");
  }
}