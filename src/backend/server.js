import express from "express";
import bodyParser from "body-parser";
import twilio from "twilio";
import admin from "firebase-admin";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import cloudinary from "cloudinary";
import { Buffer } from "buffer";

dotenv.config({ path: "../../.env" });

const app = express();
app.use(
  cors({
    origin: true,
  })
);
app.use(express.json()); // Allows Express to parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Allows parsing form data

app.use(bodyParser.urlencoded({ extended: false }));

app.options("*", cors());

const serviceAccount = JSON.parse(
  fs.readFileSync("./firebase-admin-sdk.json", "utf8")
);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

console.log(twilioPhoneNumber);
const client = twilio(twilioSid, twilioAuthToken);

const userSessions = {}; // To track user progress for memories
const otpSessions = {}; // Separate session for OTPs

async function downloadAndUpload(mediaUrl, messageSid, msgFrom, res) {
  try {
    const response = await axios.get(mediaUrl, {
      auth: {
        username: process.env.TWILIO_ACCOUNT_SID,
        password: process.env.TWILIO_AUTH_TOKEN,
      },
      responseType: "arraybuffer",
    });

    const filename = `temp_${messageSid}.jpg`;
    fs.writeFileSync(filename, response.data);

    const result = await cloudinary.v2.uploader.upload(filename, {
      upload_preset: process.env.VITE_UPLOAD_PRESET,
    });

    fs.unlinkSync(filename);

    userSessions[msgFrom].images.push(result.secure_url);

    sendReply(
      msgFrom,
      "Image uploaded! Send another image or type 'done' to finish.",
      res
    );
  } catch (error) {
    console.error("Error uploading image:", error);
    sendReply(msgFrom, "Failed to upload image.", res);
  }
}

// Route to send OTP
app.post("/sendotp", async (req, res) => {
  const { mobileNumber } = req.body;
  if (!mobileNumber) {
    return res
      .status(400)
      .json({ success: false, message: "Mobile number required" });
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpSessions[mobileNumber] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // Expires in 5 min

  try {
    // Send OTP using Twilio
    await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: twilioPhoneNumber,
      to: mobileNumber,
    });

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

// Route to verify OTP
app.post("/verifyotp", async (req, res) => {
  const { mobileNumber, otp } = req.body;

  if (!mobileNumber || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid request body" });
  }

  // Verify OTP
  if (otpSessions[mobileNumber] && otpSessions[mobileNumber].otp === otp) {
    delete otpSessions[mobileNumber];
    return res.json({ success: true, message: "OTP verified!" });
  }

  res
    .status(400)
    .json({ success: false, message: "Incorrect OTP. Please try again." });
});

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.VITE_CLOUD_NAME,
  api_key: process.env.VITE_CLOUD_API_KEY,
  api_secret: process.env.VITE_CLOUD_API_SECERT,
});

app.post("/delete-image", async (req, res) => {
  const { publicId } = req.body;
  try {
    const response = await cloudinary.uploader.destroy(publicId);
    res.json({ success: true, response });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
app.post("/webhook", async (req, res) => {
  const messageSid = req.body.SmsMessageSid;
  const msgFrom = req.body.From;
  const msgBody = req.body.Body?.trim().toLowerCase();
  const imageUrl = req.body.MediaUrl0; // WhatsApp image URL

  const userQuery = await db
    .collection("users")
    .where("mobile", "==", msgFrom.replace("whatsapp:", ""))
    .get();

  if (userQuery.empty) {
    return sendReply(
      msgFrom,
      "You are not registered. Please sign up first.",
      res
    );
  }

  const userDoc = userQuery.docs[0];
  const uid = userDoc.id;

  if (!userSessions[msgFrom]) {
    if (msgBody.includes("add a memory")) {
      userSessions[msgFrom] = { step: "title", images: [] }; // Initialize images array
      return sendReply(
        msgFrom,
        "Great! Send me the title of your memory.",
        res
      );
    }
    return sendReply(msgFrom, "Send 'Add a memory' to start.", res);
  }

  const userData = userSessions[msgFrom];

  if (userData.step === "title") {
    userData.title = req.body.Body;
    userData.step = "location";
    return sendReply(msgFrom, "Now send the location of your memory.", res);
  }

  if (userData.step === "location") {
    userData.location = req.body.Body;
    userData.step = "description";
    return sendReply(msgFrom, "Describe your memory.", res);
  }

  if (userData.step === "description") {
    userData.description = req.body.Body;
    userData.step = "image";
    return sendReply(
      msgFrom,
      "Send an image to attach to your memory. You can send multiple images. Type 'done' when you're finished.",
      res
    );
  }
  if (userData.step === "image") {
    if (msgBody === "done") {
      if (userData.images.length === 0) {
        return sendReply(msgFrom, "Please send at least one image.", res);
      }

      const userRef = db.collection("users").doc(uid);
      await userRef.collection("trips").add({
        from: msgFrom,
        name: userData.title,
        location: userData.location,
        notes: userData.description,
        images: userData.images,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      delete userSessions[msgFrom];
      return sendReply(
        msgFrom,
        "Your memory has been saved successfully!",
        res
      );
    }

    if (!imageUrl) {
      return sendReply(
        msgFrom,
        "Please send an image or type 'done' to finish.",
        res
      );
    }

    downloadAndUpload(imageUrl, messageSid, msgFrom, res);
  }
});

// Send reply to user
const sendReply = (to, message, res) => {
  client.messages
    .create({
      from: `whatsapp:${twilioWhatsAppNumber}`,
      to,
      body: message,
    })
    .then(() => res.status(200).end())
    .catch((err) => {
      console.error("Error sending message:", err);
      res.status(500).end();
    });
};

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server running on port ${port}`));
