const express = require("express");
const bodyParser = require("body-parser");
const { urlencoded } = require("body-parser");
const mongoose = require("mongoose");
var _ = require('lodash');

mongoose.set('useFindAndModify', false);


// require the index.js
// __dirname  = /Users/nguyenthanhtam/Desktop/toDoList

const index = require(__dirname+"/index.js");
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"))

const url = "mongodb+srv://michellengnx:Thanhtam1608@cluster0.gz8no.mongodb.net/items?retryWrites=true&w=majority";
mongoose.connect(url, { useNewUrlParser: true,  useUnifiedTopology: true});

// schema: the skeleton of the database
const itemSchema = new mongoose.Schema({
    name: String
})
// model: higher order constructor 
// => create instance of a document (row/record in)
// take 2 para  => name + the skeleton
// also create the collection ItemS
const Item = mongoose.model("Item", itemSchema);

// create item using the schema above
const item1 = new Item({
    name: "hello"
})

const item2 = new Item({
    name: "Welcome to your todo list"
})

const item3 = new Item({
    name: "goodbye"
});

// save items in an array
const defaultItems = [item1, item2, item3];

// create a new list schema

const listSchema = new mongoose.Schema({
    listName: String,
    // NOTE: model is not a valid type
    // listItems: [Item];

    listItems: [itemSchema]
});

const List = mongoose.model("List", listSchema);




// pay attention to the SINGULAR and PLURAL NOUN
// Item is the MODEL
// Items is the COLLECTION


// using the getDate function declare in index.js

let date = index.getDate(new Date());
// create a new schema for custom list
// 

app.get("/", (req, res)=>{
   
    Item.find({}, function(err, foundItems){
        if (foundItems.length === 0) {
            
            Item.insertMany(defaultItems, function(err){
                if (err) console.log(err);
                else console.log("successfully saved default items");
            });
            res.redirect("/"); 
            
        } else res.render("list", {listTitle: date, toDoItems: foundItems});
        

    });

    // CANNOT USE RENDER MORE THAN ONCE

    // List.find({}, function(err, foundLists){
    //     if (!err) {
    //         if (foundLists.length != 0) {
    //             foundLists.forEach(list => {
    //                 console.log(list.listName);
    //             })
    //             const list = foundLists[0].listName;
    //             console.log(list);
    //             res.render("header", {list: list.listName});
    //         }
    //     }
       
    // })
    
    
});



app.get("/:customListName", (req, res)=>{
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({listName: customListName}, function(err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    listName: customListName,
                    listItems: defaultItems
                });
                list.save();
                // redirect to the custom list name
                // the next round => else statement will be executed
                res.redirect("/" + customListName);
                
            } else  {
                console.log(foundList);
                res.render("list", {listTitle: foundList.listName, toDoItems: foundList.listItems});


            }
        } 

    }) 
})


app.post("/", (req, res)=>{
    
    let itemName = req.body.newToDo;
    let listName = req.body.button;
    let newToDoItem = new Item({
        name: itemName
        });
    today = index.getDate(new Date());
   
   
    if (listName === today) {
        console.log("works");
        
        newToDoItem.save();
        res.redirect("/");
    } else {
        console.log(listName);
        List.findOneAndUpdate({listName: listName}, {$push: {listItems: newToDoItem}}, function(err, foundList){
            if (err) {
                console.log(err);
            }
        })
        res.redirect("/"+listName);
    }
       
});

app.post("/delete", (req, res)=>{
    // checkbox is the NAME while what is shown in the 
    // console is the VALUE (dynamically depend on 
    // whichever is crossed out)
    today = index.getDate(new Date());

    const crossedOutItemId = req.body.checkbox;
    const listName = req.body.name;
    if (listName === today) {
        Item.findByIdAndDelete(crossedOutItemId, function(err){
            if (err) console.log(err);
            else {
                console.log("deleted item");
            }
            res.redirect("/");
        })
    }else {
        List.findOneAndUpdate({listName: listName}, {$pull: {listItems: {_id: crossedOutItemId}}}, function(err, foundList){
            if (!err) {
                if (foundList) {
                    console.log("deleted item");
                    res.redirect("/" + listName);
                }
            }
        })
    }
    
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, ()=>{
    console.log("app is up and running on " + port);
})