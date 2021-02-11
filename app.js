//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://" + process.env.DATABASE_LOGIN + ".pcgjr.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const itemSchema = new mongoose.Schema({
  name: String
});

const Items = mongoose.model("Item", itemSchema);

const item1 = new Items({
  name: "Welcome to your to-do list!"
});

const item2 = new Items({
  name: "Hit the + button to add a new item."
});

const item3 = new Items({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Items.find({}, function(err, results) {
    if (results.length === 0) {
      Items.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Default items added successfully.");
        }//end inner if/else
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: results});
    }//end outer if/else
  });
});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName)

  List.findOne({name: customListName}, function(err, foundList) {
    if(!err){
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }//end inner if/else
    }//end outer if/else
  });
});

//adding an item to a list
app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Items({
    name: itemName
  });

if(listName === "Today") {
  item.save();
  res.redirect("/");
} else {
  List.findOne({name: listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  });
}//end if/else
});

//deleting a list item
app.post("/delete", function(req, res) {
  const deletedItem = req.body.checkbox;  //ID of deleted item
  const listName = req.body.listName;

  if(listName === "Today") {
    Items.deleteOne({_id: deletedItem}, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Item deleted successfully.")
      }//end inner if/else
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: deletedItem}}}, function(err, foundList){
      if (!err) {
        res.redirect("/" + listName);
      }//end inner if
    });
  }//end outer if/else
});

app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully.");
});
