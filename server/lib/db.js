// server/lib/db.js
import knex from 'knex';
import { Model } from 'objection';
import config from '../../knexfile.js';

// Initialize Knex
const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

// Bind Objection.js to Knex
Model.knex(db);

export default db;
