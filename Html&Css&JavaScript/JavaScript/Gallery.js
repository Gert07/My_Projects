const searchInput = document.getElementById("search");
const images = document.querySelectorAll(".gallery img");

searchInput.addEventListener("input", function () {
    const value = this.value.toLowerCase();

    images.forEach(img => {
        const altText = img.alt.toLowerCase();

        if(altText.includes(value)) {
            img.style.display = "block";
        } else {
            img.style.display = "none";
        }
    });
});

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const closeBtn = document.getElementById("close");

// open
images.forEach(img => {
  img.addEventListener("click", () => {
    lightbox.style.display = "flex";
    lightboxImg.src = img.src;
  });
});

// close button
closeBtn.addEventListener("click", () => {
  lightbox.style.display = "none";
});

function openImg(src) {
  document.getElementById('lightbox').style.display = 'block';
  document.getElementById('lightbox-img').src = src;
}