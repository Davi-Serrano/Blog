//Carrgenado Modulos
    const express = require("express")
    const handlebars = require("express-handlebars")
    const bodyParser = require("body-parser")
    const app = express()
    const admin = require("./routes/admin")
    const path = require("path")
    const mongoose = require("mongoose")
    const session = require("express-session")
    const flash = require("connect-flash")
    require("./models/Postagem")
    const Postagem = mongoose.model("postagens")
    require("./models/Categoria")
    const Categoria = mongoose.model("categorias")
    const usuarios = require("./routes/usuario")
    const passport = require("passport")
    require("./config/alph")(passport)
    require("./views/layouts/index")
   
//Config
    //Sessão
    app.use(session({
        secret: "cursodenode",
        resave: true,
        saveUninitialized: true
    }))
    app.use(passport.initialize()) 
    app.use(passport.session())
    app.use(flash())
    //Middleeare
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash('success_msg')
        res.locals.error_msg = req.flash('error_msg')
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null; 
        next()
    })

    //Body Parser
    app.use(bodyParser.urlencoded({extend: true}))
    app.use(bodyParser.json())

    //Handlebars
    app.engine('handlebars', handlebars({
        defaultLayout: "main",
        extname: '.handlebars'
}));
    app.set("view engine", 'handlebars')

    //Mongoose
    mongoose.connect('mongodb://localhost/primeirosite', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true}).then(()=> {
    console.log('MongoDB conectado')
}).catch((err)=> {
    console.log('Erro ao se conectar: ' + err)
})

    // Public
        app.use(express.static(path.join(__dirname,"public")))

        //Rotas
    app.get("/", (req, res) =>{ 
        Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) =>{
            res.render("index", {postagens: postagens})
        }).catch((err) =>{
            console.log(err)
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/404")
        })
    })
    //Pag que exibe as postagens
    app.get("/postagens/:slug", (req, res) =>{
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem) =>{
            if(postagem){
                res.render("Postagem/index", {postagem: postagem})
            }else{
                req.flash("error_msg", "Esta postagem não existe")
                res.redirect("/")
            }
        }).catch((err) =>{
            req.flash("error_msg", "Hpuve um erro interno")
            res.redirect("/")
        })
    })
    //Pag que exibe as categorias
    app.get("/categorias", (req, res) =>{
        Categoria.find().lean().then( (categorias) =>{
                res.render("categorias/index", {categorias: categorias})
            }).catch((err) =>{
                req.flash("error_msg", "Houve um erro interno")
                res.render("/")
            })
    })
//Pag que exibe uma categoria especifica
    app.get("/categorias/:slug", (req, res) =>{
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) =>{
            if(categoria){
                Postagem.find({categoria: categoria._id}).lean().then((postagens) =>{
                    res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
                }).catch((err) =>{
                    req.flash("error_msg", "Houve um erro ao listar os posts!")
                    res.redirect("/")
                })


            }else{
                req.flash("error_msg", "Está categoria não existe!")
                res.redirect("/")
            }

        }).catch((err) =>{
            req.flash("error_msg", "Houve um erro interno")
            res.render("/")
        })
    })

    app.get("/404", (req, res) =>{
        res.send("Erro 404")
    })
    app.get("/sobre", (req, res) =>{
        res.render("categorias/sobre")
    })
    //Routes Admin
    app.use("/admin", admin)
    //Routes usuario
    app.use("/usuarios", usuarios)

//Outros
const PORT =  8081  
    app.listen(PORT, () => {
        console.log("Servidor Rodando")
    })