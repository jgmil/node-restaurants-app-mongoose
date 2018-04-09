'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const {
    PORT,
    DATABASE_URL
} = require('./config');
const {
    Restaurant
} = require('./models');

const app = express();
app.use(bodyParser.json());

app.get('/blog-posts', (req, res) => {
    BlogPosts
        .find()
        .then(blogposts => {
            res.json({
                blogposts: blogposts.map(
                    (blogpost) => blogpost.serialize())
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: 'Internal server error'
            });
        });
});

// can also request by ID
app.get('/blog-posts/:id', (req, res) => {
    BlogPosts
        // this is a convenience method Mongoose provides for searching
        // by the object _id property
        .findById(req.params.id)
        .then(blogpost => res.json(restaurant.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: 'Internal server error'
            });
        });
});


app.post('/blog-posts', (req, res) => {

    const requiredFields = ['title', 'author', 'content'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    BlogPosts
        .create({
            title: req.body.title,
            auhtor: req.body.author,
            content: req.body.content,
            //date: req.body.date,
        })
        .then(blogpost => res.status(201).json(blogpost.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: 'Internal server error'
            });
        });
});


app.put('/blog-posts/:id', (req, res) => {
    // ensure that the id in the request path and the one in request body match
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = (
            `Request path id (${req.params.id}) and request body id ` +
            `(${req.body.id}) must match`);
        console.error(message);
        return res.status(400).json({
            message: message
        });
    }

    // we only support a subset of fields being updateable.
    // if the user sent over any of the updatableFields, we udpate those values
    // in document
    const toUpdate = {};
    const updateableFields = ['title', 'author', 'content', 'date'];

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    BlogPosts
        // all key/value pairs in toUpdate will be updated -- that's what `$set` does
        .findByIdAndUpdate(req.params.id, {
            $set: toUpdate
        })
        .then(blogpopst => res.status(204).end())
        .catch(err => res.status(500).json({
            message: 'Internal server error'
        }));
});

app.delete('/blog-posts/:id', (req, res) => {
    BlogPosts
        .findByIdAndRemove(req.params.id)
        .then(blogpost => res.status(204).end())
        .catch(err => res.status(500).json({
            message: 'Internal server error'
        }));
});

// catch-all endpoint if client makes request to non-existent endpoint
app.use('*', function (req, res) {
    res.status(404).json({
        message: 'Not Found'
    });
});

// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run
let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl, port = PORT) {

    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(port, () => {
                    console.log(`Your app is listening on port ${port}`);
                    resolve();
                })
                .on('error', err => {
                    mongoose.disconnect();
                    reject(err);
                });
        });
    });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {
    app,
    runServer,
    closeServer
};
