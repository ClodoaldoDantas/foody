const UploadSingle = {
  imageUrl: document.querySelector('.image-url'),
  handleInput(event) {
    const file = event.target.files[0];
    this.input = event.target;

    if (file) {
      this.imageUrl.style.display = 'block';
      this.imageUrl.value = file.name;
    } else {
      this.imageUrl.style.display = 'none';
    }
  },
};
