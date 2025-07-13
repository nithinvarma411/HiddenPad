const attachDeviceId = async (req, res, next) => {
    try {
        const deviceId = req.headers['x-device-id'];

        if (!deviceId) {
            return res.status(401).send({"message": "DeviceId missing"});
        }

        req.user = {deviceId};
        next();
    } catch (error) {
        console.error("error assigning deviceId", error);
        return res.status(500).send({"message": "Internal Server Error"});
    }
}

export {attachDeviceId};