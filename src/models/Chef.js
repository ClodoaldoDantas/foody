const db = require('../database/connection');
const date = require('../helpers/date');
const getImageUrl = require('../helpers/image');

module.exports = {
  async findAll() {
    const query = `SELECT chefs.*, files.name as filename from chefs
    INNER JOIN files on chefs.file_id = files.id`;

    const chefs = await db.query(query);

    return chefs.rows.map(chef => ({
      ...chef,
      image: getImageUrl(chef.filename),
    }));
  },
  async find() {
    const query = `
      SELECT chefs.*, count(recipes) as total_recipes FROM chefs
      LEFT JOIN recipes ON chefs.id = recipes.chef_id
      GROUP BY chefs.id;
    `;

    const chefs = await db.query(query);
    const chefsWithImages = chefs.rows.map(async chef => {
      const file = await db.query(`SELECT name FROM files WHERE id = $1`, [
        chef.file_id,
      ]);

      return { ...chef, image: getImageUrl(file.rows[0].name) };
    });

    return Promise.all(chefsWithImages);
  },
  async findById(id) {
    const chefQuery = `
      SELECT chefs.*, count(recipes) as total_recipes FROM chefs
      LEFT JOIN recipes ON chefs.id = recipes.chef_id
      WHERE chefs.id = $1
      GROUP BY chefs.id;
    `;

    const fileQuery = `SELECT name FROM files WHERE id = $1`;

    const chef = await db.query(chefQuery, [id]);
    const file = await db.query(fileQuery, [chef.rows[0].file_id]);

    return {
      ...chef.rows[0],
      image: getImageUrl(file.rows[0].name),
      filename: file.rows[0].name,
    };
  },
  create(data) {
    const query = `
      INSERT INTO chefs(name, file_id, created_at) VALUES ($1, $2, $3)
    `;
    const values = [data.name, data.file_id, date(Date.now()).iso];
    return db.query(query, values);
  },
  update(data) {
    const query = `
      UPDATE chefs SET name = ($1), file_id = ($2) WHERE id = ($3)
    `;
    const values = [data.name, data.file_id, data.id];
    return db.query(query, values);
  },
  delete(id) {
    const query = 'DELETE FROM chefs WHERE id = $1';
    return db.query(query, [id]);
  },
};
