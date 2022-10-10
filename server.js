require('dotenv').config()

//importing packages
const express = require('express');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const path = require('path');
const stripe = require('stripe');

// firebase admin setup
let serviceAccount = require("./art-hub-7a86f-firebase-adminsdk-5d8kz-505b5757d2.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();

// aws config
const aws = require('aws-sdk');
const dotenv = require('dotenv');

dotenv.config();

//aws parameters
const region = "ap-south-1";
const bucketName = "arthub-1";
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

aws.config.update({
    region, 
    accessKeyId,
    secretAccessKey
})

// init s3
const s3 = new aws.S3();

// generate image upload link
async function generateUrl(){
    let date = new Date();
    let id = parseInt(Math.random() * 10000000000)

    const imageName = `${id}${date.getTime()}.jpg`;

    const params = ({
        Bucket: bucketName,
        Key: imageName,
        Expires: 300, //300ms
        ContentType: 'image/jpeg'
    })
    const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
    return uploadUrl;
}

//declare static path
let staticPath = path.join(__dirname, "public");

//initializing express.js
const app = express();

//middleware
app.use(express.static(staticPath));
app.use(express.json());

//routes
//home route
app.get("/", (req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
})

//signup route
app.get('/signup', (req, res) => {
    res.sendFile(path.join(staticPath, "signup.html"));
})

app.post('/signup', (req, res) => {
    let { name, email, password, number, tac, notification } = req.body;

    // form validation
    if(name.length < 3){
        return res.json({'alert': 'name must be at least 3 letters long'});   
    } else if(!email.length){
        return res.json('enter your email');
    } else if(password.length < 8){
        res.json({'alert': 'password should be at least 8 characters long'});
    } else if(!number.length){
        res.json({'alert': 'enter your phone number'});
    } else if(!Number(number) || number.length < 10){
        res.json({'alert': 'invalid number, should be at least 10 characters long'});
    } else if(!tac){
        res.json({'alert': 'you must agree to t&c to continue'});
    } 

    // store user in db
    db.collection('users').doc(email).get()
    .then(user => {
        if(user.exists){
            return res.json({'alert': 'email already exists'});
        } else{
            // encrypt the password before storing
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(password, salt, (err, hash) => {
                    req.body.password = hash;
                    db.collection('users').doc(email).set(req.body)
                    .then(data => {
                        res.json({
                            name: req.body.name,
                            email: req.body.email,
                            seller: req.body.seller,
                        })
                    })
                })
            })
        }
    })
})

// login route
app.get('/login', (req, res) => {
    res.sendFile(path.join(staticPath, "login.html"));
})

app.post('/login', (req, res) => {
    let { email, password } = req.body;

    if(!email.length || !password.length){
        return res.json({'alert': 'fill all inputs before login'})
    }

    db.collection('users').doc(email).get()
    .then(user => {
        if(!user.exists){ // if user does not exist
            return res.json({'alert': 'email incorrect or does not exist'})
        } else{
            bcrypt.compare(password, user.data().password, (err, result) => {
                if(result){
                    let data = user.data();
                    return res.json({
                        name: data.name,
                        email: data.email,
                        seller: data.seller,
                    })
                } else{
                    return res.json({'alert': 'password incorrect'})
                }
            })
        }
    })
})

// seller route
app.get('/seller', (req, res) => {
    res.sendFile(path.join(staticPath, "seller.html"));
})

app.post('/seller', (req, res) => {
    let { name, about, address, number, tac, legitInfo, email } = req.body;
    if(!name.length || !address.length || !about.length || number.length < 10 || !Number(number)){
        return res.json({'alert': 'some information is invalid'});
    } else if(!tac || !legitInfo){
        return res.json({'alert': 'you must accept terms and conditions to preoceed'})
    } else{// update user seller status
        db.collection('sellers').doc(email).set(req.body)
        .then(data => {
            db.collection('users').doc(email).update({
                seller: true
            }).then(data => {
                res.json(true);
            })
        })
    }
})

// add product
app.get('/add-product', (req, res) => {
    res.sendFile(path.join(staticPath, "addProduct.html"));
})

app.get('/add-product/:id', (req, res) => {
    res.sendFile(path.join(staticPath, "addProduct.html"));
})

// get the upload link
app.get('/s3url', (req, res) => {
    generateUrl().then(url => res.json(url));
})

