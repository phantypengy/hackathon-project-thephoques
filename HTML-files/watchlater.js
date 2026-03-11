async function loadWatchLater() {
  const loginRequired = document.getElementById("loginRequired");
  const watchLaterGrid = document.getElementById("watchLaterGrid");
  const sectionSubtext = document.querySelector(".sectionSubtext");

  loginRequired.style.display = "none";
  watchLaterGrid.innerHTML = "";

  try {
    const meResponse = await fetch("/me", {
      credentials: "include",
    });

    if (!meResponse.ok) {
      loginRequired.style.display = "block";
      sectionSubtext.textContent = "Log in to access your saved videos";
      return;
    }

    const watchLaterResponse = await fetch("/watch-later", {
      credentials: "include",
    });

    if (!watchLaterResponse.ok) {
      throw new Error("Failed to load Watch Later videos");
    }

    const videos = await watchLaterResponse.json();

    if (!videos || videos.length === 0) {
      watchLaterGrid.innerHTML = `
        <div class="emptyState">
          <h3>No saved videos yet</h3>
          <p>Videos you save to Watch Later will appear here.</p>
        </div>
      `;
      sectionSubtext.textContent = "You have no saved videos yet";
      return;
    }

    sectionSubtext.textContent = "Your saved videos";

    videos.forEach((video) => {
      const videoCard = document.createElement("div");
      videoCard.classList.add("video");
      videoCard.innerHTML = `
        <div class="thumbnail">
          <img src="${video.thumbnail_url}" alt="Video Thumbnail" />
        </div>
        <div class="videoInfo">
          <h4 class="videoTitle">${video.title}</h4>
          <p class="channelName">${video.username}</p>
          <button class="removeWatchLaterBtn" data-id="${video.video_id}">
            Remove
          </button>
        </div>
      `;

      videoCard.addEventListener("click", (event) => {
        if (event.target.classList.contains("removeWatchLaterBtn")) {
          return;
        }
        window.location.href = `video.html?id=${video.video_id}`;
      });

      watchLaterGrid.appendChild(videoCard);
    });

    addRemoveListeners();
  } catch (error) {
    console.error("Watch Later error:", error);
    watchLaterGrid.innerHTML = `
      <div class="emptyState">
        <h3>Could not load saved videos</h3>
        <p>Please try again later.</p>
      </div>
    `;
  }
}

function addRemoveListeners() {
  const removeButtons = document.querySelectorAll(".removeWatchLaterBtn");

  removeButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.stopPropagation();

      const videoId = button.dataset.id;

      try {
        const response = await fetch(`/watch-later/${videoId}`, {
          method: "DELETE",
          credentials: "include",
        });

        const data = await response.json();

        if (response.ok) {
          loadWatchLater();
        } else {
          alert(data.error || "Failed to remove video");
        }
      } catch (error) {
        console.error("Remove Watch Later error:", error);
        alert("Something went wrong while removing the video.");
      }
    });
  });
}

loadWatchLater();