const asyncHandler = require("express-async-handler");

const db = require('../startup/database')

const getAllNews= (async(req,res)=>{
    try{
        const sql = 'SELECT * FROM content'
        db.query(sql, (err,results)=>{
            if(err){
                console.error('Error executing query:', err);
                res.status(500).send('An error occurred while fetching data.');
                return;
            }
            res.status(200).json(results)
        })
    }catch(err){
        console.log("Error getAllNews",err);
        res.status(500).json({message:"Internal Server Error !"})
    }
})


const getNewsById= (async(req,res)=>{
    try{
        const newsId = req.params.newsId
        const sql = 'SELECT * FROM content WHERE id= ?'
        db.query(sql, [newsId],(err,results)=>{
            if(err){
                console.error('Error executing query:', err);
                res.status(500).send('An error occurred while fetching data.');
                return;
            }
            res.status(200).json(results)
        })
    }catch(err){
        console.log("Error getNewsById",err);
        res.status(500).json({message:"Internal Server Error !"})
    }
})

module.exports ={
    getAllNews,
    getNewsById
}