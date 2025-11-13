const { database, remove, ref } = require("../../config/firebaseconfig.js");

async function deletePost(req, res) {
  try {
    const { uid } = req.user; // From JWT token
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({ error: "Post ID is required" });
    }

    const postRef = `Users/${uid}/posts/${postId}`;
    
    // Delete the post
    await remove(ref(database, postRef));

    res.status(200).json({
      message: "Post deleted successfully",
      postId: postId
    });

  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { deletePost };

