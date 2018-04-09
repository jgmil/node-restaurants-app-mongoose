'use strict';
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/blogPostSeedData';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-blogPostSeedData';
exports.PORT = process.env.PORT || 8080;
