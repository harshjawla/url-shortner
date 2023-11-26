const express = require("express");
const shortId = require("shortid");
const mongoose = require("mongoose");
const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/urlShortner");

const shortUrlSchema= new mongoose.Schema({
    full: {
        type: String,
        required: true
    },
    short: {
        type: String,
        required: true,
        default: shortId.generate
    },
    clicks: {
        type: Number,
        required: true,
        default: 0
    }
});

const ShortUrl = new mongoose.model("ShortUrl", shortUrlSchema); 

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended : false}));
const PORT= 3000;

app.get("/",async (req,res)=>{
    const shortUrls= await ShortUrl.find();
    res.render("index", {shortUrls : shortUrls});
});

app.get("/:shortUrl",async (req,res)=>{
    const shortUrl= await ShortUrl.findOne({ short: req.params.shortUrl });
    if(shortUrl == null) return res.sendStatus(404);

    shortUrl.clicks++;
    await shortUrl.save();

    res.redirect(shortUrl.full);
});

app.post("/shortUrls", async (req,res)=>{
    await ShortUrl.create({ full: req.body.fullUrl });
    res.redirect("/");
});

app.listen(PORT, function(req,res){
    console.log(`Server is running on PORT: ${PORT}`);
});