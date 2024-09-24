require('dotenv').config();
require('./database');
const express = require('express');
const bodyParser = require('body-parser');
const User = require('./models/User');
const CryptoJS = require('crypto-js');
const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.post('/', (req, res) => {
    res.send(process.env.APP_VERSION);
})

// Create
app.post('/register', async (req, res) => {
    const user = new User(req.body);
    user.password = await user.encryptPassword(user.password);
    user.save()
        .then(() => res.json({ status: true }))
        .catch(error => res.json({ status: false, message: error }));
});

// Read
app.get('/users', (req, res) => {
    let userList = [];
    User.find().then(users => {
        users.forEach(element => {
            const userSimple = {
                id: element._id,
                name: element.name,
                email: element.email
            }
            userList.push(userSimple);
        });
        res.send(userList);
    }).catch(err => {
        res.status(500).send(err);
    });
});

// Read by ID
app.get('/users/:id', (req, res) => {
    User.findById(req.params.id).then(user => {
        if (!user) {
            res.status(404).send({ message: 'User not found' });
        } else {
            const userSimple = {
                id: user._id,
                name: user.name,
                email: user.email
            }
            res.send(userSimple);
        }
    }).catch(err => {
        res.status(500).send(err);
    });
});

// Update
app.put('/users/:id', async (req, res) => {
    const encrypt = new User();
    const user = req.body;
    user.password = await encrypt.encryptPassword(user.password);
    User.updateOne({ _id: req.params.id }, { $set: user })
        .then(data => {
            data.status = true;
            res.json(data)
        })
        .catch(error => res.json({ status: false, message: error }));
});

// Delete
app.delete('/users/:id', (req, res) => {
    User.deleteOne({ _id: req.params.id })
        .then(data => {
            data.status = true;
            res.json(data)
        })
        .catch(error => res.json({ status: false, message: error }));
});

// Login
app.post('/login', (req, res) => {
    const encrypt = new User();
    const body = req.body;
    let credentials = CryptoJS.AES.decrypt(body.user, process.env.KEY).toString(CryptoJS.enc.Utf8);
    credentials = JSON.parse(credentials);
    User.find().then(users => {
        let count = 1;
        users.forEach(async element => {
            if (element.email == credentials.email) {
                await encrypt.matchPassword(credentials.password, element.password).then(result => {
                    if (result) {
                        res.send({ status: true });
                    } else {
                        res.send({ status: false, message: 'password incorrect' });
                    }
                });
            } else if (count == users.length) {
                res.send({ status: false, message: 'email incorrect' });
            }
            count++;
        });
    }).catch(err => {
        res.status(500).send(err);
    });
});

const port = process.env.APP_PORT || 9000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});