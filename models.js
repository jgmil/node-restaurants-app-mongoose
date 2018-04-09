'use strict';

const mongoose = require('mongoose');

const blogPostSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        firstName: String,
        lastName: String,
    },
    created: Date
});

blogPostSchema.virtual('authorName').get(function () {
    return `${this.author.firstName} ${this.authorlastName}`;
});


blogPostSchema.methods.serialize = function () {

    return {
        title: this.title,
        author: this.authorName,
        content: this.content,
        created: this.created
    };
}

const BlogPosts = mongoose.model('BlogPosts', blogPostSchema);

module.exports = {
    BlogPosts
};
