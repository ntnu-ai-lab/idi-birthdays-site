import { ref, uploadString, getDownloadURL } from "firebase/storage";

const uploadImage = (storage, image, setImage) => {
    let markdownContent = ""
    if (image) {
        // image size in MB
        const size = image.length / 1024;
        const fileName = new Date().toISOString() + ".png";
        const imgRef = ref(storage, `images/${fileName}`);
        uploadString(imgRef, image, 'data_url').then((snapshot) => {
            getDownloadURL(imgRef).then((url) => {
                setImage(url)
            })
        });
    }
    return markdownContent
}

export default uploadImage