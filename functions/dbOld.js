const sqlite3 = require('sqlite3').verbose();
const crypto = require('node:crypto');

const db = new sqlite3.Database('./dev.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            phoneNumber TEXT PRIMARY KEY,
            idNumber TEXT NOT NULL,
            firstName TEXT NOT NULL,
            lastName TEXT NOT NULL,
            gender TEXT NOT NULL,
            town TEXT NOT NULL,
            token TEXT NOT NULL
        )
    `, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Users table created.');
        }
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS buses (
        busNumber INTEGER PRIMARY KEY AUTOINCREMENT, 
        town TEXT NOT NULL,
        name TEXT NOT NULL,
        phoneNumber TEXT NOT NULL,
        maxPassengers INTEGER NOT NULL,
        passengers INTEGER NOT NULL DEFAULT 0
        )
    `, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Buses table created.');
        }
    });
});







module.exports.getBuses = function getBuses(town) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT * FROM buses
            WHERE town = ?
        `;

        db.all(query, [town], (err, rows) => {
            if (err) {
                console.error('Error fetching buses:', err.message);
                reject(err); // Reject the Promise if there's an error
            } else {
                resolve(rows); // Resolve the Promise with the result rows
            }
        });
    });
};



module.exports.createBus = function createBus(bus) {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO Buses (town, name, phoneNumber, maxPassengers, passengers)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.run(query, [bus.town, bus.name, bus.phoneNumber, bus.maxPassengers, bus.passengers], function (err) {
            if (err) {
                console.error('Error creating user:', err.errno);
                reject(err); 
            } else {
                console.log(`User with name ${bus.name} created.`);
                resolve(true); 
            }
        });
    });
};





module.exports.createUser = function createUser(user) {
    return new Promise((resolve, reject) => {
        const token = crypto.randomBytes(16).toString('hex'); 
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const query = `
            INSERT INTO users (phoneNumber, idNumber, firstName, lastName, gender, town, token)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(query, [user.phoneNumber, user.idNumber, user.firstName, user.lastName, user.gender, user.town, hashedToken], function (err) {
            if (err) {
                console.error('Error creating user:', err.errno);
                reject(err); // Reject the Promise if there's an error
            } else {
                console.log(`User with phoneNumber ${user.phoneNumber} created.`);
                resolve(token); // Resolve the Promise with the token
            }
        });
    });
};

module.exports.getUserByPhoneNumber = function getUserByPhoneNumber(phoneNumber) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT * FROM users
            WHERE phoneNumber = ?
        `;
        db.get(query, [phoneNumber], (err, row) => {
            if (err) {
                console.error('Error retrieving user:', err.errno);
                reject(false); // Reject the promise if there's an error
            } else if (row) {
                resolve(row); // Resolve with the user data
            } else {
                resolve("noAccount"); // Resolve with "noAccount" if no user is found
            }
        });
    });
};


// this.createBus({town:'tamra',name:"aboNimer",phoneNumber:"0543210",maxPassengers:55,passengers:14})


// Close the database gracefully
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});


