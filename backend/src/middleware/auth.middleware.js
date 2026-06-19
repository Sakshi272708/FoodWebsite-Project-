
const jwt = require("jsonwebtoken");
const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ message: "No token, access denied" });
        }

        // token format: Bearer xyz
        const actualToken = token.split(" ")[1];
        console.log("AUTH HEADER:", req.headers.authorization);
        const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
        req.user = decoded;

        next();

    } catch (error) {
         console.log("JWT ERROR:", error.message);
        return res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = authMiddleware