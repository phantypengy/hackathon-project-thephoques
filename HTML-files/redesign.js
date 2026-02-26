let grid = document.querySelector(".videoGrid");
let videos = Array.from(grid.children);
//selecting the grid and making an array of its children (the video divs)

document.addEventListener("DOMContentLoaded", () => {
  let grid = document.querySelector(".videoGrid"); //select all divs with class "videoGrid" and puts them into grid var
  let videos = Array.from(grid.children); //makes an array of the children of grid (the video divs)

  function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  } //randomizes the order of the array!!

  shuffle(videos); //calls the shuffle function on the videos array
  videos.forEach((video) => grid.appendChild(video));
});
