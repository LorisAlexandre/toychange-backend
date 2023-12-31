const express = require("express");
const router = express.Router();
const Channel = require("../models/channel");
const Pusher = require("pusher");
const cloudinary = require("cloudinary").v2;

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

router.post("/createChannel", (req, res) => {
  // const { buyer, seller, annonce } = req.body;
  const newChannel = new Channel({ ...req.body });
  newChannel.save().then((newChannel) => {
    const channelName = newChannel._id.toString();
    pusher.trigger(channelName, "Création", {
      message: "Création du channel",
    });
    res.json({ result: true, channelName });
  });
});

router.post("/:channelName/message", async (req, res) => {
  // const { sender, text, label, replyTo } = req.body;
  const { channelName } = req.params;

  Channel.findById(channelName).then(async (channel) => {
    const newMessage = {
      ...req.body,
    };
    channel.messages.push(newMessage);
    channel.save().then(async () => {
      await pusher.trigger(channelName, "Message", req.body);
      res.json({ result: true, channel });
    });
  });
});

router.post("/:channelName/image", async (req, res) => {
  const { channelName } = req.params;
  const { sender, label } = req.query;

  const photos = req.files.photosFromFront;
  const imagesUrl = [];

  if (photos.length) {
    const uploadPhoto = (photo) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "auto",
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                imagesUrl.push(result.secure_url);
                resolve(result.secure_url);
              }
            }
          )
          .end(photo.data);
      });
    };
    Promise.all(photos.map(uploadPhoto))
      .then((uploadedUrls) => {
        Channel.findById(channelName).then(async (channel) => {
          const newMessage = {
            sender,
            label,
            images: [...uploadedUrls],
          };
          channel.messages.push(newMessage);
          channel.save().then(async () => {
            await pusher.trigger(channelName, "Message", req.body);
            res.json({ result: true, channel });
          });
        });
      })
      .catch((error) => {
        res.status(500).json({ result: false, error });
      });
  } else {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            res.status(500).json({ result: false, error });
          } else {
            imagesUrl.push(result.secure_url);
            Channel.findById(channelName).then(async (channel) => {
              const newMessage = {
                sender,
                label,
                images: imagesUrl,
              };
              channel.messages.push(newMessage);
              channel.save().then(async () => {
                await pusher.trigger(channelName, "Message", req.body);
                res.json({ result: true, channel });
              });
            });
          }
        }
      )
      .end(photos.data);
  }
});

router.get("/:channelName/messages", (req, res) => {
  const { channelName } = req.params;

  Channel.findById(channelName)
    .populate(["annonce", "buyer", "seller"])
    .then((channel) => {
      res.json({ result: true, channel });
    });
});

router.get("/channel", (req, res) => {
  // const { buyer, seller, annonce } = req.query;
  Channel.findOne({ ...req.query }).then((channel) => {
    if (channel) {
      res.json({ result: true, channel });
    } else {
      res.json({ result: false });
    }
  });
});

router.get("/channels/:user", (req, res) => {
  const { user } = req.params;
  Channel.find({ $or: [{ seller: user }, { buyer: user }] })
    .populate("annonce")
    .then((channels) => {
      if (channels.length) {
        res.json({ result: true, channels });
      }
    });
});

router.delete("/:channelName/delete", (req, res) => {
  const { channelName } = req.params;
  Channel.deleteOne({ _id: channelName }).then((data) => {
    res.json({ result: true, data });
  });
});

module.exports = router;

/*
Buyer: 
{
  "_id": {
    "$oid": "65772c0719c0c6c5a945fe20"
  },
  "username": "loris2023",
}

Seller: 
{
  "_id": {
    "$oid": "65772b4719c0c6c5a945fe17"
  },
  "username": "houss82",
}

Annonce: 
{
  "_id": {
    "$oid": "65781d32e0d7234905e2f8cc"
  },
  "title": "SpiderMan",
  "type": "exchange",
}
 */
