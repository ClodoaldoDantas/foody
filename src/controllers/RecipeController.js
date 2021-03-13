const Recipe = require('../models/Recipe');
const RecipeFiles = require('../models/RecipeFiles');
const Chef = require('../models/Chef');
const File = require('../models/File');
const validateFields = require('../helpers/validate');

module.exports = {
  async index(req, res) {
    try {
      const data = await Recipe.findAll();
      return res.render('admin/recipes/index', { recipes: data.rows });
    } catch (err) {
      console.log(err.message);
    }
  },
  async show(req, res) {
    try {
      const { id } = req.params;
      const data = await Recipe.findById(id);
      return res.render('admin/recipes/show', { recipe: data.rows[0] });
    } catch (err) {
      console.log(err.message);
    }
  },
  async create(req, res) {
    try {
      const data = await Chef.findAll();
      return res.render('admin/recipes/create', { chefs: data.rows });
    } catch (err) {
      console.log(err.message);
    }
  },
  async post(req, res) {
    const validate = validateFields({
      title: req.body.title,
      ingredients: req.body.ingredients,
      preparation: req.body.preparation,
    });

    if (!validate) return res.send('Please, fill all fields!');

    if (req.files.length === 0) {
      return res.send('Please, sent at least one image');
    }

    try {
      const recipeResponse = await Recipe.create(req.body);
      const recipeId = recipeResponse.rows[0].id;

      const filesPromise = req.files.map(file => {
        return File.create(file);
      });

      const filesResponse = await Promise.all(filesPromise);
      const filesIds = filesResponse.map(result => result.rows[0].id);

      const recipeFilesResponse = filesIds.map(fileId => {
        return RecipeFiles.create({ recipeId, fileId });
      });

      await Promise.all(recipeFilesResponse);

      return res.redirect('/admin/recipes');
    } catch (err) {
      console.log(err.message);
    }
  },
  async edit(req, res) {
    try {
      const { id } = req.params;
      const files = await RecipeFiles.files(id);
      const recipe = await Recipe.findById(id);
      const chefs = await Chef.findAll();

      const images = files.rows.map(file => {
        const src = `http://localhost:5000/uploads/${file.name}`;
        return { ...file, src };
      });

      return res.render('admin/recipes/edit', {
        recipe: recipe.rows[0],
        chefs: chefs.rows,
        images,
      });
    } catch (err) {
      console.log(err.message);
    }
  },
  async put(req, res) {
    const validate = validateFields({
      title: req.body.title,
      image: req.body.image,
      ingredients: req.body.ingredients,
      preparation: req.body.preparation,
    });

    if (!validate) return res.send('Please, fill all fields!');

    try {
      if (req.files.length > 0) {
        const filesPromise = req.files.map(file => {
          return File.create(file);
        });

        const filesResponse = await Promise.all(filesPromise);
        const filesIds = filesResponse.map(result => result.rows[0].id);

        const recipeFilesResponse = filesIds.map(fileId => {
          return RecipeFiles.create({ recipeId: req.body.id, fileId });
        });

        await Promise.all(recipeFilesResponse);
      }

      if (req.body.removed_files) {
        const removedFiles = req.body.removed_files.split(',');
        const lastIndex = removedFiles.length - 1;
        removedFiles.splice(lastIndex, 1);

        const removedFilesPromise = removedFiles.map(id =>
          RecipeFiles.delete(id)
        );

        await Promise.all(removedFilesPromise);
      }

      await Recipe.update(req.body);
      return res.redirect(`/admin/recipes/${req.body.id}`);
    } catch (err) {
      console.log(err.message);
    }
  },
  async delete(req, res) {
    try {
      const { id } = req.body;
      await Recipe.delete(id);
      return res.redirect('/admin/recipes');
    } catch (err) {
      console.log(err.message);
    }
  },
};
