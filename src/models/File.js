const db = require('../database/connection');

module.exports = {
  create(data) {
    const { filename, path } = data;

    const query = `
      INSERT INTO files(name, path)
      VALUES ($1, $2)
      RETURNING id
    `;

    return db.query(query, [filename, path]);
  },
};
