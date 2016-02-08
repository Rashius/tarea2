var express = require("express");
var swig = require("swig");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var Schema = mongoose.Schema;

mongoose.connect("mongodb://localhost/clase2/tarea2");

var esquema = new Schema({
	title:String,
	description:String,
	address: String,
	city:String,
	mascotas:Boolean,
	alberca:Boolean
});

var ToDo = mongoose.model("bLocal",esquema);
var app = express();

app.engine("html", swig.renderFile);
app.set("view engine", "html");
app.set("views", __dirname + "/views");
app.use("/views/css",express.static(__dirname + "/views/css"));

app.set("view cache", false);

swig.setDefaults({cache:false});

app.use(bodyParser.urlencoded({
	extended:false
}));

app.get("/",function(req, res){
	ToDo.find({}, function(err,doc){
		if (err){
			return res.send(500,"Internal Server Error");
		};

		res.render("Home",{
			viewbag: {
				title: "Home",
				items: doc,
				cities:["CDMX","Guadalajara","Merida"]
			}
		});
	});
});

app.get("/agrega-local",function(req,res){
	res.render("agregar-local",{
		viewbag:{
			cities:["CDMX","Guadalajara","Merida"]
		}
	});
});

app.post("/agregar-local",function(req, res){
	ToDo.create({
		title: req.body.title,
		description: req.body.description,
		address: req.body.address,
		city: req.body.city,
		mascotas: req.body.mascotas,
		alberca: req.body.alberca
	},function(err,docs){
		if (err) {
			res.send("Error al insertar",err);
			return;
		}
		res.redirect("/");
	});
});

app.get("/cities/:ciudad",function(req,res){
	ToDo.find({city:req.params.ciudad},function(err,docs){
		if(err){
			return res.send(500,"Internal Server Error");
		}
		if(!docs){
			return res.send(404,"File Not Found");
		}
		res.render("cities",{
			viewbag:{
				items:docs
			}
		});
	});
});

app.get("/city/:ciudad/:id",function(req,res){
	ToDo.findOne({_id:req.params.id},function(err,docs){
		if(err){
			return res.send(500,"Internal Error Server");
		}
		if(!docs){
			return res.send(404,"File Not Found")
		}
		// console.log(docs);
		res.render("city",{
			viewbag:{
				item:docs
			}
		});
	});
});	

app.post("/actualizar-local/:ciudad/:id",function(req,res){
	ToDo.update({
		_id:req.params.id
	},
	{
		$set:{
			title: req.body.title,
			description: req.body.description,
			address: req.body.address,
			mascotas: req.body.mascotas,
			alberca: req.body.alberca
		}
	},function(err,docs){
		if(err){
			return res.status(500).send("Internal Server Error");
		}
		res.redirect("/cities/"+ req.params.ciudad);
	});
});

app.post("/remover-local/:ciudad/:id",function(req,res){
	ToDo.remove({_id:req.params.id},function(err,docs){
		if(err){
			return res.status(500).send("Internal Server Error");
		}
		res.redirect("/cities/"+ req.params.ciudad);
	});
});


app.listen(3001,function(){
	console.log("Servidor Iniciado!! ☺")
});