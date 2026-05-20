// import type { Request,Response,NextFunction } from "express";

class GlobalError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res,next) => {
    console.error("Global Error Handler:", err);
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    return res.status(statusCode).json({ 
        status:statusCode,
        message
     });
}

export { GlobalError, errorHandler };