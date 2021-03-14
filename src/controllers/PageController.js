const Recipe = require('../models/Recipe');
const Chef = require('../models/Chef');

module.exports = {
  async index(req, res) {
    const { filter } = req.query;

    try {
      const data = filter
        ? await Recipe.findAll(filter)
        : await Recipe.findAll();

      return res.render('pages/index', { recipes: data, filter });
    } catch (err) {
      console.log(err.message);
    }
  },
  about(req, res) {
    return res.render('pages/about');
  },
  async recipes(req, res) {
    const { filter } = req.query;

    try {
      const data = filter
        ? await Recipe.findAll(filter)
        : await Recipe.findAll();

      return res.render('pages/recipes', { recipes: data, filter });
    } catch (err) {
      console.log(err.message);
    }
  },
  async show(req, res) {
    try {
      const { id } = req.params;
      const data = await Recipe.findById(id);
      return res.render('pages/recipe', { recipe: data });
    } catch (err) {
      console.log(err.message);
    }
  },
  async chefs(req, res) {
    try {
      const chefs = await Chef.find();
      res.render('pages/chefs', { chefs });
    } catch (err) {
      console.log(err.message);
    }
  },
};
