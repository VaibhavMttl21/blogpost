"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const COOKIE_NAME = 'blogcraft_auth';
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
// Middleware
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Add specific handling for OPTIONS requests (preflight)
app.options('*', (0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Middleware to verify JWT token from cookies or Authorization header
const authenticateJwt = (req, res, next) => {
    // Check for token in cookies first
    let token = req.cookies[COOKIE_NAME];
    // If not in cookies, check Authorization header
    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7); // Remove 'Bearer ' prefix
        }
    }
    if (token) {
        jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Invalid or expired token" });
            }
            req.user = { id: decoded.id, email: decoded.email };
            next();
        });
    }
    else {
        res.status(401).json({ message: "Authentication required" });
    }
};
// Test database connection
function testDbConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield prisma.$connect();
            console.log('Successfully connected to the database');
        }
        catch (error) {
            console.error('Failed to connect to the database:', error);
            process.exit(1);
        }
    });
}
// Signup endpoint
app.post('/api/auth/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = yield prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '3d' });
        // Set cookie with the token - modified settings
        res.cookie(COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // Changed from 'strict' to 'lax' to allow cross-site requests
            maxAge: THREE_DAYS_MS,
            path: '/'
        });
        // Also return the token in the response for clients using localStorage
        res.json({ message: 'User created successfully', token });
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: 'Server error', error: String(error) });
    }
}));
// Login endpoint
app.post('/api/auth/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const user = yield prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '3d' });
        // Set cookie with the token - modified settings
        res.cookie(COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // Changed from 'strict' to 'lax' to allow cross-site requests
            maxAge: THREE_DAYS_MS,
            path: '/'
        });
        // Return the token explicitly in the response for clients using localStorage
        return res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            token: token, // Ensure token is named consistently and included
            user: {
                id: user.id,
                email: user.email
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: String(error) });
    }
}));
// Add logout endpoint
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    });
    res.json({ message: 'Logged out successfully' });
});
// Save/update draft
app.post('/api/blogs/save-draft', authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, title, content, tags } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        const blog = yield prisma.blog.upsert({
            where: { id: id || '' },
            update: { title, content, tags },
            create: { title, content, tags: tags || '', status: 'DRAFT' }
        });
        res.json(blog);
    }
    catch (error) {
        console.error('Error in save-draft:', error);
        res.status(500).json({ error: 'Failed to save draft', details: String(error) });
    }
}));
// Publish blog
app.post('/api/blogs/publish', authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, title, content, tags } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        const blog = yield prisma.blog.upsert({
            where: { id: id || '' },
            update: { title, content, tags, status: 'PUBLISHED' },
            create: { title, content, tags: tags || '', status: 'PUBLISHED' }
        });
        res.json(blog);
    }
    catch (error) {
        console.error('Error in publish:', error);
        res.status(500).json({ error: 'Failed to publish blog', details: String(error) });
    }
}));
// Get all blogs
app.get('/api/blogs', authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blogs = yield prisma.blog.findMany({
            orderBy: { updatedAt: 'desc' }
        });
        res.json(blogs);
    }
    catch (error) {
        console.error('Error in get blogs:', error);
        res.status(500).json({ error: 'Failed to fetch blogs', details: String(error) });
    }
}));
// Get blog by id
app.get('/api/blogs/:id', authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blog = yield prisma.blog.findUnique({
            where: { id: req.params.id }
        });
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.json(blog);
    }
    catch (error) {
        console.error('Error in get blog by ID:', error);
        res.status(500).json({ error: 'Failed to fetch blog', details: String(error) });
    }
}));
// Delete blog by id
app.delete('/api/blogs/:id', authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if blog exists first
        const blog = yield prisma.blog.findUnique({
            where: { id: req.params.id }
        });
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        // Delete the blog
        yield prisma.blog.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Blog deleted successfully' });
    }
    catch (error) {
        console.error('Error in delete blog:', error);
        res.status(500).json({ error: 'Failed to delete blog', details: String(error) });
    }
}));
// Run database connection test before starting the server
testDbConnection()
    .then(() => {
    // Log the CORS configuration for debugging
    console.log(`CORS configured for origin: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    app.listen(5000, '0.0.0.0', () => {
        console.log('Server running on port 5000');
    });
})
    .catch(error => {
    console.error('Failed to start server:', error);
});
