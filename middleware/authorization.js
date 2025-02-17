import jwt from 'jsonwebtoken';

export const authorization = (req, res, next) => {
    try {
       
        if (!req.headers.authorization) {
            return res.status(401).json({ message: "User is not logged in" });
        }

       
        const token = req.headers.authorization.split(" ")[1];

        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ message: "Invalid User token" });
        }

        
        req.user = decoded;
        next(); 

    } catch (err) {
        console.error(err);
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};
