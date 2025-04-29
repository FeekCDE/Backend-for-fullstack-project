const jwt = require("jsonwebtoken");

const verifyUser = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"]; // Ensure correct casing


        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
        }

        const token = authHeader.split(" ")[1]; // Extract token
        const user = jwt.verify(token, process.env.JWT_SECRET); // Verify token

        req.user = user; // Attach user data to request
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

module.exports = { verifyUser };
