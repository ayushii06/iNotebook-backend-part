const connectToMongo = require('./db');
const express = require('express')
var cors=require('cors')

connectToMongo();

const app = express()
const port=5000;
app.use(express.json())
app.use(cors(x => x
    .AllowAnyMethod()
    .AllowAnyHeader()
    .SetIsOriginAllowed(origin => true) // allow any origin
    .AllowCredentials())); // allow credentia))

app.use('/api/auth',require('./routes/auth'))
app.use('/api/notes',require('./routes/notes'))
app.listen(port,()=>{
    console.log(`http://localhost:${port}`)
})