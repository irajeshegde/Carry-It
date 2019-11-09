var express = require('express'), 
  	app = express();
var session = require('express-session'),
	http = require('http'),
  	path = require('path'),
	mysql = require('mysql'),
	bodyParser=require("body-parser"),
	request = require("request");
	//methodOverride = require('method-override');
//let debugMode = true;
app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

//sql connection
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '', // put your password
  database : 'carry_it_final'
});

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

/*=======================================================================================*/

// Homepage
app.get("/", function(req, res){
	res.render("home");
});

// Display all available items to everyone excluding my own items
app.get('/items', function(req, res) {
	if (req.session.loggedin) {
		var sql = 'SELECT * FROM items FULL JOIN users on customer_id= user_id WHERE customer_id <> ? AND i_status <> "DELIVERED" AND i_status <> "ONTHEWAY"';
		connection.query(sql,[req.session.userid], function(err, results, fields){
			if(err){
				console.log(err);
			} else {
				//console.log(results);
				//var result = JSON.parse(JSON.stringify(results));
				//console.log(result);
				//let z = Object.keys(result).map((obj) => {
					//let x = result[obj];
					//return `${x.item_name}, ${x.user_id}`;})
				res.render('items', {result: results});
			}
		});
	} else {
		res.send('Please login to view this page!');
	}
});


//my uploaded items
app.get('/myitems', function(req, res) {
	if (req.session.loggedin) {
		var sql = 'SELECT * FROM items FULL JOIN users on customer_id = user_id WHERE customer_id = ?';
		connection.query(sql, [req.session.userid] ,function(err, results, fields){
			if(err){
				console.log(err);
			} else {
				res.render('myitems', {result: results});
			}
		});
	} else {
		res.send('Please login to view this page!');
	}
});

// NEW - create new item
app.get("/items/new", function(req, res){
	res.render("new.ejs");
});

//POST req for new item
app.post("/items", function(req, res){
	var name = req.body.name,
		desc = req.body.description,
		to   = req.body.to,
		from = req.body.from,
		type = req.body.type,
		customerid = req.session.userid;
    var sql = "INSERT INTO items(i_name, i_desc, i_to, i_from, i_type, customer_id) VALUES('"+name+"', '"+desc+"', '"+to+"', '"+from+"', '"+type+"', '"+customerid+"');";
	connection.query(sql, function(err, result){
		if(err){
			console.log(err);
		} else {
			res.redirect('/myitems');
		}
	});

});

//MORE info
app.get("/items/:id", function(req, res){
if (req.session.loggedin) {
		var sql = 'SELECT * FROM items FULL JOIN users on customer_id = user_id WHERE item_id = ?';
		connection.query(sql,[req.params.id], function(err, results, fields){
			if(err){
				console.log(err);
			} else {
				res.render('show', {result: results});
			}
		});
	} else {
		res.send('Please login to view this page!');
	}
});


//EDIT item
app.get("/items/edit/:id", function(req, res){
	if (req.session.loggedin) {
		var sql = 'SELECT * FROM items WHERE item_id = ?';
		connection.query(sql,[req.params.id], function(err, results, fields){
			if(err){
				res.redirect("/myitems");
			} else {
				res.render("edit", {result:results});
			}
		});
	} else {
		res.send('Please login to view this page!');
	}
});

//UPDATE
app.post("/items/:id", function(req, res){
	if (req.session.loggedin) {
	var name = req.body.name,
		desc = req.body.description,
		to   = req.body.to,
		from = req.body.from,
		type = req.body.type;

		var sql = 'UPDATE items SET i_name = ?, i_desc = ?, i_to = ?, i_from = ?, i_type = ? WHERE item_id = ?';
		connection.query(sql,[name, desc, to, from, type, req.params.id], function(err, results, fields){
			if(err){
				res.redirect("/myitems");
				console.log(err);
			} else {
				res.redirect("/myitems");
				console.log("Updated")
			}
		});
	} else {
		res.send('Please login to view this page!');
	}
});

//DELETE item
app.get("/items/delete/:id", function(req, res){
	if (req.session.loggedin) {
		var sql = 'DELETE FROM items WHERE item_id = ?';
		connection.query(sql,[req.params.id], function(err, results, fields){
			if(err){
				res.redirect("/myitems");
				console.log(err);
			} else {
				res.redirect("/myitems");
				console.log("Deleted")
			}
	});
	} else {
		res.send('Please login to view this page!');
	}
});


