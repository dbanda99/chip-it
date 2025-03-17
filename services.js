// services.js

// Example script: log a message when the carousel slides
document.addEventListener("DOMContentLoaded", function () {
    const carousel = document.getElementById("myCarousel");
    if (carousel) {
      carousel.addEventListener("slide.bs.carousel", (event) => {
        console.log("Carousel is sliding to index:", event.to);
      });
    }
  });
  