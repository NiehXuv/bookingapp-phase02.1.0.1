const { database, get, ref } = require("../../config/firebaseconfig.js");

async function getAllPosts(req, res) {
  try {
    const { uid } = req.user; // From JWT token

    const postsRef = `Users/${uid}/posts`;
    const snapshot = await get(ref(database, postsRef));

    if (!snapshot.exists()) {
      return res.status(200).json({
        message: "No posts found",
        posts: []
      });
    }

    let posts = [];
    snapshot.forEach((childSnapshot) => {
      const postId = childSnapshot.key;
      const postData = childSnapshot.val();
      
      posts.push({
        postId: postId,
        ...postData
      });
    });

    // Sort posts by createdAt (newest first)
    posts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    res.status(200).json({
      message: "Posts retrieved successfully",
      posts: posts,
      count: posts.length
    });

  } catch (error) {
    console.error("Error getting posts:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { getAllPosts };

