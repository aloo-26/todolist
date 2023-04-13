const exp = require("express");
const _ = require("lodash");

const app = exp()
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(exp.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://alankriti:aloo1234@cluster0.pjqj4bm.mongodb.net/todolistDB");

const itemSchema = {
    item: String
}

const Item = mongoose.model(
    "Item", itemSchema
)

const item1 = new Item({
    item: "Item1"
})

const item2 = new Item({
    item: "Item2"
})
const item3 = new Item({
    item: "Item3"
})

const defItem = [item1, item2, item3]

const lstnameSchema = {
    name: String,
    items: [itemSchema]
};

const Lst = mongoose.model("List", lstnameSchema);

// Item.insertMany(defItem);


app.get("/", function (req, res) {
    Item.find({}).then(item => {
        res.render("list", { items: item, day: "Today" });
    })
});

app.get("/home",function(req,res){
    Lst.find({}).then(item => {
        console.log(item);
        res.render("home",{
            items: item, day: "Home"
        })
    })
})

app.get("/:lstName", async function (req, res) {
    const par =_.capitalize(req.params.lstName);
    const ext = await Lst.findOne({ name: par }).exec();
    if (ext) {
        Lst.findOne({name:par}).then(item => {
            console.log(item);
            res.render("list", { items: item.items, day: par });
        })
    }
    else {
        const list = new Lst({
            name: par,
            items: []
        });

        list.save();
        res.redirect("/"+par);
    }
})

app.post("/", function (req, res) {
    var title = req.body.title;
    var lst= req.body.button;
    const i = new Item({
        item: title
    })
    if (lst === "Today"){
        i.save();
        res.redirect("/");
    }
    else{
        Lst.findOne({name:lst}).then(item=>{
            item.items.push(i);
            item.save();
            res.redirect("/"+lst);
        })
        }

})

app.post("/delete", function (req, res) {
    const itemid = req.body.checkbox;
    const lst = req.body.title;
    if (lst==="Today"){
        Item.findByIdAndRemove(itemid);
        res.redirect("/");
    }
    else{
        Lst.findOneAndUpdate({name:lst},{$pull:{items:{_id:itemid}}});
        res.redirect("/"+lst);

    }
})

app.listen(8080, function () {
    console.log("Running......")
});