//  add product
app.post('/add-product', (req, res) => {
    let { name, shortDes, des, images, sizes, actualPrice, discount, sellingPrice,
    stock, tags, tac, email, draft, id } = req.body;

    // validation
    if(!draft){
        if(!name.length){
            return res.json({'alert': 'enter product name'});
        } else if(shortDes.length > 100 || shortDes.length < 10){
            return res.json({'alert': 'short description must be between 10 and 100 characters'});
        } else if(!des.length){
            return res.json({'alert': 'enter detailed description about the product'});
        } else if(!images.length){ // image link array
            return res.json({'alert': 'upload at least one image of the product'});
        } else if(!sizes.length){ // size array
            return res.json({'alert': 'select at least one size'});
        } else if(!actualPrice.length || !discount.length || !sellingPrice.length){
            return res.json({'alert': 'you must add a price for the product'});
        } else if(stock < 1){
            res.json({'alert':'you should have at least 1 item in stock'});
        } else if(!tags.length){
            return res.json({'alert':'enter tags to help rank your product in search list'});
        } else if(!tac){
            return res.json({'alert':'you must accept terms and conditions to proceed'});
        }
    }

    // add product
    let docName = id == undefined ? `${name.toLowerCase()}-${Math.floor(Math.random() * 5000)}` : id;
    db.collection('products').doc(docName).set(req.body)
    .then(data => {
        res.json({'product': name});
    })
    .catch(err => {
        return res.json({'alert': 'some error occured, try again'});
    })
})

// get products
app.post('/get-products', (req, res) => {
    let { email, id, tag } = req.body;

    if(id){
        docRef = db.collection('products').doc(id)
    } else if(tag){
        docRef = docRef = db.collection('products').where('tags', 'array-contains', tag)
    } else{
        docRef = db.collection('products').where('email', '==', email)
    }

    docRef.get()
    .then(products => {
        if(products.empty){
            return res.json('no products');
        }
        let productArr = [];
        if(id){
            return res.json(products.data());
        } else{
            products.forEach(item => {
                let data = item.data();
                data.id = item.id;
                productArr.push(data);
            })
            res.json(productArr)
        }
    }) 
})

app.post('/delete-product', (req, res) => {
    let { id } = req.body;

    db.collection('products').doc(id).delete()
    .then(data => {
        res.json('success');
    }).catch(err => {
        res.json('err');
    })
})

// product page
app.get('/products/:id', (req, res) => {
    res.sendFile(path.join(staticPath, "product.html"));
})

app.get('/search/:key', (req, res) => {
    res.sendFile(path.join(staticPath, "search.html"));
})

app.get('/cart', (req, res) => {
    res.sendFile(path.join(staticPath, "cart.html"));
})

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(staticPath, "checkout.html"));
})

//stripe
let stripeGateway = stripe(process.env.STRIPE_PRIVATE_KEY);

let SERVER_URL = process.env.SERVER_URL;

app.post('/order', async (req, res) => {
    try{
        const session = await stripeGateway.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: `${SERVER_URL}/checkout?session_id={CHECKOUT_SESSION_ID}&order=${JSON.stringify(req.body)}`,
            cancel_url: `${SERVER_URL}/checkout?payment_fail=true`,
            line_items: req.body.items.map(item => {
                return{
                    price_data: {
                        currency: 'kes',
                        product_data: {
                            name: item.name,
                            description: item.shortDes,
                            images: [item.image]
                        },
                        unit_amount: item.sellingPrice * 100
                    },
                    quantity: item.item
                }
            }),
        })
        res.json(session.url)
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

app.get('/success', async (req, res) => {
    let { order, session_id } = req.query;

    try{
        const session = await stripeGateway.checkout.sessions.retrieve(session_id);
        const customer = await stripeGateway.customers.retrieve(session.customer);

        let date = new Date();

        let orders_collection = collection(db, 'orders');
        let docName = `${customer.email}-order-${date.getTime()}`;

        setDoc(doc(orders_collection, docName), JSON.parse(order))
        .then(data => {
            res.redirect('/checkout?payment=done')
        })
    } catch{
        res.redirect('/404');
    }
})

// 404 route
app.get('/404', (req, res) => {
    res.sendFile(path.join(staticPath, "404.html"));
})

app.use((req, res) => {
    res.redirect('/404');
})

app.listen(3000, () => {
    console.log('listening on port 3000...');
})