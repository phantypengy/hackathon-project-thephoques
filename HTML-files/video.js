async function loadVideo() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  console.log("URL:", window.location.href);
  console.log("ID:", id);

  if (!id) {
    window.location.href = "redesign.html";
    return;
  }

  const response = await fetch(`/videos/${id}`, {
    credentials: "include",
  });

  console.log("Response status:", response.status);

  if (!response.ok) {
    window.location.href = "redesign.html";
    return;
  }

  const video = await response.json();
  console.log("Video data:", video);

  document.title = `Sealio - ${video.title}`;
  const player = document.getElementById("mainPlayer");
  player.src = `${video.video_url}`;
  player.play();
  document.getElementById("videoTitle").textContent = video.title;
  document.getElementById("videoUploader").textContent =
    `Uploaded by: ${video.username}`;
  document.getElementById("videoDate").textContent = new Date(
    video.created_at,
  ).toLocaleDateString();
  document.getElementById("videoDescription").textContent =
    video.description || "No description.";

  const watchLaterBtn = document.getElementById("watchLaterBtn");

  if (watchLaterBtn) {
    watchLaterBtn.addEventListener("click", async () => {
      try {
        const response = await fetch(`/watch-later/${id}`, {
          method: "POST",
          credentials: "include",
        });

        const data = await response.json();

        if (response.ok) {
          watchLaterBtn.textContent = "Saved to Watch Later";
          watchLaterBtn.classList.add("saved");
        } else {
          alert(data.error || "Failed to save video");
        }
      } catch (err) {
        console.error("Watch Later error:", err);
        alert("Server error");
      }
    });
  }

  await loadRelated(parseInt(id));
  await loadComments(parseInt(id));
  await checkWatchLater(parseInt(id));
}

loadVideo();

async function loadRelated(currentId) {
  const response = await fetch("/videos", {
    credentials: "include",
  });
  const videos = await response.json();

  // Filter out current video and shuffle
  const others = videos.filter((v) => v.id !== currentId);
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }

  const related = others.slice(0, 5);
  const container = document.getElementById("relatedVideos");
  container.innerHTML = "";

  related.forEach((video) => {
    const el = document.createElement("div");
    el.classList.add("relatedVideo");
    el.innerHTML = `
            <img src="${video.thumbnail_url}" alt="thumbnail" />
            <div class="relatedInfo">
                <p class="relatedTitle">${video.title}</p>
                <p class="relatedUploader">${video.username}</p>
            </div>
        `;
    el.addEventListener("click", () => {
      window.location.href = `video.html?id=${video.id}`;
    });
    container.appendChild(el);
  });
}

async function loadComments(videoId) {
  const response = await fetch(`/videos/${videoId}/comments`, {
    credentials: "include",
  });
  const comments = await response.json();
  const list = document.getElementById("commentsList");
  list.innerHTML = "";

  if (comments.length === 0) {
    list.innerHTML = '<p class="noComments">No comments yet. Be the first!</p>';
    return;
  }

  comments.forEach((comment) => {
    const el = document.createElement("div");
    el.classList.add("comment");
    el.innerHTML = `
            <div class="commentHeader">
                <span class="commentUsername">${comment.username}</span>
                <span class="commentDate">${new Date(comment.created_at).toLocaleDateString()}</span>
            </div>
            <p class="commentContent">${comment.content}</p>
        `;
    list.appendChild(el);
  });
}

async function postComment() {
  const content = document.getElementById("commentInput").value.trim();
  if (!content) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const response = await fetch(`/videos/${id}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ content }),
  });

  if (response.ok) {
    document.getElementById("commentInput").value = "";
    loadComments(parseInt(id));
  } else {
    const data = await response.json();
    alert(data.error);
  }
}

async function checkWatchLater(id) {
  const response = await fetch(`/watch-later/${id}`, {
    credentials: "include",
  });
  const data = await response.json();
  if (data.saved) {
    watchLaterBtn.textContent = "Saved to Watch Later";
    watchLaterBtn.classList.add("saved");
  }
}
