const db = require('../database/connection');
const date = require('../helpers/date');
const getImageUrl = require('../helpers/image');
const fs = require('fs');

module.exports = {
  async findAll(filter = '') {
    let query = `
      SELECT recipes.*, chefs.name as author 
      FROM recipes INNER JOIN chefs ON recipes.chef_id = chefs.id
    `;

    if (filter) {
      query += `WHERE recipes.title ILIKE '%${filter}%' ORDER BY updated_at DESC`;
    } else {
      query += 'ORDER BY created_at DESC';
    }

    const recipes = await db.query(query);
    const recipesWithImages = recipes.rows.map(async recipe => {
      const image = await db.query(
        `SELECT files.* FROM files 
        LEFT JOIN recipe_files on files.id = recipe_files.file_id
        WHERE recipe_files.recipe_id = $1 LIMIT 1`,
        [recipe.id]
      );
      const image_url = getImageUrl(image.rows[0].name);
      return { ...recipe, image: image_url };
    });

    return Promise.all(recipesWithImages);
  },
  async findById(id) {
    const query = `
      SELECT recipes.*, chefs.name as author 
      FROM recipes INNER JOIN chefs ON recipes.chef_id = chefs.id
      WHERE recipes.id = $1
    `;

    const recipe = await db.query(query, [id]);
    const images = await db.query(
      `SELECT files.* FROM files 
      LEFT JOIN recipe_files on files.id = recipe_files.file_id
      WHERE recipe_files.recipe_id = $1
      `,
      [recipe.rows[0].id]
    );

    return {
      ...recipe.rows[0],
      images: images.rows.map(image => ({
        ...image,
        src: getImageUrl(image.name),
      })),
    };
  },
  async findOne(data) {
    const column = Object.keys(data)[0];
    const query = `
      SELECT recipes.*, chefs.name as author 
      FROM recipes INNER JOIN chefs ON recipes.chef_id = chefs.id
      WHERE ${column} = $1
      ORDER BY created_at DESC
    `;

    const recipes = await db.query(query, [data[column]]);
    const recipesWithImages = recipes.rows.map(async recipe => {
      const image = await db.query(
        `SELECT files.* FROM files 
        LEFT JOIN recipe_files on files.id = recipe_files.file_id
        WHERE recipe_files.recipe_id = $1 LIMIT 1`,
        [recipe.id]
      );
      const image_url = getImageUrl(image.rows[0].name);
      return { ...recipe, image: image_url };
    });

    return Promise.all(recipesWithImages);
  },
  create(data) {
    const query = `
      INSERT INTO recipes(
        chef_id,
        title,
        ingredients,
        preparation,
        information,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
    `;

    const values = [
      data.chef_id,
      data.title,
      data.ingredients,
      data.preparation,
      data.information,
      date(Date.now()).iso,
    ];

    return db.query(query, values);
  },
  update(data) {
    const query = `
      UPDATE recipes SET
        chef_id = ($1),
        title = ($2),
        ingredients = ($3),
        preparation = ($4),
        information = ($5)
      WHERE id = $6
    `;

    const values = [
      data.chef_id,
      data.title,
      data.ingredients,
      data.preparation,
      data.information,
      data.id,
    ];

    return db.query(query, values);
  },
  async delete(id) {
    // GET FILES ID
    const recipesFiles = await db.query(
      'SELECT * FROM recipe_files WHERE recipe_id = $1',
      [id]
    );
    const filesIds = recipesFiles.rows.map(item => item.file_id);

    // REMOVE FILE FROM UPLOADS DIRECTORY
    const pathsResponse = filesIds.map(fileId => {
      return db.query('SELECT path FROM files WHERE id = $1', [fileId]);
    });

    const pathsResult = await Promise.all(pathsResponse);

    pathsResult.map(result => {
      const file = result.rows[0];
      fs.unlinkSync(file.path);
    });

    // REMOVE RECIPE_FILES ENTITY
    await db.query('DELETE FROM recipe_files WHERE recipe_id = $1', [id]);

    // REMOVE FILES ENTITY
    const filesPromise = filesIds.map(fileId => {
      return db.query('DELETE FROM files where id = $1', [fileId]);
    });
    await Promise.all(filesPromise);

    // REMOVE RECIPE ENTITY
    const query = 'DELETE FROM recipes WHERE id = $1';
    return db.query(query, [id]);
  },
};
