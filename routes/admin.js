const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
const {eAdmin}= require("../helpers/eAdmin")

//Pag admin
router.get("/",  eAdmin, (req, res)=>{
    res.render("admin/index")
})
//Pag admin post
router.get("/posts", eAdmin, (req, res) =>{
    res.send("Página de posts")
})
//Pag admin categorias
router.get("/categorias", eAdmin, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/categorias", {categorias: categorias})
    }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao criar as categorias")
            req.redirect("/admin")
        })
    })

//Pag que add nova categoria
router.get("/categorias/add", eAdmin, (req, res) =>{
    res.render("admin/addcategorias")
})
 
//Add nova categoria
router.post("/categorias/nova", eAdmin, (req, res) =>{
    //Verifica condição de postagem
    var erros = []

    if(!req.body.nome){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.slug){
        erros.push({texto: "Slug inválido"})
    }

    if(erros.lenght > 0){
        res.render("admin/addcategorias", {erros: erros})
    }else {
    const novaCategoria = {
        nome: req.body.nome,
        slug: req.body.slug
    }
    new Categoria(novaCategoria).save().then(()=>{
        req.flash("success_msg", "Categoria criada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente!")
        res.redirect("/admin")
    })
}
})
//Pagina que edita categoria
router.get("/categorias/edit/:id", (req, res) =>{
    Categoria.findOne({_id:req.params.id}).lean().then((categoria) => {
        res.render("admin/editcategorias", {categoria: categoria})
    }).catch((err) => {
            req.flash("error_msg", "Está categoria não existe")
            res.redirect("/admin/categorias")
        })
        
})
//Edita categoria
router.post("/categorias/edit", eAdmin, (req, res) =>{

    Categoria.findOne({_id: req.body.id}).then((categoria) => {

        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() =>{
            req.flash("success_msg", "Categoria editada com sucesso!")
            res.redirect("/admin/categorias")
        })
        .catch((err) =>{
            req.flash("error_msg", "Houve um erro interno ao salvar a dição da categoria!")
            res.redirect("/admin/categorias")
        })
  
    }).catch((err) =>{
            req.flash("error_msg", "Houve um erro ao editar a categoria")
            res.redirect("/admin/categorias")
        })

})
//deleta categoria
router.post("/categorias/deletar", (req, res) =>{
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso")
        res.redirect("/admin/categorias")
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao deletar a categoria")
        res.redirect("/admin/categorias")
    })
})
//Pag de postagem
router.get("/postagens", eAdmin, (req, res) =>{
    Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) =>{
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao listar as postagens")
        res.redirect("/admin")
    })
  
})
//Paf que add postagem
router.get("/postagens/add", eAdmin, (req, res) =>{
    Categoria.find().lean().then((categorias) =>{
        res.render("admin/addpostagens", {categorias: categorias})
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao carregar o formulário!")
        res.redirect("/admin")
    })
})
//Add postagem
router.post("/postagens/nova", eAdmin, (req, res) =>{
    //verfica condições
    var erros = []

    if(!req.body.categoria == "0"){
        erros.push({texto: "Categoria inválida, resgistre uma categoria"})
    }
    if(erros.lenght > 0) {
        res.render("admin/addpostagens", {erros: erros})
    }else{
        const NovaPostagem = {
            titulo: req.body.titulo,
            descri: req.body.descri,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }


        new Postagem(NovaPostagem).save().then(() =>{
            req.flash("success_msg", "Postagem criada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err) =>{
            req.flash("Houve um erro durante o salvamento da postagem")
            res.redirect("/admin/postagens")
        })
    }
})
//Pag que edita as postgens
router.get("/postagens/edit/:id", eAdmin, (req, res) =>{

    Postagem.findOne({_id: req.params.id}).lean().then((postagem) =>{

        Categoria.find().lean().then((categorias) =>{
            res.render("admin/editpostagens",{categorias: categorias, postagem: postagem})
        }).catch((err) =>{
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect("/admin/postagens")
        })

    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao carregar o formulário")
        res.redirect("/admin/postagens")
    })

})   

//Edita as postgens
router.post("/postagens/edit", eAdmin, (req, res) =>{

    Postagem.findOne({_id: req.body.id}).then((postagem) =>{

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descri = req.body.descri
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(() =>{
            req.flash("success_msg", "Postagem editada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err) =>{
            req.flash("error_msg", "Erro interno!")
            res.redirect("/admin/postagens")
        })

    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao salvar a edição")
        res.redirect("/admin/postagens")
    })

})
//Deleta as postagens
router.post("/postagens/deletar/", eAdmin, (req, res) =>{ 
    Postagem.deleteOne({_id: req.body.id}).then(() => {
    req.flash("success_msg", "Postagem deletada com sucesso")
    res.redirect("/admin/postagens")
}).catch((err) =>{
    req.flash("error_msg", "Houve um erro ao deletar a categoria")
    res.redirect("/admin/postagens")
})
})

module.exports = router