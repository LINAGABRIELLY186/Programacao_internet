"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositorioDePostagens = void 0;
const Postagem_1 = require("./Postagem");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class RepositorioDePostagens {
    constructor() {
        this.postagens = [];
        this.nextId = 1;
        this.arquivoDados = path_1.default.join(__dirname, 'dados.json');
        this.carregarDados();
    }
    carregarDados() {
        try {
            if (fs_1.default.existsSync(this.arquivoDados)) {
                const dados = fs_1.default.readFileSync(this.arquivoDados, 'utf-8');
                const dadosParseados = JSON.parse(dados);
                this.postagens = dadosParseados.postagens.map((p) => {
                    const postagem = new Postagem_1.Postagem(p.id, p.titulo, p.conteudo, new Date(p.data), p.curtidas, p.reacoes || {});
                    p.comentarios.forEach((c) => {
                        postagem.adicionarComentario(c.autor, c.texto, new Date(c.data));
                    });
                    p.denuncias.forEach((c) => {
                        postagem.adicionarDenuncia(c.autor, c.texto, new Date(c.data));
                    });
                    return postagem;
                });
                this.nextId = dadosParseados.nextId || this.postagens.length + 1;
            }
        }
        catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }
    salvarDados() {
        try {
            const dadosParaSalvar = {
                postagens: this.postagens.map(p => ({
                    id: p.getId(),
                    titulo: p.getTitulo(),
                    conteudo: p.getConteudo(),
                    data: p.getData().toISOString(),
                    curtidas: p.getCurtidas(),
                    comentarios: p.getComentarios().map(c => ({
                        autor: c.getAutor(),
                        texto: c.getTexto(),
                        data: c.getData().toISOString()
                    })),
                    reacoes: p.getReacoes(),
                    denuncias: p.getDenuncias().map(c => ({
                        autor: c.getAutor(),
                        texto: c.getTexto(),
                        data: c.getData().toISOString()
                    }))
                })),
                nextId: this.nextId
            };
            fs_1.default.writeFileSync(this.arquivoDados, JSON.stringify(dadosParaSalvar, null, 2));
        }
        catch (error) {
            console.error('Erro ao salvar dados:', error);
        }
    }
    incluir(postagem) {
        postagem['id'] = this.nextId++;
        this.postagens.push(postagem);
        this.salvarDados();
        return postagem;
    }
    alterar(id, titulo, conteudo, data, curtidas) {
        const postagem = this.consultar(id);
        if (postagem) {
            postagem['titulo'] = titulo;
            postagem['conteudo'] = conteudo;
            postagem['data'] = data;
            postagem['curtidas'] = curtidas;
            this.salvarDados();
            return true;
        }
        return false;
    }
    adicionarComentario(idPostagem, autor, texto) {
        const postagem = this.consultar(idPostagem);
        if (postagem) {
            postagem.adicionarComentario(autor, texto);
            this.salvarDados();
            return true;
        }
        return false;
    }
    adicionarDenuncia(id, autor, texto) {
        const postagem = this.consultar(id);
        if (!postagem)
            return false;
        postagem.adicionarDenuncia(autor, texto);
        this.salvarDados();
        return true;
    }
    adicionarReacao(id, emoji) {
        const postagem = this.consultar(id);
        if (!postagem)
            return false;
        postagem.reagir(emoji);
        this.salvarDados();
        return true;
    }
    consultar(id) {
        return this.postagens.find(postagem => postagem.getId() === id);
    }
    excluir(id) {
        const index = this.postagens.findIndex(postagem => postagem.getId() === id);
        if (index !== -1) {
            this.postagens.splice(index, 1);
            this.salvarDados();
            return true;
        }
        return false;
    }
    curtir(id) {
        const postagem = this.consultar(id);
        if (postagem) {
            postagem['curtidas'] = postagem.getCurtidas() + 1;
            this.salvarDados();
            return postagem.getCurtidas();
        }
        return null;
    }
    gerarDataAleatoria(anosPassados = 5) {
        const hoje = new Date();
        const anoInicial = hoje.getFullYear() - anosPassados;
        const anoAleatorio = Math.floor(Math.random() * (hoje.getFullYear() - anoInicial)) + anoInicial;
        const mesAleatorio = Math.floor(Math.random() * 12);
        const diaAleatorio = Math.floor(Math.random() * 28) + 1;
        return new Date(anoAleatorio, mesAleatorio, diaAleatorio);
    }
    povoar() {
        this.incluir(new Postagem_1.Postagem(1, 'A Importância da Educação', 'A educação é a base para uma sociedade mais justa e equitativa. ' +
            'Ela promove o desenvolvimento individual e coletivo, ' +
            'permitindo que pessoas realizem seu potencial. ' +
            'Investir em educação é investir no futuro de todos nós.', this.gerarDataAleatoria(), 10));
        // ... (outras postagens de exemplo)
    }
    listar() {
        return [...this.postagens].sort((a, b) => new Date(b.getData()).getTime() - new Date(a.getData()).getTime());
    }
}
exports.RepositorioDePostagens = RepositorioDePostagens;
