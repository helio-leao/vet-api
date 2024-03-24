import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';



function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (error, user) => {
        if(error) return res.sendStatus(403);
        
        req.user = user;
        next();
    });
}

export default authenticateToken;