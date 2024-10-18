const port = 2000;
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt'); // Import bcrypt
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb+srv://saikat:saikatj@cluster0.bkvaf.mongodb.net/social", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});

// User schema
const userSchema = new mongoose.Schema({
    _uid: {
        type: String,
        unique: true,
    },
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },

    friends: {
        type: [mongoose.Schema.Types.ObjectId], // Array of ObjectIds (references to users who are friends)
        ref: 'User', // Reference to the User model
    },

    friend_requests_sent: {
        type: [mongoose.Schema.Types.ObjectId], // Array of ObjectIds (references to users to whom friend requests were sent)
        ref: 'User',
    },

    friend_requests_received: {
        type: [mongoose.Schema.Types.ObjectId], // Array of ObjectIds (references to users from whom friend requests were received)
        ref: 'User',
    },

    notifications: [
        {
            from: {
                type: mongoose.Schema.Types.ObjectId, // The sender's user ID
                ref: 'User', // Reference to the User model
                required: true,
            },
            status: {
                type: Boolean, // Indicates if the friend request is accepted (true) or still pending (false)
                required: true,
                default: false, // Default value set to `false` meaning 'pending'
            },
        },
    ],
    phone_number: {
        type: String, // Change to String
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    confirm_password: {
        type: String,
        validate: {
            validator: function (value) {
                return value === this.password;
            },
            message: "Passwords do not match."
        },
    },
    save_posts: {
        type: Array,
        default: [],
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        this.password = await bcrypt.hash(this.password, 10);
        this.confirm_password = undefined; // Do not store confirm_password
        this._uid = '@' + this.first_name + new Date().getSeconds() + String.fromCharCode(Math.floor(Math.random() * 26) + 97) + Math.floor(Math.random() * 99) + 1;
        next();
    } catch (error) {
        return next(error + "hi");
    }
});

// Create a User model
const User = mongoose.model('User', userSchema);

app.post('/signup', async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).send({ message: "Duplicate account" });
        }

        const user = new User({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            phone_number: req.body.phone_number,
            password: req.body.password, // only password here
            confirm_password: req.body.confirm_password,
            save_posts: [], // initialize as empty
        });

        await user.save();

        const data = { user: { id: user._id } };
        const token = jwt.sign(data, 'secret_ecom', { expiresIn: '1h' });

        console.log("User saved");
        res.json({ success: true, token });
    } catch (error) {
        console.error("Error saving user:", error);
        res.status(500).send({ message: error.message || "Internal Server Error" });
    }
});

// Login
app.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const data = {
            user: {
                id: user.id,
            },
        };

        const token = jwt.sign(data, 'secret_ecom');
        // Send user details along with the token
        res.json({
            success: true,
            token,
            user: {
                first_name: user.first_name,
                profile_pic: user.profile_pic,
            }
        });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).send("Internal Server Error");
    }
});


// Post section
// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'upload', 'images');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup for file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'upload/images'); // Ensure 'upload/images' is the correct directory path
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use('/images', express.static('upload/images'));

app.post('/upload', upload.single('image'), (req, res) => { // Ensure 'image' matches the name attribute in your client form
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    console.log(req.file, req.body);
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
});

const productSchema = new mongoose.Schema({
    topic: {
        type: String,
    },
    tag: {
        type: [String],
    },
    image: {
        type: String,
    }
});

// Create a model
const Post = mongoose.model('Post', productSchema);

app.post('/addpost', upload.single('image'), async (req, res) => {
    try {
        const post = new Post({
            topic: req.body.topic,
            tag: req.body.tag.split(','), // Split tags by commas to store as an array
            image: req.file ? `http://localhost:${port}/images/${req.file.filename}` : '',
        });

        await post.save();
        console.log("Post saved");

        res.json({
            success: true,
            message: "Post created successfully",
        });
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// user profile section
app.get('/userprofile', async (req, res) => {
    try {
        // Use req.query if you're using GET, or req.body for POST
        const userinfo = await User.findOne({ email: req.query.email });
        if (userinfo) {
            res.json(userinfo);
            console.log("hi" + userinfo);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// friend request system

// API to send friend request and create a notification
app.post('/sendFriendRequest', async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    // Find sender and receiver by their IDs
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    // Check if the receiver has already received a friend request
    if (receiver.friend_requests_received.includes(senderId)) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Add the sender to the receiver's friend requests received
    receiver.friend_requests_received.push(senderId);

    // Add the receiver to the sender's friend requests sent
    sender.friend_requests_sent.push(receiverId);

    // Add a notification to the receiver's notifications
    receiver.notifications.push({
      from: senderId,
      status: false, // The request is pending
    });

    // Save both the sender and receiver documents
    await sender.save();
    await receiver.save();

    res.json({ message: 'Friend request sent and notification created' });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


//Notification system 



//user fetch section for people file
app.get('/getPeople', async (req, res) => {
    try {
        const user = await User.find({});
        console.log("all user fetched");
        const users = await User.aggregate([
            { $sample: { size: user.length } }        // Randomly sample items
        ]);
        res.send(users);
    } catch (error) {

    }
})

//home section 

app.get('/getpost', async (req, res) => {
    try {
        // Fetch all posts 
        const post = await Post.find({});
        console.log("All posts fetched");

        const posts = await Post.aggregate([
            { $sample: { size: post.length } } // Randomly sample items
        ]);

        res.json(posts); // Send JSON response
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Internal Server Error" }); // Return JSON for errors
    }
});



app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
