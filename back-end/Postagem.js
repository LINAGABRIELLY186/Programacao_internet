"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Denuncia = exports.Comentario = exports.Postagem = void 0;
class Postagem {
    constructor(id, titulo, conteudo, data, curtidas, reacoes = {}) {
        this.reacoes = {
            Risos: 0,
            Surpresa: 0,
            Raiva: 0,
            Choro: 0
        };
        this.id = id;
        this.titulo = titulo;
        this.conteudo = conteudo;
        this.data = data;
        this.curtidas = curtidas;
        this.comentarios = [];
        this.reacoes = reacoes;
        this.denuncias = [];
    }
    getComentarios() {
        return this.comentarios;
    }
    adicionarComentario(autor, texto, data) {
        this.comentarios.push(new Comentario(autor, texto, data !== null && data !== void 0 ? data : new Date()));
    }
    reagir(emoji) {
        this.reacoes[emoji] = (this.reacoes[emoji] || 0) + 1;
    }
    getDenuncias() {
        return this.denuncias;
    }
    adicionarDenuncia(autor, texto, data) {
        this.denuncias.push(new Denuncia(autor, texto, data !== null && data !== void 0 ? data : new Date()));
    }
    getReacoes() {
        return this.reacoes;
    }
    getId() {
        return this.id;
    }
    getTitulo() {
        return this.titulo;
    }
    getConteudo() {
        return this.conteudo;
    }
    getData() {
        return this.data;
    }
    getCurtidas() {
        return this.curtidas;
    }
}
exports.Postagem = Postagem;
class Comentario {
    constructor(autor, texto, data) {
        this.autor = autor;
        this.texto = texto;
        this.data = data;
    }
    getAutor() {
        return this.autor;
    }
    getTexto() {
        return this.texto;
    }
    getData() {
        return this.data;
    }
}
exports.Comentario = Comentario;
class Denuncia {
    constructor(autor, texto, data) {
        this.autor = autor;
        this.texto = texto;
        this.data = data;
    }
    getAutor() {
        return this.autor;
    }
    getTexto() {
        return this.texto;
    }
    getData() {
        return this.data;
    }
}
exports.Denuncia = Denuncia;
