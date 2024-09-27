const express = require("express");
const { getAllNews, getNewsById } = require("../Controllers/newsController");
const router = express.Router();
const news = require("../end-point/news-ep");

//router.get("/get-all-news",getAllNews)
router.get("/get-all-news",news.getAllNews)

//router.get("/get-news/:newsId",getNewsById)
router.get("/get-news/:newsId",news.getNewsById)

module.exports =router