app.get("/myorders", function(req, res){
	if (req.session.loggedin) {
		var sql = 'SELECT * FROM orders AS o, items AS i, users AS u WHERE o.item_id=i.item_id AND deliverer_id = ? AND i.customer_id=u.user_id';
		connection.query(sql,[req.session.userid], function(err, results, fields){
			if(err){
				res.redirect("/items");
			} else {
				res.render("showorders", {result:results});
			}
		});
	} else {
		res.send('Please login to view this page!');
	}
});

//UPDATE
app.post("/status/:id", function(req, res){
	if (req.session.loggedin) {
		var sql = 'UPDATE items SET i_status = "DELIVERED" WHERE item_id = ?';
		connection.query(sql,[req.params.id], function(err, results, fields){
			if(err){
				res.redirect("/myorders");
				console.log(err);
			} else {
				res.redirect("/myorders");
				console.log("Updated")
			}
		});
	} else {
		res.send('Please login to view this page!');
	}
});

app.get("/orders", function(req, res){
	if (req.session.loggedin) {
		var sql = 'SELECT * FROM orders AS o, items AS i, users AS u WHERE o.item_id=i.item_id AND o.deliverer_id=u.user_id AND o.item_id IN(SELECT item_id FROM items WHERE customer_id=?)';
		connection.query(sql,[req.session.userid], function(err, results, fields){
			if(err){
				res.redirect("/items");
			} else {
				res.render("orders", {result:results});
			}
		});
	} else {
	res.send('Please login to view this page!');
	}
});

app.post("/orders", function(req, res){
	var itemid  = req.body.itemid,
		delivererid = req.session.userid,
		date = req.body.date,
		message = req.body.message;
	var sql1="INSERT INTO orders(item_id, deliverer_id, estimated_date, message) VALUES('"+itemid+"','"+delivererid+"','"+date+"','"+message+"');"
	var sql2 = 'UPDATE items SET i_status = "ONTHEWAY" WHERE item_id = ?';	
		connection.query(sql1, function(err, result){
		if(err){
			console.log(err);
		} else {
			connection.query(sql2, [itemid], function(err, results, fields){
				if (err) {
					console.log(err);
				} else {
					console.log("ON THE WAY update done");
				}
			});
			res.redirect('/myorders');
		}
	});
});


/*=======================================================================================*/

//login GET
app.get("/login", function(req, res){
	res.render("login");
});

//login POST
app.post('/login', function(req, res) {

	/*if(debugMode){ 
		req.session.loggedin = true;
		req.session.email = 'rajeshhegde180@gmail.com';
		req.session.userid = 1;
		res.redirect('/items');
		return;
	} */

	var email = req.body.email;
	var password = req.body.password;
	if (email && password) {
		connection.query('SELECT * FROM users WHERE u_email = ? AND password = ?', [email, password], function(error, results, fields) {
			if (results.length > 0) {
				req.session.loggedin = true;
				req.session.email = email;
				var result = JSON.parse(JSON.stringify(results));
				let z = Object.keys(result).map((obj) => {
					let x = result[obj];
					req.session.userid = x.user_id;
				})
				res.redirect('/items');
			} else {
				res.send('Incorrect Username and/or Password!');
			}			
			
		});
	} else {
		res.send('Please enter Username and Password!');
		
	}
});

// login page
app.get("/signup", function(req, res){
	res.render("signup");
});

//post req for new user
app.post("/signup", function(req, res){
	var fname = req.body.fname,
		lname = req.body.lname,
		email = req.body.email,
		mobile = req.body.mobile,
		password = req.body.password;

	var sql = "INSERT INTO users(u_fname, u_lname, u_email, u_mobile, password) VALUES('"+fname+"', '"+lname+"', '"+email+"', '"+mobile+"', '"+password+"')";
	connection.query(sql, function(err, result){
		if(err){
			console.log(err);
		} else {
			res.redirect('/login');
		}
	});

});

// login page
app.get("/logout", function(req, res){	
	req.session.loggedin = false;
	req.session.email = null;
	req.session.userid = null;
	res.redirect('/');		
	
});

/*=======================================================================================*/


//for sql error
connection.on('error', function(err) {
  console.log("[mysql error]",err);
});

//connecting to sql
connection.connect(function(err) {
  if (err) throw err
  console.log('Connected with carry-it database')
})
//global.db = connection;

var server = app.listen(3000, "127.0.0.1", function () {
  var host = server.address().address
  var port = server.address().port
  console.log("listening at http://%s:%s", host, port)

});
