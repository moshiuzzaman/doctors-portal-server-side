const express = require('express')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload');
require('dotenv').config()
const cors = require('cors')
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_HOST}:${process.env.DB_HOST}@cluster0.ki0s6.mongodb.net/${process.env.DB_HOST}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


const app = express()
const port = 4000
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
app.use(express.static('doctors'));
app.use(fileUpload());




client.connect(err => {
  const appointements = client.db(`${process.env.DB_HOST}`).collection("appointements");
  const doctotsConnection = client.db(`${process.env.DB_HOST}`).collection("doctors");

  app.post('/addappointment', (req, res) => {
    appointements.insertOne(req.body)
      .then(result => res.send(result.insertedCount > 0))
  })
  app.get('/appointments', (req, res) => {
    appointements.find()
      .toArray((err, result) => {
        res.send(result)
      })
  })
  app.post('/appointmentsByDate', (req, res) => {
    const { date, email } = req.body
    doctotsConnection.find({ email: email })
      .toArray((err, result) => {
          const filter={ date: date }
        if (result.length === 0) {
            filter.email=email
        }
        appointements.find(filter)
          .toArray((err, result) => { res.send(result) })
      })

  })
  app.post('/addDoctors', (req, res) => {
    const file = req.files.file
    const name = req.body.name
    const email = req.body.email
    // file.mv(`${__dirname}/doctors/${file.name}`,err=>{
    //   if(err){
    //    return res.send('file uploaded faild')
    //   }
    //   return res.send({name:file.name, path:`/${file.name}`})
    //  })
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, 'base64')
    };
    console.log(name, email, image);
    doctotsConnection.insertOne({ name, email, image })
      .then(result => res.send(result.insertedCount > 0))
  })

  app.get('/doctors', (req, res) => {
    doctotsConnection.find()
      .toArray((err, result) => {
        res.send(result)
      })
  })

  app.get('/user', (req, res) => {
    const email = req.query.email
    doctotsConnection.find({ email: email })
      .toArray((err, result) => { res.send(result.length > 0) })
  })

});




app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`${port} port running`)
})