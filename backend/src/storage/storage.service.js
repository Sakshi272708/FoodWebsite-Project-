const ImageKit = require('imagekit');

const imagekitInstance = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
}); 

const uploadFile = async(buffer) => {
    try {
        const response = await imagekitInstance.upload({
            file: buffer,
            fileName: `fooditem-${Date.now()}`,
            folder: "/foodweb"
        });
        return response;
    }catch(err) {
        console.error("Error uploading file to ImageKit", err);
        throw err;
    }
}


module.exports = uploadFile;