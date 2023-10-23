// Perform needed imports/includes
const express = require('express')
const mongoose = require("mongoose");

const app = express();

// Mongoose configuration
mongoose.set("strictQuery", false);
// Define the database URL to connect to. XXXXXXXXXXXXXXXXXXX
const mongoDB = "mongodb://127.0.0.1/my_database";
// Wait for database to connect, logging an error if there is a problem
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// SCHEMAS

// User
const userSchema = new mongoose.Schema({
    
    username: 
    {
        type: String,
        unique: true,
        required: true,
        trim: true
    },

    email:
    {
        type: String,
        unique: true,
        required: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/, 'Please fill a valid email address']
        // Must match a valid email address (look into Mongoose's matching validation)
    },

    thoughts:   // Array of _id values referencing the Thought model
    [{
      type: mongoose.Schema.ObjectId,
      ref: "Thought"
    }],

    friends:  // Array of _id values referencing the User model (self-reference)
    [{
        type: mongoose.Schema.ObjectId,
        ref: "User"
    }],

    // Schema Settings
    // Create a virtual called friendCount that retrieves the length of the user's friends array field on query.
    virtuals: {
        friendCount: {
            get() {return this.friends.length;}
        }
    }

});
// Create a model
const User = mongoose.model('User', userSchema);


// Thought Schema
const thoughtSchema = new mongoose.Schema({
    thoughtText: 
    {
        type: String,
        required: true,
        maxLength: 280,
        minLength: 1
    },
    createdAt:
    {
        // Date
        type: Date,
        // Set default value to the current timestamp
        default: Date.now(),
        // Use a getter method to format the timestamp on query XXXXXXXXXXXXXX
        get: (date) => {return "FORMATTED DATE";}
    },
    username: 
    {
        type: String,
        required: true
    },
    reactions:
    {
      // Array of nested documents created with the reactionSchema  XXXXXXXX
    },

    // Create a virtual called reactionCount that retrieves the length of the thought's reactions array field on query.
    //  XXXXXXXXXX
});
// Generate model
const Thought = mongoose.model('Thought', thoughtSchema);

// Reaction (SCHEMA ONLY)
// This will not be a model, but rather will be used as the reaction field's subdocument schema in the Thought model.
const reactionSchema = new reaction.Schema ({

    reactionId:
    {
        type: mongoose.ObjectId,
        default: new mongoose.Types.ObjectId()
    },

    reactionBody:
    {
        type: String,
        required: true,
        maxLength: 280,
    },
    
    username:
    {
        type: String,
        required: true,
    },

    createdAt:
    {
        type: Date,
        default: Date.now(),
        get: (date) => {return "FORMATTED DATE";} /// XXXXXXXXXXXXXXXXXXXX

    }

})

// Sync the database
// XXXXXXXXXXXXXXXXXXXXX


// List the routes

// /api/users
// GET all users
app.get('/api/users', (req,res) => {
    // XXXXXXX
});

// GET a single user by its _id and populated thought and friend data
app.get('/api/users/:id', (req,res) => {
    // XXXXXXXXXX
});

// POST a new user:
app.post('/api/users/', (req,res) => {
//XXXXXXXXXXX
});

// PUT to update a user by its _id
app.put('/api/users/:id', (req,res) => {
    // XXXXXXXXXX
});

// DELETE to remove user by its _id
app.delete('/api/users/:id', (req,res) => {
    // XXXXXXXXXX
});


// /api/users/:userId/friends/:friendId
// POST to add a new friend to a user's friend list
app.post('/api/users/:userId/friends/:friendId', (req,res) => {
  //XXXXXXXXXXX
});

// DELETE to remove a friend from a user's friend list
app.delete('/api/users/:userId/friends/:friendId', (req,res) => {
  //XXXXXXXXXXX
});


// /api/thoughts
// GET to get all thoughts
app.get('/api/thoughts', (req,res) => {
  // XXXXXXX
});

// GET to get a single thought by its _id
app.get('/api/thoughts/:id', (req,res) => {
  // XXXXXXXXXX
});

// POST to create a new thought 
// (don't forget to push the created thought's _id to the associated user's thoughts array field)
app.post('/api/thoughts', (req,res) => {
  //XXXXXXXXXXX
  });

// PUT to update a thought by its _id
app.put('/api/thoughts/:id', (req,res) => {
  // XXXXXXXXXX
});

// DELETE to remove a thought by its _id
app.delete('/api/thoughts/:id', (req,res) => {
  // XXXXXXXXXX
});


// /api/thoughts/:thoughtId/reactions
// POST to create a reaction stored in a single thought's reactions array field
app.post('/api/thoughts/:thoughtId/reactions', (req,res) => {
  //XXXXXXXXXXX
  });

// DELETE to pull and remove a reaction by the reaction's reactionId value

app.delete('/api/thoughts/:thoughtId/reactions', (req,res) => {
  // XXXXXXXXXX
});




// Start the server
app.listen(3000, () => {
    console.log("Listen on the port 3000...");
});


// GIVEN a social network API
// WHEN I enter the command to invoke the application
// THEN my server is started and the Mongoose models are synced to the MongoDB database
// WHEN I open API GET routes in Insomnia for users and thoughts
// THEN the data for each of these routes is displayed in a formatted JSON
// WHEN I test API POST, PUT, and DELETE routes in Insomnia
// THEN I am able to successfully create, update, and delete users and thoughts in my database
// WHEN I test API POST and DELETE routes in Insomnia
// THEN I am able to successfully create and delete reactions to thoughts and add and remove friends to a user’s friend list


