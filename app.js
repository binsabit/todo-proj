const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { render } = require("ejs");
const _ = require("lodash");
const app = express();

app.use(bodyParser.urlencoded({extendet:true}));
app.use(express.static(__dirname +"/public"));

app.set("view engine", "ejs");

mongoose.connect("mongodb+srv://admin-yerdaulet:yerda_2001@cluster0.iz5pp.mongodb.net/todolistDB?retryWrites=true&w=majority",{ useNewUrlParser: true ,useUnifiedTopology: true });

const itemSchema = {
    name: String
};

const Item  = mongoose.model("Item",itemSchema);

const listSchema = {
    name:String,
    items: [itemSchema]
}

const List = mongoose.model("List",listSchema);

app.get("/",function(req,res){
    Item.find({},function(err,result){
        if(err){
            console.log(err);
        }else{
            res.render("list", {kindOfDay:"Today", newTodo:result});
        }
    });

});
app.post("/",function(req,res){

    const item = req.body.newItem; 
    const ListName = req.body.btn;

    const newTodo = new Item({
        name: item
    });

    if(ListName === "Today"){
        newTodo.save();
        res.redirect("/");
    }else{
        List.findOne({name:ListName},function(err,result){
            if(err){
                console.log(err);
            }else{
                console.log(result.items);
                result.items.push(newTodo);
                // console.log(result.items[0]);
                result.save();
                res.redirect("/" + ListName);
            }
        });
    }
    
});

app.post("/delete",function(req,res){

    let delId = req.body.done;
    let listId = req.body.listname;
    
    if(listId === "Today"){
        Item.deleteOne({_id:delId},function(err){
            if(err){
                console.log(err);
            }else{
                console.log("deleted");
                res.redirect("/");
            }
        });
    }else{
        List.findOneAndUpdate({name: listId},{$pull: {items:{_id:delId}}},function(err,result){
            if(err){
                console.log(err);
            }else{
                res.redirect("/" + listId);
            }
        })
    }
});

app.get("/:customlist",function(req,res){
   
    const customListName = _.capitalize(req.params.customlist);
    
    List.findOne({name:customListName},function(err,result){
        if(err){
            console.log(err);
        }else{
            if(result){
                console.log("exists");
                res.render("list",{kindOfDay:customListName, newTodo:result.items});

            }else{
                console.log("does not exist");
                
                const list = new List({
                    name:customListName,
                    items:[]
                });

                list.save()
                res.redirect("/"+customListName);

            }
        }
        // res.render("list",{kindOfDay:"Today", newTodo:result.items});
    });
});

app.listen(3000, function(){
    console.log("server is runnign on port 3000");
});