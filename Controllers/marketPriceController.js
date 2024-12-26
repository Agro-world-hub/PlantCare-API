const asyncHandler = require("express-async-handler");

const db = require('../startup/database')

const getAllMarket= (asyncHandler(async(req,res)=>{
    try{
        const sql = 'SELECT * FROM marketprice'
        db.query(sql, (err,results)=>{
            if(err){
                console.error('Error executing query:', err);
                res.status(500).send('An error occurred while fetching data.');
                return;
            }
            res.status(200).json(results)
        })
    }catch(err){
        console.log("Error getAllMarket",err);
        res.status(500).json({message:"Internal Server Error !"})
    }
}))

module.exports ={
    getAllMarket
}
