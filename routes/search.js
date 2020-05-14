const express = require('express')
const router = express.Router();
const path = require('path');
const db = require(path.join(__dirname, '../db'));
const { Video } = db.models;
const { Comments } = db.models;
const { UserInfo } = db.models;
const { Subscriptions } = db.models;

//Require and use modules
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
router.use(cookieParser());


var tools = require(path.join(__dirname, 'helperFunctions'));

//GET ALL VIDEOS MADE BY THE USER
router.post('/', tools.asyncHandler( async (req, res) => {

  const { username } = req.session;
  const { searchTerm } = req.body;

  const searchResults = await tools.getSearchResults(searchTerm);

  if (searchResults == null) {
    res.render("search", {searchResults, username, searchTerm, defaults: {}});
    return;
  }

  res.render("search", {searchResults, username, searchTerm, defaults: {}});
}));


//GET ALL VIDEOS MADE BY THE USER
router.get('/:searchTerm/:searchFilter/:searchSort', tools.asyncHandler( async (req, res) => {

  const { username } = req.session;
  const { searchTerm, searchFilter, searchSort } = req.params;

  const searchResults = await tools.getSearchResults(searchTerm);

  if (searchResults == null) {
    res.render("search", {searchResults, username, searchTerm, defaults: {}});
    return;
  }

  const defaults = {};

  if (searchFilter) {
    if (searchFilter == "popular") {
      defaults.popular = true;
      if (searchSort == "asc") {
        searchResults.sort((a, b) => (a.rating <= b.rating) ? 1 : -1);
      } else {
        searchResults.sort((a, b) => (a.rating > b.rating) ? 1 : -1);
      }
    }
    else if (searchFilter == "controversial") {
      defaults.controversial = true;
      if (searchSort == "asc") {
        searchResults.sort((a, b) => (a.likePercentage >= b.likePercentage) ? 1 : -1);
      } else {
        searchResults.sort((a, b) => (a.likePercentage <= b.likePercentage) ? 1 : -1);
      }
    }
    else if (searchFilter == "new") {
      defaults.new = true;
      if (searchSort == "asc") {
        searchResults.sort((a, b) => (a.createdAt <= b.createdAt) ? 1 : -1);
      } else {
        searchResults.sort((a, b) => (a.createdAt > b.createdAt) ? 1 : -1);
      }
    }
  } else {
    res.redirect("404", {message: "Not found"});
    return;
  }

  if (searchSort == "asc") {
    defaults.asc = true;
  } else {
    defaults.desc = true;
  }

  res.render("search", {searchResults, username, searchTerm, defaults});
}));

module.exports = router;