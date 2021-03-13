const Gallery = {
  highlight: document.querySelector('.gallery > img'),
  previews: document.querySelectorAll('.gallery-thumbnails img'),
  setImage(event) {
    this.previews.forEach(preview => preview.classList.remove('active'));
    event.target.classList.add('active');
    this.highlight.src = event.target.src;
  },
};
