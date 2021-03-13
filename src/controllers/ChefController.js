const Chef = require('../models/Chef');
const Recipe = require('../models/Recipe');
const validateFields = require('../helpers/validate');

module.exports = {
  async index(req, res) {
    try {
      const data = await Chef.findAll();
      return res.render('admin/chefs/index', { chefs: data.rows });
    } catch (err) {
      console.log(err.message);
    }
  },
  async show(req, res) {
    try {
      const { id } = req.params;
      const chef = await Chef.findById(id);
      const recipes = await Recipe.findOne({ chef_id: id });

      return res.render('admin/chefs/show', {
        recipes,
        chef: chef.rows[0],
      });
    } catch (err) {
      console.log(err.message);
    }
  },
  create(req, res) {
    return res.render('admin/chefs/create');
  },
  async post(req, res) {
    const { name, avatar_url } = req.body;
    const validate = validateFields({ name, avatar_url });

    if (!validate) return res.send('Please, fill all fields');

    try {
      await Chef.create({ name, avatar_url });
      return res.redirect('/admin/chefs');
    } catch (err) {
      console.log(err.message);
    }
  },
  async edit(req, res) {
    try {
      const { id } = req.params;
      const data = await Chef.findById(id);
      return res.render('admin/chefs/edit', { chef: data.rows[0] });
    } catch (err) {
      console.log(err.message);
    }
  },
  async put(req, res) {
    const { name, avatar_url, id } = req.body;
    const validate = validateFields({ name, avatar_url });

    if (!validate) return res.send('Please, fill all fields');

    try {
      await Chef.update({ name, avatar_url, id });
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
