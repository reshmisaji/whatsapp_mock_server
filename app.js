const Express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const app = new Express();
const PORT = process.env.PORT || 8001;
let messages = [];
let users = [];

const getMessages = function() {
  connection.query(
    `select time(time)as time,text,name from messages`,
    (err, data, fields) => (messages = data)
  );
};

const getUsers = function() {
  connection.query(`select * from users`, (err, data, fields) => {
    users = data;
  });
};

const addMessage = function(data) {
  const { message, name } = JSON.parse(data);
  connection.query(
    `insert into messages (text,name) values ("${message}","${name}")`
  );
  messages.push(messages);
};

getMessages();
getUsers();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());
app.use(Express.static("chat/build"));

app.get("/getMessages", (req, res) => res.send(JSON.stringify(messages)));
app.get("/getUsers", (req, res) => res.send(JSON.stringify(users)));

app.post("/sendMessage", (req, res) => {
  addMessage(req.body);
  getMessages();
});

app.listen(PORT, () => console.log(`server listening at ${PORT}`));
