const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const selectedFile = document.getElementById("selectedFile");

let videoFile = null;
let thumbnailFile = null;

document.getElementById("thumbnailInput").addEventListener("change", () => {
  thumbnailFile = document.getElementById("thumbnailInput").files[0];
  document.getElementById("selectedThumbnail").textContent =
    `Selected: ${thumbnailFile.name}`;
});

// File browser
fileInput.addEventListener("change", () => {
  videoFile = fileInput.files[0];
  selectedFile.textContent = `Selected: ${videoFile.name}`;
});

// Drag and drop
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragOver");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragOver");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragOver");
  videoFile = e.dataTransfer.files[0];
  selectedFile.textContent = `Selected: ${videoFile.name}`;
});

async function uploadVideo() {
  if (!videoFile) {
    alert("Please select a video first!");
    return;
  }

  const formData = new FormData();
  formData.append("video", videoFile);
  formData.append("thumbnail", thumbnailFile);
  formData.append("title", document.querySelector("#title").value);
  formData.append("description", document.querySelector("#description").value);
  formData.append("user_id", 1);

  const response = await fetch("http://localhost:3000/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  console.log("Video uploaded:", data);
  alert("Video uploaded successfully!");
}
