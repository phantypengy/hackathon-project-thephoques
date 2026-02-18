function hideBar() {
  document.getElementById("sideBar").classList.toggle("hidden");
} //toggles the sidebar visibility on and off on button click (the little hamburger menu button at top left)

const grid = document.querySelector(".videoGrid");
const videos = Array.from(grid.children);
//selecting the grid and making an array of its children (the video divs)

document.addEventListener("DOMContentLoaded", () => {
  //when the DOM is fully loaded (DOM means Document Object Model, basically the HTML structure of the page)
  const grid = document.querySelector(".videoGrid"); //select all divs with class "videoGrid" and puts them into grid var
  const videos = Array.from(grid.children); //makes an array of the children of grid (the video divs)

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  } //randomizes the order of the array!! this is something called the Fisher-Yates shuffle algorithm, uhhhmmmmm yeah

  shuffle(videos); //calls the shuffle function on the videos array
  videos.forEach((video) => grid.appendChild(video));
});

const playerModal = document.getElementById("playerModal");
const playerVideo = document.getElementById("playerVideo");
const closePlayer = document.getElementById("closePlayer");
//variables for modal, video in modal, and close button

document.querySelectorAll(".video").forEach((video) => {
  //selecting all divs with class "video"
  video.addEventListener("click", () => {
    //looking for click event on each div with class "video"
    const src = video.dataset.src; //setting src var to whatever's in the data-src attribute of the clicked div
    playerVideo.src = src; //self explanatory
    playerModal.style.display = "flex"; //displays the modal
    playerVideo.play(); //plays. duh.
  });
});

closePlayer.addEventListener("click", () => {
  //when the close button is clicked
  playerVideo.pause(); //pauses the video
  playerModal.style.display = "none"; //hides the modal
  playerVideo.src = ""; //clears the src so it stops downloading
});
