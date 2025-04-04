const express = require("express")
const connectDB = require("./database")
const app = express()

connectDB()
require("dotenv").config()
const cors= require("cors")
const port = process.env.PORT || 3000
const dashboardRoute = require("./Routes/dashboard.routes")
const userRoute = require("./Routes/user.routes")


//Middlewares
app.use(express.json())
app.use(cors());
app.use(express.urlencoded({extended:true}))
app.use("/", dashboardRoute)
app.use("/user",userRoute )

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
})