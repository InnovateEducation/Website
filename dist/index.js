// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  courses;
  userCurrentId;
  courseCurrentId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.courses = /* @__PURE__ */ new Map();
    this.userCurrentId = 1;
    this.courseCurrentId = 1;
    this.initCourses();
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.userCurrentId++;
    const user = { ...insertUser, id, createdAt: (/* @__PURE__ */ new Date()).toISOString() };
    this.users.set(id, user);
    return user;
  }
  async getCourses() {
    return Array.from(this.courses.values());
  }
  async getCoursesByLevel(level) {
    if (level === "all") {
      return this.getCourses();
    }
    return Array.from(this.courses.values()).filter(
      (course) => course.level.toLowerCase() === level.toLowerCase()
    );
  }
  async getCourse(id) {
    return this.courses.get(id);
  }
  async createCourse(insertCourse) {
    const id = this.courseCurrentId++;
    const course = { ...insertCourse, id };
    this.courses.set(id, course);
    return course;
  }
  initCourses() {
    const mockCourses = [
      /*{
        title: 'Digital Literacy Fundamentals',
        description: 'Master the essential skills needed to navigate the digital world confidently and safely.',
        level: 'Beginner',
        price: 49,
        instructor: 'Sarah Johnson',
        rating: 48, // 4.8 out of 5
        imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0',
        duration: '4 weeks',
        bullets: ['Internet safety basics', 'Digital communication skills', 'Finding reliable information online', 'Managing digital identity'],
        category: 'digital-literacy',
      },*/
      {
        title: "CyberSmart Kids",
        description: "Learn how to protect yourself and your data from cyber threats in this comprehensive course.",
        level: "Beginner",
        price: 79,
        //instructor: "Michael",
        rating: 49,
        // 4.9 out of 5
        imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
        duration: "6 weeks",
        bullets: ["Threat identification", "Password management", "Safe browsing habits", "Data protection strategies"],
        category: "cybersecurity",
        detailedDescription: "Hola~"
      }
      /*,
      {
        title: 'Web Development Bootcamp',
        description: 'From HTML basics to full-stack applications - become a web developer in 12 weeks.',
        level: 'Advanced',
        price: 129,
        instructor: 'Emily Rodriguez',
        rating: 47, // 4.7 out of 5
        imageUrl: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5',
        duration: '12 weeks',
        bullets: ['HTML, CSS, JavaScript fundamentals', 'Responsive design principles', 'Backend development with Node.js', 'Database integration'],
        category: 'web-development',
      },
      {
        title: 'Social Media Marketing',
        description: 'Learn to build and manage effective social media campaigns for business growth.',
        level: 'Intermediate',
        price: 69,
        instructor: 'David Wilson',
        rating: 46, // 4.6 out of 5
        imageUrl: 'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4',
        duration: '8 weeks',
        bullets: ['Platform-specific strategies', 'Content creation', 'Analytics and reporting', 'Paid advertising techniques'],
        category: 'marketing',
      },
      {
        title: 'Data Analytics Fundamentals',
        description: 'Introduction to analyzing and interpreting data for making informed decisions.',
        level: 'Beginner',
        price: 59,
        instructor: 'Priya Sharma',
        rating: 48, // 4.8 out of 5
        imageUrl: 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1',
        duration: '5 weeks',
        bullets: ['Data collection methods', 'Basic statistical concepts', 'Data visualization techniques', 'Introduction to data tools'],
        category: 'data-analytics',
      },
      {
        title: 'Mobile App Development',
        description: 'Build cross-platform mobile applications using React Native and modern JavaScript.',
        level: 'Advanced',
        price: 149,
        instructor: 'Alex Thompson',
        rating: 49, // 4.9 out of 5
        imageUrl: 'https://images.unsplash.com/photo-1603575448878-868a20723f5d',
        duration: '10 weeks',
        bullets: ['React Native fundamentals', 'Cross-platform development', 'State management', 'Deployment strategies'],
        category: 'mobile-development',
      }*/
    ];
    mockCourses.forEach((course) => {
      this.createCourse(course);
    });
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  createdAt: text("created_at").notNull().default("now()")
});
var courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  level: text("level").notNull(),
  // beginner, intermediate, advanced
  price: integer("price").notNull(),
  instructor: text("instructor").notNull(),
  rating: integer("rating"),
  imageUrl: text("image_url").notNull(),
  duration: text("duration").notNull(),
  bullets: text("bullets").array(),
  category: text("category").notNull(),
  detailedDescription: text("detailedDescription").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true
});
var insertCourseSchema = createInsertSchema(courses);

// server/routes.ts
import { fromZodError } from "zod-validation-error";
async function registerRoutes(app2) {
  app2.get("/api/courses", async (req, res) => {
    try {
      const { level } = req.query;
      if (level && typeof level === "string") {
        const courses2 = await storage.getCoursesByLevel(level);
        return res.json(courses2);
      } else {
        const courses2 = await storage.getCourses();
        return res.json(courses2);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      return res.status(500).json({ message: "Failed to fetch courses" });
    }
  });
  app2.get("/api/courses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      const course = await storage.getCourse(id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      return res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      return res.status(500).json({ message: "Failed to fetch course" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      return res.json({
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName
        }
      });
    } catch (error) {
      console.error("Error during login:", error);
      return res.status(500).json({ message: "Login failed" });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      const { username, email } = result.data;
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = await storage.createUser(result.data);
      return res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName
        }
      });
    } catch (error) {
      console.error("Error registering user:", error);
      return res.status(500).json({ message: "Registration failed" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
