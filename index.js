const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const AppError = require('./AppError')

const Product = require('./models/product')
const Farm = require('./models/farm')
const { name } = require('ejs')

mongoose.connect('mongodb://127.0.0.1:27017/farms')
.then(() => {
    console.log('CONNECTION OPEN')
})
.catch(err => {
    console.log('CONNECTION ERROR')
    console.log(err)
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))

const categories = ['fruit', 'vegetable', 'dairy']




// FARM ROUTES

app.get('/farms', async (req, res) => {
    const farms = await Farm.find({})
    res.render('farms/index', { farms })
})

app.get('/farms/new', (req, res) => {
    res.render('farms/new')
})

app.get('/farms/:id', async  (req, res) => {
    const farm = await Farm.findById(req.params.id).populate('products');
    console.log(farm)
    res.render('farms/show', { farm })
})

app.post('/farms', async (req, res) => {
    const farm = new Farm(req.body);
    await farm.save();
    res.redirect('/farms')
})

app.get('/farms/:id/products/new', async (req, res) => {
    const { id } = req.params;
    const farm = await Farm.findById(id)
    res.render('products/new', { categories, farm })
})

app.post('/farms/:id/products', async (req, res) => {
    const { name, price, category } = req.body;
    const { id } = req.params; 
    const farm = await Farm.findById(id);
    const product  = new Product({name, price, category});
    farm.products.push(product);
    product.farm = farm;
    await farm.save();
    await product.save();
    res.redirect(`/farms/${id}`)
})

app.delete('/farms/:id', async (req, res) => {
    const { id } = req.params
    const farm = await Farm.findByIdAndDelete(id);
    res.redirect('/farms');
})





// PRODUCTS ROUTES
app.get('/products',  wrapAsync(async (req, res) => {
    const {category} = req.query
    if(category){
        const products = await Product.find({category})
        res.render('products/index', {products, category})
    }else{
        const products = await Product.find({})
        res.render('products/index', {products, category: 'All'})
    }
}))

app.get('/products/new', (req, res) => {
    res.render('products/new', {categories})
})

function wrapAsync(fn){  // 'fn' is equal to each of the async functions in each API routes
    return function(req, res, next){    //  Callback function which catches the 'req' from the user
        fn(req, res, next).catch(e => next(e))   // 'fn' function is then called, having req, res and next as the arguments  
    }
}

app.get('/products/:id', wrapAsync(async (req, res, next) => {
    const {id} = req.params
    const product = await Product.findById(id).populate('farm')
    res.render('products/show', {product})
}))

app.get('/products/:id/edit', wrapAsync(async (req, res) => {
    const {id} = req.params
    const product = await Product.findById(id)
    res.render('products/edit', {product, categories}) 
}))

app.post('/products', wrapAsync(async (req, res) => {
    const newProduct = new Product(req.body)
    await newProduct.save()
    res.redirect(`/products/${newProduct._id}`)
}))

app.put('/products/:id', wrapAsync(async (req, res) => {
    const {id} = req.params
    const product = await Product.findByIdAndUpdate(id, req.body, {runValidators: true, new: true})
    res.redirect(`/products/${product._id}`)
}))

app.delete('/products/:id',  wrapAsync(async (req, res) => {
    const {id} = req.params
    const deletedProduct = await Product.findByIdAndDelete(id)
    res.redirect('/products')
}))

const handleValidationErr = err => {
    console.dir(err);
    return new AppError(`Validation failed...${err.message}`, 400);
}

const handleCastError = err => {
    return new AppError(`Query failed...${err.message}`, 404);
}

app.use((err, req, res, next) => {
    console.log(err.name)
    if(err.name === 'ValidationError') err = handleValidationErr(err)
    else if(err.name === 'CastError') err = handleCastError(err)
    next(err)
})

app.use((err, req, res, next) => {
    const {status = 500, message = 'Something went wrong'} = err;
    res.status(status).send(message)
})

app.listen(3000, () => {
    console.log('LISTENING ON PORT 3000!')
})