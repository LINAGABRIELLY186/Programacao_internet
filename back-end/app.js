"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const RepositorioDePostagem_1 = require("./RepositorioDePostagem");
const Postagem_1 = require("./Postagem");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const repositorio = new RepositorioDePostagem_1.RepositorioDePostagens();
// Configurações do Express
app.use(express_1.default.json());
// Configuração básica do CORS
app.use((0, cors_1.default)());
// Povoar o repositório com postagens iniciais
repositorio.povoar();
// Endpoint para raiz
const PATH = '/socialifpi/postagem';
const PATH_ID = PATH + '/:id';
const PATH_CURTIR = PATH_ID + '/curtir';
const PATH_COMENTAR = PATH_ID + '/comentar';
const PATH_REAGIR = PATH_ID + '/reagir';
const PATH_DENUNCIAR = PATH_ID + '/denunciar';
app.post(PATH_COMENTAR, (req, res) => {
    const id = parseInt(req.params.id);
    const { autor, texto } = req.body;
    const sucesso = repositorio.adicionarComentario(id, autor, texto);
    if (!sucesso) {
        res.status(404).json({ message: 'Postagem não encontrada' });
        return;
    }
    res.status(200).json({ message: 'Comentário adicionado com sucesso' });
});
// Endpoint para listar comentários de uma postagem
app.get(PATH_ID + '/comentarios', (req, res) => {
    const id = parseInt(req.params.id);
    const postagem = repositorio.consultar(id);
    if (!postagem) {
        res.status(404).json({ message: 'Postagem não encontrada' });
        return;
    }
    res.json(postagem.getComentarios());
});
//Denunciar + denuncias
app.post(PATH_DENUNCIAR, (req, res) => {
    const id = parseInt(req.params.id);
    const { autor, texto } = req.body;
    const sucesso = repositorio.adicionarDenuncia(id, autor, texto);
    if (!sucesso) {
        res.status(404).json({ message: 'Postagem não encontrada' });
        return;
    }
    res.status(200).json({ message: 'Denúncia adicionada com sucesso' });
});
app.get(PATH_ID + '/denuncias', (req, res) => {
    const id = parseInt(req.params.id);
    const postagem = repositorio.consultar(id);
    if (!postagem) {
        res.status(404).json({ message: 'Postagem não encontrada' });
        return;
    }
    res.json(postagem.getDenuncias());
});
// Endpoint para listar todas as postagens
app.get(PATH, (req, res) => {
    const postagens = repositorio.listar();
    res.json(postagens);
});
// Endpoint para consultar uma postagem pelo ID
app.get(PATH_ID, (req, res) => {
    const id = parseInt(req.params.id);
    const postagem = repositorio.consultar(id);
    if (!postagem) {
        res.status(404).json({ message: 'Postagem não encontrada' });
        return;
    }
    res.json(postagem);
});
// Endpoint para incluir uma nova postagem
app.post(PATH, (req, res) => {
    const { titulo, conteudo, data, curtidas, reacoes } = req.body;
    const novaPostagem = new Postagem_1.Postagem(0, titulo, conteudo, new Date(data), curtidas || 0, reacoes || { Risos: 0, Surpresa: 0, Raiva: 0, Choro: 0 });
    const postagemIncluida = repositorio.incluir(novaPostagem);
    res.status(201).json(postagemIncluida);
});
// Endpoint para alterar uma postagem existente
app.put(PATH_ID, (req, res) => {
    const id = parseInt(req.params.id);
    const { titulo, conteudo, data, curtidas } = req.body;
    const sucesso = repositorio.alterar(id, titulo, conteudo, data, curtidas);
    if (!sucesso) {
        res.status(404).json({ message: 'Postagem não encontrada' });
        return;
    }
    res.status(200).json({ message: 'Postagem alterada com sucesso' });
});
// Endpoint para excluir uma postagem pelo ID
app.delete(PATH_ID, (req, res) => {
    const id = parseInt(req.params.id);
    const sucesso = repositorio.excluir(id);
    if (!sucesso) {
        res.status(404).json({ message: 'Postagem não encontrada' });
        return;
    }
    res.status(200).json({ message: 'Postagem excluída com sucesso' });
});
// Endpoint para curtir uma postagem pelo ID
// Endpoint para curtir uma postagem pelo ID e retornar a quantidade de curtidas
app.post(PATH_CURTIR, (req, res) => {
    const id = parseInt(req.params.id);
    const curtidas = repositorio.curtir(id);
    if (curtidas == null) {
        res.status(404).json({ message: 'Postagem não encontrada' });
        return;
    }
    res.json({ message: 'Postagem curtida com sucesso', curtidas });
});
//Endpoint para reagir a uma postagem pelo ID
app.post(PATH_REAGIR, (req, res) => {
    const id = parseInt(req.params.id);
    const { emoji } = req.body;
    if (!emoji) {
        res.status(400).json({ message: 'Emoji não informado' });
        return;
    }
    const sucesso = repositorio.adicionarReacao(id, emoji);
    if (!sucesso) {
        res.status(404).json({ message: 'Postagem não encontrada' });
        return;
    }
    const postagemAtualizada = repositorio.consultar(id);
    res.json({ message: 'Reação adicionada com sucesso', reacoes: postagemAtualizada === null || postagemAtualizada === void 0 ? void 0 : postagemAtualizada.getReacoes() });
});
// Inicializar o servidor na porta 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
app.use((req, res, next) => {
    res.status(404).send('Não encontrado');
});
