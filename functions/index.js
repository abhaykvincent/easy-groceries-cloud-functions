const functions = require('firebase-functions')
const express = require('express');
const cors = require('cors');
const app = express();

const { db } = require('./util/admin');


const walmart = require('./walmart')

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// Routes
app.get('/scraping/getProductsByLink',(req,res) => {        
  walmart.getProductByLink()
    .then(  products => {
      if(products){
        products.forEach(product=> {
          db.doc(`/products-grocery/${product.id}`)
          .get()
          .then((doc) => {
              if (doc.exists) {
                    console.log(`doc is already Scraped`)
              } 
              else {

                return db.collection("products-grocery").doc(product.id).set({...product})
                  .then(function() {
                      console.log(`${product.name} is now on Easy Groceries`);
                  })
                  .catch(function(error) {
                      console.error("Error writing document: ", error);
                  });
              }
          })
          .catch((err) => {
              console.error(err);
              if (err.code === "auth/email-already-in-use") {
                  return res.status(400).json({ email: "Email is already is use" });
              } else {
                  return res
                  .status(500)
                  .json({ general: "Something went wrong, please try again" });
              }
          });
        })
      }
      res.json({
        products
    })
  })
})


app.get('/easy/getProductsByCategory/:category',(req,res) => {        
  db.collection("products-grocery")
  .where('category', '>=', req.params.category)
  .limit(12)
    .get()
    .then(function(querySnapshot) {
      let products=[];
        querySnapshot.forEach(function(product) {
          products.push(product.data())
        });
        return products
    })
    .then(products=>{

      res.json(products)
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });

})

app.get('/easy/search',(req,res) => {
  db.collection("products-grocery")
  .where('fieldName', '>=', 'tomato')
  .limit(12)
    .get()
    .then(function(querySnapshot) {
      let products=[];
        querySnapshot.forEach(function(product) {
          products.push(product.data())
        });
        return products
    })
    .then(products=>{

      res.json(products)
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });

})


const runtimeOpts = {
  timeoutSeconds: 300,
  memory: '1GB'
}
// Expose Express API as a single Cloud Function:
exports.api = functions.runWith(runtimeOpts).https.onRequest(app);