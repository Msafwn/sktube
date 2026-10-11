/**
 * Async operations ko try-catch ke baghair handle karne ke liye wrapper function
 * Jo bhi error aayega yeh automatically Express ke next(err) middleware ko bhej dega
 * Sath hi client disconnection / abort ko track karta hai taake zombie writes na hon
 */
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        let isClientDisconnected = false;

        req.on("close", () => {
            if (!res.writableEnded) {
                isClientDisconnected = true;
            }
        });

        req.isClientDisconnected = () => isClientDisconnected || req.destroyed || res.writableEnded;

        Promise.resolve(requestHandler(req, res, next)).catch((err) => {
            // Agar client pehle hi disconnect ho chuka ho, to broken pipe / unhandled write error suppress karein
            if (isClientDisconnected || res.writableEnded) {
                return;
            }
            next(err);
        });
    };
};

export { asyncHandler };
