const fastify = require("fastify");
const app = fastify();
require("dotenv").config();

const { BlobServiceClient } = require("@azure/storage-blob");
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerClient = blobServiceClient.getContainerClient(
  process.env.CONTAINER_NAME
);

//example response
/*
{
  "status": 200,
  "success": true,
  "data": {
    "id": "JRBePDz",
    "deletehash": "EvHVZkhJhdNClgY",
    "account_id": null,
    "account_url": null,
    "ad_type": null,
    "ad_url": null,
    "title": "Simple upload",
    "description": "This is a simple image upload in Imgur",
    "name": "",
    "type": "image/jpeg",
    "width": 600,
    "height": 750,
    "size": 54757,
    "views": 0,
    "section": null,
    "vote": null,
    "bandwidth": 0,
    "animated": false,
    "favorite": false,
    "in_gallery": false,
    "in_most_viral": false,
    "has_sound": false,
    "is_ad": false,
    "nsfw": null,
    "link": "https://i.imgur.com/JRBePDz.jpeg",
    "tags": [],
    "datetime": 1708424380,
    "mp4": "",
    "hls": ""
  }
}
  */

app.post("/3/image", async (req, res) => {
    //this is a recreation of the imgur api, but it uploads to azure blob storage
    //this is just a simple example
    //you can add more fields to the request body
    //the request is a x-www-form-urlencoded

    try {
        //get the image
        const image = req.body.image;
        //convert to array buffer
        const buffer = Buffer.from(image, "base64");

        //generate unique file name
        //generate 8 character random string
        const uuid = Math.random().toString(36).substring(2, 10);

        const blockBlobClient = containerClient.getBlockBlobClient(
            `${uuid}.png`
        );
        await blockBlobClient.uploadData(buffer, buffer.byteLength);

        //send response
        res.send({
            status: 200,
            success: true,
            data: {
                url: "https://mischa.pics/" + uuid,
                deletehash: uuid,
            }
        });
    } catch (error) {
        res.send({
            status: 500,
            success: false,
            message: "Image upload failed",
            error: error.message
        });
    }
});

app.listen({
    host: "0.0.0.0",
    port: 3000
}, () => {
    console.log("Server is running on port 3000");
})