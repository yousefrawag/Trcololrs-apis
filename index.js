const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authMW = require("./middleware/authenticationMW");
const {createDefaultPolicy} = require("./model/PrivcySecurty")
// setting up server
const server = express();
const port = process.env.Port || process.env.LOCALPORT;
mongoose
  .connect(process.env.MONGOOOSE_URL)
  .then( async() => {
    await createDefaultPolicy()
    
    console.log("conectect to DB server .......");
    server.listen(port, () => {
      console.log(`Server is listening on port ${port}.....`);
    });
  })
  .catch((err) => console.log(`DB issue ..... ${err}`));

//logging middelware
server.use((req, res, next) => {
  console.log(req.url, req.method);
  next();
});
const corsOptions = {
  origin: ["https://tr-colors-dashboards.netlify.app" , 'https://www.trcolors.com'  , "https://tr-colors-dashboards.netlify.app"], // specify the origin that you want to allow
  methods: 'GET,POST,PUT,DELETE , PATCH ', // specify the methods you want to allow
  allowedHeaders: 'Content-Type,Authorization', // specify the headers you want to allow
  credentials: true // Allow credentials to be included in the request

};
//endpoint middelware
server.use(cors(corsOptions));
server.use(express.json());
server.use(express.urlencoded({ extended: false }));
server.use(cookieParser());
server.use("/api", require("./routes/authRoute"));


server.use("/api/chats", require("./routes/chatRoute"));
server.use("/api/notifications", require("./routes/notificationRoute"));
server.use("/api/messages", require("./routes/messageRoute"));
server.use("/api/customers", require("./routes/customerRoute"));

server.use("/api/users", require("./routes/userRoute"));
server.use("/api/roles", require("./routes/roleRoute"));

server.use("/api/projects", require("./routes/ProjectRoute"));
server.use("/api/Privetprojects", require("./routes/privetProjectRoute"));
server.use("/api/missions", require("./routes/missionRoutes"));

server.use("/api/DeailyRoutes", require("./routes/DeailyRoutes"));
server.use("/api/Services", require("./routes/ServicesRoutes"));
server.use("/api/visav", require("./routes/VisaRoutes"));
server.use("/api/prvicy", require("./routes/prvcyRoute"));
server.use('/api/cutomerRequest' , require("./routes/CustomerMessages"))
server.use('/api/Section' , require("./routes/SectionsRoutes"))
// Not Found MiddleWare

server.use((req, res, next) => {
  res.status(404).json({ data: "Not Found" });
});

//Error Middleware
server.use((error, req, res, next) => {
  res.status(500).json({ data: `From Error MW : ${error}` });
});
