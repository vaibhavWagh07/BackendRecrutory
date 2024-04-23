const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");
const multer = require("multer");
const cors = require("cors");
const { default: mongoose } = require("mongoose");
const moment = require("moment");
const { v2: cloudinary } = require("cloudinary");
const compression = require('compression');

cloudinary.config({
  cloud_name: "dgvbilofn",
  api_key: "492276922574542",
  api_secret: "TTfx2nb3-RerAQuRRMytsN_xk5E",
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(cors());
app.use(compression());


const mongoURI =
  "mongodb+srv://vaibhav:1234@cluster0.24ik1dr.mongodb.net/recrutory?retryWrites=true&w=majority&appName=Cluster0";
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("connection successfull");
  })
  .catch((err) => console.log(err));

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// get api
app.get("/msgCheck", (req, res) => {
  res.status(200).send({
    msg: "APIs are working successfully",
  });
});

// post api for Candidate form
// app.post("/candidate", upload.fields([{ name: 'uploadPhoto', maxCount: 1 }, { name: 'uploadCV', maxCount: 1 }]), async (req, res) => {
//     try {
//         const formData = req.body;
//         const files = req.files;
//         let imageUrl, cvUrl;
  
//         // Construct file base name using firstName and lastName
//         const baseName = `${formData.name}`.replace(/ /g, '_');
  
//         // Upload photo to Cloudinary
//         if (files.uploadPhoto) {
//             const photo = files.uploadPhoto[0];
//             const cloudinaryUploadPhotoResult = await cloudinary.uploader.upload(
//                 photo.path,
//                 { public_id: `cv_${baseName}` }
//             );
//             imageUrl = cloudinaryUploadPhotoResult.url;
//         }
  
//         const client = new MongoClient(mongoURI, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });
  
//         await client.connect();
//         const db = client.db("recrutory");
//         const collection = db.collection("candidate");
  
//         // Prepare data to be saved 
//         const dataToSave = {
//             date: moment().format("YYYY-MM-DD HH:mm:ss"),
//             ...formData,
//             cv: imageUrl,
//             remarks: ""
//         };
  
//         await collection.insertOne(dataToSave);
//         res.status(200).send('OK');
//     } catch (err) {
//         console.error("Error:", err);
//         res.status(500).send(err);
//     }
//   });


// get all api for candidate form

app.post("/candidate", upload.single('uploadPhoto'), async (req, res) => {
  try {
      const formData = req.body;
      const file = req.file;
      let imageUrl;

      // Check if uploadPhoto file is present
      if (file) {
          // Construct file base name using firstName and lastName
          const baseName = `${formData.name}`.replace(/ /g, '_');

          // Upload photo to Cloudinary
          const cloudinaryUploadPhotoResult = await cloudinary.uploader.upload(
              file.path,
              { public_id: `cv_${baseName}` }
          );
          imageUrl = cloudinaryUploadPhotoResult.url;
      }

      const client = new MongoClient(mongoURI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
      });

      await client.connect();
      const db = client.db("recrutory");
      const collection = db.collection("candidate");

      // Prepare data to be saved 
      const dataToSave = {
          date: moment().format("YYYY-MM-DD HH:mm:ss"),
          ...formData,
          cv: imageUrl,
          remarks: ""
      };

      await collection.insertOne(dataToSave);
      res.status(200).send('OK');
  } catch (err) {
      console.error("Error:", err);
      res.status(500).send(err);
  }
});


app.get("/api/candidate", async (req, res) => {
  const client = new MongoClient(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const db = client.db("recrutory");
    const collection = db.collection("candidate");

    const candidate = await collection.find({}).toArray(); // Fetch all blog documents
    res.json(candidate);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Internal Server Error");
  } finally {
    await client.close();
  }
});

// patch api for candidate form for updating remarks
app.patch("/api/candidate/remarks/:id", async (req, res) => {
  const updates = req.body;
  const id = req.params.id;

  // Check if the provided ID is valid
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  try {
    const client = new MongoClient(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();
    const db = client.db("recrutory");
    const collection = db.collection("candidate");

    // Instantiate ObjectId with `new` when using it to construct query
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "No matching document found" });
    }

    if (result.modifiedCount === 0) {
      return res
        .status(200)
        .json({ message: "No changes made", details: result });
    }

    res.status(200).json({ message: "Update successful", details: result });
  } catch (err) {
    console.error("Database update error:", err);
    res
      .status(500)
      .json({ error: "Could not update the data", details: err.message });
  }
});

// post api for company form
app.post("/company", async (req, res) => {
  const formData = req.body;
  formData.timestamp = moment().format("YYYY-MM-DD HH:mm:ss");

  try {
    const client = new MongoClient(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();

    const db = client.db("recrutory");
    const collection3 = db.collection("customer");

    await collection3.insertOne(formData);
    res.status(200).send("OK");

    await client.close();
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Internal Server Error");
  }
});

// get all api for company data
app.get("/api/company", async (req, res) => {
  const client = new MongoClient(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const db = client.db("recrutory");
    const collection = db.collection("customer");

    const company = await collection.find({}).toArray(); // Fetch all blog documents
    res.json(company);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Internal Server Error");
  } finally {
    await client.close();
  }
});

// patch api for company form for updating remarks
app.patch("/api/company/remarks/:id", async (req, res) => {
  const updates = req.body;
  const id = req.params.id;

  // Check if the provided ID is valid
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  try {
    const client = new MongoClient(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();
    const db = client.db("recrutory");
    const collection = db.collection("customer");

    // Instantiate ObjectId with `new` when using it to construct query
    const result = await collection.updateOne(
      { _id: new ObjectId(id) }, // Correct usage of ObjectId with 'new'
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "No matching document found" });
    }

    if (result.modifiedCount === 0) {
      return res
        .status(200)
        .json({ message: "No changes made", details: result });
    }

    res.status(200).json({ message: "Update successful", details: result });
  } catch (err) {
    console.error("Database update error:", err);
    res
      .status(500)
      .json({ error: "Could not update the data", details: err.message });
  }
});


// making api for login functionality


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
