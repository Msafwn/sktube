/**
 * Async operations ko try-catch ke baghair handle karne ke liye wrapper function
 * Jo bhi error aayega yeh automatically Express ke next(err) middleware ko bhej dega
 */
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
};

export { asyncHandler };
