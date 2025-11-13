const { database, ref, set, push } = require("../../config/firebaseconfig.js");

async function createPost(req, res) {
  try {
    const { uid } = req.user; // From JWT token
    const {
      content,
      imageUrl,
      location
    } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Post content is required" });
    }

    const postData = {
      content: content.trim(),
      imageUrl: imageUrl || "",
      location: location || "",
      likes: 0,
      comments: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Create new post with auto-generated ID
    const postsRef = `Users/${uid}/posts`;
    const newPostRef = push(ref(database, postsRef));
    const postId = newPostRef.key;

    await set(ref(database, `Users/${uid}/posts/${postId}`), postData);

    res.status(201).json({
      message: "Post created successfully",
      postId: postId,
      post: {
        postId: postId,
        ...postData
      }
    });

  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { createPost };

