const db = require('../database/connection');
const fs = require('fs');

module.exports = {
  create(data) {
    const query = `
      INSERT INTO recipe_files(
        recipe_id,
        file_id
      ) VALUES ($1, $2)
    `;

    const values = [data.recipeId, data.fileId];
    return db.query(query, values);
  },
  files(recipeId) {
    const query = `
      SELECT files.* FROM files 
      INNER JOIN recipe_files on files.id = recipe_files.file_id 
      WHERE recipe_files.recipe_id = $1
    `;

    return db.query(query, [recipeId]);
  },
  async delete(id) {
    const result = await db.query(`SELECT path FROM files WHERE id = $1`, [id]);
    const file = result.rows[0];

    await db.query('DELETE FROM recipe_files where file_id = $1', [id]);
    fs.unlinkSync(file.path);

    return db.query(`DELETE FROM files WHERE id = $1`, [id]);
  },
};
