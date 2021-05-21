const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const Postagem = new Schema({
    titulo:{
        type: String,
        required: true
    },
    slug:{
        type: String,
        required: true
    },
    descri:{
        type: String,
        required: true
    },
    conteudo:{
        type: String,
        required: true
    },
    categoria:{
        type: Schema.Types.ObjectId,
        ref: "categorias",
        required: true
    },
    date:{
        type: Date,
        defaut: Date.now()
    }
})

mongoose.model("postagens", Postagem)