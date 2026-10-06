import User from "../models/User.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import { slugify } from "../services/postService.js";

export const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log("[Seed] Database already contains users. Skipping initial seed.");
      return;
    }

    console.log("[Seed] Seeding database with initial users and blog posts...");

    // 1. Create Admin User
    const adminUser = new User({
      name: "Admin User",
      email: "admin@blog.com",
      password: "password123",
      role: "admin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80",
      bio: "Chief Editor and Administrator of the platform.",
      isActive: true,
    });
    await adminUser.save();

    // 2. Create Regular User
    const regularUser = new User({
      name: "Jane Doe",
      email: "jane@blog.com",
      password: "password123",
      role: "user",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80",
      bio: "Tech enthusiast, passionate writer, and full-stack developer.",
      isActive: true,
    });
    await regularUser.save();

    // 3. Create Sample Posts
    const samplePosts = [
      {
        title: "Building Modern Web Applications with MERN Stack",
        content: `The MERN stack (MongoDB, Express, React, Node.js) remains one of the most versatile and battle-tested architectures for modern full-stack web applications. 

### Why Choose MERN?
1. **Single Language Across the Stack**: With JavaScript running on both the browser and server, context-switching is minimized.
2. **Document-Oriented Database**: MongoDB's JSON-like document structure maps naturally to JavaScript objects.
3. **High Performance**: Node.js and Express provide asynchronous, non-blocking I/O capable of handling heavy concurrent traffic.
4. **Rich Component Ecosystem**: React's declarative nature and vast ecosystem enable building interactive, responsive user interfaces.

### Core Architecture
A clean architectural pattern separates concerns into clear layers: Controllers handle HTTP requests, Services execute business logic, Models define database schemas, and Middleware enforces authentication, rate limiting, and RBAC.`,
        excerpt: "Discover why the MERN stack is the top choice for modern web apps, from single-language advantages to clean tiered architecture.",
        author: adminUser._id,
        category: "Technology",
        tags: ["MERN", "React", "NodeJS", "MongoDB"],
        coverImage: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=1200&h=600&q=80",
        status: "published",
        views: 124,
      },
      {
        title: "Role-Based Access Control (RBAC) in Node.js & Express",
        content: `Securing an API requires more than simple authentication; you must ensure users only access what their permission level allows.

### Authentication vs Authorization
- **Authentication**: Verifies *who* the user is (e.g. JWT tokens).
- **Authorization**: Determines *what* the user is allowed to do.

### Implementing Middleware
In Express, RBAC middleware checks \`req.user.role\` against allowed permissions before invoking the route handler. If the role doesn't match, return \`403 Forbidden\` immediately to guard backend data integrity.`,
        excerpt: "Learn how to enforce Role-Based Access Control (RBAC) at the API level with reusable Express middleware.",
        author: regularUser._id,
        category: "Security",
        tags: ["Security", "JWT", "Express", "NodeJS"],
        coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&h=600&q=80",
        status: "published",
        views: 89,
      },
      {
        title: "Mastering Real-Time Notifications with Socket.io",
        content: `Real-time notifications keep users engaged and informed without requiring manual page refreshes.

### How WebSockets Work
Unlike traditional HTTP request-response cycles, WebSockets establish a persistent, bidirectional TCP connection between the client and server.

### Events in a Blog Platform
- Publishing a new post emits a \`new_post\` event to all active readers.
- Submitting a comment alerts the post author in real-time.
- Admin dashboard metrics update smoothly as community actions occur.`,
        excerpt: "Explore bidirectional real-time communications using Socket.io for instant blog post updates and comment alerts.",
        author: adminUser._id,
        category: "Architecture",
        tags: ["SocketIO", "RealTime", "WebSockets"],
        coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&h=600&q=80",
        status: "published",
        views: 215,
      },
    ];

    for (const postData of samplePosts) {
      const slug = slugify(postData.title);
      const post = new Post({ ...postData, slug });
      await post.save();

      // Add a comment to each post
      const comment = new Comment({
        post: post._id,
        author: regularUser._id,
        content: "Outstanding writeup! The architectural breakdown and security patterns are exceptionally well explained.",
      });
      await comment.save();
    }

    console.log("[Seed] Database successfully seeded with admin (admin@blog.com) and test user (jane@blog.com)!");
  } catch (error) {
    console.error("[Seed] Error seeding database:", error.message);
  }
};
