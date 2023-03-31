import { useState, useEffect } from "react";

// create a listener that allows the user to paste an image from clipboard
// return the base64 string
const useImageClip = () => {
    const [image, setImage] = useState(null);

    useEffect(() => {
        const listener = (event) => {
            const items = event.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf("image") === 0) {
                    const blob = items[i].getAsFile();
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const url = event.target.result;
                        setImage(url);
                    }
                    reader.readAsDataURL(blob);
                }
            }
        };
        document.addEventListener("paste", listener);
        return () => {
            document.removeEventListener("paste", listener);
        };
    }, []);
    return image;
}

export default useImageClip;