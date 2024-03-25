import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';


function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) return res.sendStatus(401);

    try {
        const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
        req.user = user;
        next();
    } catch {
        return res.sendStatus(403);
    }
}

export default authenticateToken;