const PhotoUpload = {
  uploadLimit: 5,
  input: '',
  container: document.querySelector('.upload-container'),
  files: [],
  removeOldPhoto(event) {
    const photoDiv = event.target.parentNode;

    if (photoDiv.id) {
      const removedFiles = document.querySelector(
        "input[name='removed_files']"
      );

      if (removedFiles) {
        removedFiles.value += `${photoDiv.id},`;
      }
    }

    photoDiv.remove();
  },
  removePhoto(event) {
    const photoDiv = event.target.parentNode;
    const photosArray = this.container.querySelectorAll('.photo');
    const index = Array.from(photosArray).indexOf(photoDiv);

    this.files.splice(index, 1);
    this.input.files = this.getAllFiles();
    photoDiv.remove();
  },
  getAllFiles() {
    const dataTransfer =
      new ClipboardEvent('').clipboardData || new DataTransfer();

    this.files.forEach(file => dataTransfer.items.add(file));
    return dataTransfer.files;
  },
  getContainer(image) {
    const div = document.createElement('div');
    const icon = document.createElement('i');

    icon.classList.add('material-icons');
    icon.textContent = 'close';

    div.classList.add('photo');
    div.append(image);
    div.append(icon);
    div.addEventListener('click', this.removePhoto.bind(this));

    return div;
  },
  hasLimit(event) {
    const { files: fileList } = this.input;
    const previews = this.container.querySelectorAll('.photo');

    if (fileList.length > this.uploadLimit) {
      alert(`Envie no máximo ${this.uploadLimit} fotos`);
      event.preventDefault();
      return true;
    }

    const totalPhotos = previews.length + fileList.length;

    if (totalPhotos > this.uploadLimit) {
      alert('Você atingiu o limite máximo de fotos');
      event.preventDefault();
      return true;
    }

    return false;
  },
  handleInput(event) {
    const fileList = event.target.files;
    this.input = event.target;

    if (this.hasLimit(event)) return;

    Array.from(fileList).forEach(file => {
      this.files.push(file);
      const image = document.createElement('img');
      image.src = URL.createObjectURL(file);

      const div = this.getContainer(image);
      this.container.append(div);
    });

    this.input.files = this.getAllFiles();
  },
};
