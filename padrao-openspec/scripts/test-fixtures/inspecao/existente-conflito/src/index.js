const express = require('express');
const { Pool } = require('pg');

const app = express();
const pool = new Pool();
app.get('/', async (req, res) => res.json((await pool.query('select 1')).rows));
module.exports = app;
