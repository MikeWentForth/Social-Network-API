// Perform needed imports/includes
const express = require('express')
const mongoose = require("mongoose");

const app = express();
app.use(require('body-parser').urlencoded({ extended: false }));
app.use(express.json());

// Mongoose configuration
mongoose.set("strictQuery", false);
// Define the database URL to connect to. XXXXXXXXXXXXXXXXXXX
const connectionString =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Social-Network-API';

// Wait for database to connect, logging an error if there is a problem
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
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
  },{
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


// Reaction (SCHEMA ONLY)
// This will not be a model, but rather will be used as the reaction field's subdocument schema in the Thought model.
const reactionSchema = new mongoose.Schema ({

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

});


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
      // Array of nested documents created with the reactionSchema  XXXXXXXX
      [reactionSchema]
  },{

    // Create a virtual called reactionCount that retrieves the length of the thought's reactions array field on query.
    //  XXXXXXXXXX
    virtuals: {
      reactionCount: {
          get() {return this.reactions.length;}
      }
    }
});
// Generate model
const Thought = mongoose.model('Thought', thoughtSchema);



// Sync the database?
// XXXXXXXXXXXXXXXXXXXXX


// List the routes

// /api/users
// GET all users
app.get('/api/users', async (req,res) => {
    let db_results = await User.find({});// find all user records
    //res.json("hello from the cluster of love")
    res.json(db_results);
});

// GET a single user by its _id and populated thought and friend data
app.get('/api/users/:id', async (req,res) => {
    // XXXXXXXXXX Add error handling
    let id = req.params.id;
    // await Adventure.findById(id).exec();
    let db_results = await User.findById(id).exec();
    res.json(db_results);
});

// POST a new user:
app.post('/api/users/', async (req,res) => {
  // Receive the data from the post request.
  let username = req.body.username.trim();
  let email = req.body.email.trim();

  // Validate data
  if (username.length == 0) res.json("Username required.")
  if (email.length == 0) res.json("Email required.")

  // Create the record
  await User.create({username: username, email:email});
  res.json("User created.");
});

// PUT to update a user by its _id
app.put('/api/users/:id', async (req,res) => {
    // XXXXXXXXXX add error handling
    let id = req.params.id; // get id from GET query
    let username = req.body.username.trim(); // get username from body
    let email = req.body.email.trim(); // get email from body

    let new_obj = {};
    if (username.length > 0) new_obj["username"] = username;
    if (email.length > 0) new_obj["email"] = email;

    // Perform update
    let db_results = await User.findByIdAndUpdate(id,new_obj);
    res.json("User updated.")
});

// DELETE to remove user by its _id
app.delete('/api/users/:id/', async (req,res) => {
    // XXXXXXXXXX add error handling
    let id = req.params.id; // get id from GET query
  
    // Perform delete
    let db_results = await User.findByIdAndDelete(id);
    res.json("User deleted.")
    
});




// /api/users/:userId/friends/:friendId
// POST to add a new friend to a user's friend list
app.post('/api/users/:userId/friends/:friendId', async (req,res) => {

  // Read the friends ids array from the user's record
  let userId = req.params.userId;
  let db_results = await User.findById(userId).exec();
  let friendsIdArr = db_results.friends;

  // Add the new friend id to the array
  friendsIdArr.push(req.params.friendId);
  let newObj = {"friends":friendsIdArr};

  // Update the user record with the new array
  db_results = await User.findByIdAndUpdate(userId,newObj);
  res.json("Friend added.")
});

// DELETE to remove a friend from a user's friend list
app.delete('/api/users/:userId/friends/:friendId', async (req,res) => {
    // Read the friends ids array from the user's record
    let userId = req.params.userId;
    let db_results = await User.findById(userId).exec();
    let friendsIdArr = db_results.friends;
  
    // Remove the friend from the array
    let newFriendsArr = friendsIdArr.filter(id => String(id) !== req.params.friendId);
    let newObj = {"friends":newFriendsArr};
  
    // Update the user record with the new array
    db_results = await User.findByIdAndUpdate(userId,newObj);
    res.json("Friend removed.")
  
});


// /api/thoughts
// GET to get all thoughts
app.get('/api/thoughts', async (req,res) => {
  // XXXXXXX
  let db_results = await Thought.find({});// find all user records
  res.json(db_results);
});

// GET to get a single thought by its _id
app.get('/api/thoughts/:id', async (req,res) => {
  // XXXXXXXXXX
  let id = req.params.id;
  // await Adventure.findById(id).exec();
  let db_results = await Thought.findById(id).exec();
  res.json(db_results);

});

// POST to create a new thought 
// (don't forget to push the created thought's _id to the associated user's thoughts array field)
app.post('/api/thoughts', async (req,res) => {
  let username = req.body.username.trim();
  let thoughtText = req.body.thoughtText.trim();
  // Validate data
  if (username.length == 0) res.json("Username required.")
  if (thoughtText.length == 0) res.json("Thought text required.")
  // Need to check whether a corresponding user exists (look for username) XXXXXX

  // If the user does not exist, stop.  XXXXXXX

  // Create the record
  await Thought.create({username: username, thoughtText:thoughtText});

  // Add the thought ID to the user's thought array XXXXXX
  res.json("Thought recorded in the DB.");
  });

