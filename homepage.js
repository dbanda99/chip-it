// homepage.js

// Example: Pause/Play background video on button click (if you add a button to control it)
document.addEventListener("DOMContentLoaded", function () {
    const video = document.getElementById("bgVideo");
    const toggleBtn = document.getElementById("toggleVideoBtn");
  
    if (toggleBtn && video) {
      toggleBtn.addEventListener("click", () => {
        if (video.paused) {
          video.play();
          toggleBtn.textContent = "Pause Video";
        } else {
          video.pause();
          toggleBtn.textContent = "Play Video";
        }
      });
    }
  });
  