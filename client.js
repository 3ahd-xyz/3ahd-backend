const venom = require('venom-bot');

module.exports = async () => {
    try {
        const client = await venom.create({
            session: 'WAB',  // Set the session name
            browserArgs: ['--headless=new'], // Use the new headless mode
              
        });

        return client;  // Return the client instance
    } catch (error) {
        console.error('Error creating Venom Bot client:', error);
        throw error;  // Throw error if client creation fails
    }
};