// PUT to update a thought by its _id
app.put('/api/thoughts/:id', async (req,res) => {
  // XXXXXXXXXX
  let id = req.params.id; // get id from GET query
    let username = req.body.username.trim(); // get username from body
    let thoughtText = req.body.thoughtText.trim(); // get email from body
    // Make sure new username exists XXXXXX
    // If not, stop. XXXXXX
    // If username has changed, remove thought id from old user and add it to the new user XXXXXX
    let new_obj = {};
    if (username.length > 0) new_obj["username"] = username;
    if (thoughtText.length > 0) new_obj["thoughtText"] = thoughtText;
    // Perform update
    let db_results = await Thought.findByIdAndUpdate(id,new_obj);
    res.json("Thought updated.")
});



// /api/thoughts/:thoughtId/reactions
// POST to create a reaction stored in a single thought's reactions array field
app.post('/api/thoughts/:thoughtId/reactions', async (req,res) => {

  // Create a new reaction from the posted information.

  // Receive the data from the post request.
  let reactionBody = req.body.reactionBody.trim();
  let username = req.body.username.trim();

  // Don't actually create a standalone reaction record in a reaction table,
  // but a reaction record/document that gets stored in the array in Thoughts
  // According to Mongoose docs, create and push the reaction doc at the same time...
  // Create the reaction object
  let newReaction = {"username": username, "reactionBody": reactionBody};
  // Connect to the thought record
  let thought = await Thought.findById(req.params.thoughtId).exec();
  console.log(thought);
  // Push the new reaction onto the thought record
  await thought.reactions.push(newReaction);
  // Save the changes in the parent
  await thought.save();

  // Send response to client
  res.json("Reaction added.");

});

// DELETE to pull and remove a reaction by the reaction's reactionId value

app.delete('/api/thoughts/:thoughtId/reactions', async (req,res) => {
  let reactionId = req.body.reactionId;
  let thoughtId = req.params.thoughtId;
  // Find the thought
  let thought = await Thought.findById(req.params.thoughtId).exec();
  // Loop through all reaction documents and find one with a matching reactionId.
  let _id = null;
  for (let r of thought.reactions) {
    // Get the _id of that reaction.
    if (r.reactionId == reactionId) _id = r._id;
  }

  if (_id == null) {
    res.json("No matching reaction found.");
  } else {
    // Delete that using the built-in process...
    await thought.reactions.id(_id).deleteOne();
    // Save the changes
    await thought.save();
    res.json("Reaction deleted....");
  }

});


// Moved here because the system was deleting the entire thought when we
// were just trying to remove a reaction
// DELETE to remove a thought by its _id
app.delete('/api/thoughts/:id', async (req,res) => {
  let id = req.params.id; // get id from GET query
  // Perform delete
  // Also remove thought id from user thoughts array XXXXXXXX
  let db_results = await Thought.findByIdAndDelete(id);
  res.json("Thought deleted.")
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


// Deliverables: 10%
// Your GitHub repository containing your application code.
// DONE//

// Walkthrough Video: 37%
// A walkthrough video that demonstrates the functionality of the social media API must be submitted, and a link to the video should be included in your README file.

// The walkthrough video must show all of the technical acceptance criteria being met.

// The walkthrough video must demonstrate how to start the application’s server.

// The walkthrough video must demonstrate GET routes for all users and all thoughts being tested in Insomnia.
//DONE//

// The walkthrough video must demonstrate GET routes for a single user and a single thought being tested in Insomnia.

// The walkthrough video must demonstrate POST, PUT, and DELETE routes for users and thoughts being tested in Insomnia.

// Walkthrough video must demonstrate POST and DELETE routes for a user’s friend list being tested in Insomnia.

// Walkthrough video must demonstrate POST and DELETE routes for reactions to thoughts being tested in Insomnia.



// Technical Acceptance Criteria: 40%
// Satisfies all of the preceding acceptance criteria plus the following:

// Uses the Mongoose packageLinks to an external site. to connect to a MongoDB database. DONE//

// Includes User and Thought models outlined in the Challenge instructions.
//DONE//


// Includes schema settings for User and Thought models as outlined in the Challenge instructions.
//DONE//

// Includes Reactions as the reaction field's subdocument schema in the Thought model.
//DONE//

// Uses functionality to format queried timestamps properly.

// Repository Quality: 13%
// Repository has a unique name.
//DONE//

// Repository follows best practices for file structure and naming conventions.
//DONE//

// Repository follows best practices for class/id naming conventions, indentation, quality comments, etc.
//DONE//

// Repository contains multiple descriptive commit messages.
//DONE//

// Repository contains a high-quality README with description and a link to a walkthrough video.


