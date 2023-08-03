const messages = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    };
};

const messageLocation = (username, url) => {
    return {
        username,
        url,
        createdAt: new Date().getTime()
    };
};

module.exports = {
    messages,
    messageLocation
};