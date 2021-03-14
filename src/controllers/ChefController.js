const Chef = require('../models/Chef');
const Recipe = require('../models/Recipe');
const File = require('../models/File');
const validateFields = require('../helpers/validate');

module.exports = {
  async index(req, res) {
    try {
      const data = await Chef.findAll();
      return res.render('admin/chefs/index', { chefs: data });
    } catch (err) {
      console.log(err.message);
    }
  },
  async show(req, res) {
    try {
      const { id } = req.params;
      const chef = await Chef.findById(id);
      const recipes = await Recipe.findOne({ chef_id: id });
      return res.render('admin/chefs/show', { recipes, chef });
    } catch (err) {
      console.log(err.message);
    }
  },
  create(req, res) {
    return res.render('admin/chefs/create');
  },
  async post(req, res) {
    const { name } = req.body;
    const validate = validateFields({ name });

    if (!validate) return res.send('Please, fill all fields');
    if (!req.file) return res.send('Please, send a picture');

    try {
      const fileResult = await File.create(req.file);
      await Chef.create({ name, file_id: fileResult.rows[0].id });
      return res.redirect('/admin/chefs');
    } catch (err) {
      console.log(err.message);
    }
  },
  async edit(req, res) {
    try {
      const { id } = req.params;
      const chef = await Chef.findById(id);
      return res.render('admin/chefs/edit', { chef });
    } catch (err) {
      console.log(err.message);
    }
  },
  async put(req, res) {
    const { name, id } = req.body;
    const validate = validateFields({ name });
    let fileId;

    if (!validate) return res.send('Please, fill all fields');

    if (req.file) {
      const fileResult = await File.create(req.file);
      fileId = fileResult.rows[0].id;
    } else {
      fileId = req.body.file_id;
    }

    try {
      await Chef.update({ name, file_id: fileId, id });
      return res.redirect(`/admin/chefs/${id}`);
    } catch (err) {
      console.log(err.message);
    }
  },
  async delete(req, res) {
    try {
      const { id } = req.body;
      await Chef.delete(id);
      return res.redirect('/admin/chefs');
    } catch (err) {
      console.log(err.message);
    }
  },
};
