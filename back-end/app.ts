import express, { NextFunction, Request, Response } from 'express';
import { RepositorioDePostagens } from './RepositorioDePostagem';
import { Postagem } from './Postagem';
import cors from 'cors';
import path from 'path';

const app = express();
const repositorio = new RepositorioDePostagens();

// Servir arquivos estáticos da pasta 'static'
app.use(express.static(path.join(__dirname, 'static')));

app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'static/index.html'));
});


// Configurações do Express
app.use(express.json());

// Configuração básica do CORS
app.use(cors());

// Povoar o repositório com postagens iniciais
repositorio.povoar();

// Endpoint para raiz
const PATH: string = '/socialifpi/postagem';
const PATH_ID: string = PATH + '/:id';
const PATH_CURTIR = PATH_ID + '/curtir';
const PATH_COMENTAR = PATH_ID + '/comentar';
const PATH_REAGIR = PATH_ID + '/reagir';
const PATH_DENUNCIAR = PATH_ID + '/denunciar';

app.post(PATH_COMENTAR, (req: Request, res: Response) => {
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
app.get(PATH_ID + '/comentarios', (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const postagem = repositorio.consultar(id);
    
    if (!postagem) {
        res.status(404).json({ message: 'Postagem não encontrada' });
        return;
    }
    
    res.json(postagem.getComentarios());
});

//Denunciar + denuncias
app.post(PATH_DENUNCIAR, (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { autor, texto } = req.body;

    const sucesso = repositorio.adicionarDenuncia(id, autor, texto);

    if (!sucesso) {
        res.status(404).json({ message: 'Postagem não encontrada' });
        return;
    }

    res.status(200).json({ message: 'Denúncia adicionada com sucesso' });
});

app.get(PATH_ID + '/denuncias', (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const postagem = repositorio.consultar(id);

    if (!postagem) {
        res.status(404).json({ message: 'Postagem não encontrada' });
        return;
    }

    res.json(postagem.getDenuncias());
});


// Endpoint para listar todas as postagens
app.get(PATH, (req: Request, res: Response) => {
    const postagens = repositorio.listar();
    res.json(postagens);
});

// Endpoint para consultar uma postagem pelo ID
app.get(PATH_ID, (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const postagem = repositorio.consultar(id);
    
    if (!postagem) {
        res.status(404).json({ message: 'Postagem não encontrada' });
        return;
        
    } 

    res.json(postagem);
});

// Endpoint para incluir uma nova postagem
app.post(PATH, (req: Request, res: Response) => {
    const { titulo, conteudo, data, curtidas, reacoes } = req.body;
    const novaPostagem = new Postagem(0, titulo, conteudo, new Date(data), curtidas || 0, reacoes || { Risos: 0, Surpresa: 0, Raiva: 0, Choro: 0 });
    const postagemIncluida = repositorio.incluir(novaPostagem);
    res.status(201).json(postagemIncluida);
});

// Endpoint para alterar uma postagem existente
app.put(PATH_ID, (req: Request, res: Response) => {
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
app.delete(PATH_ID, (req: Request, res: Response) => {
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
app.post(PATH_CURTIR, (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const curtidas = repositorio.curtir(id);
    
    if (curtidas == null) {
        res.status(404).json({ message: 'Postagem não encontrada' });
        return;
        
    } 
    
    res.json({ message: 'Postagem curtida com sucesso', curtidas });
});

//Endpoint para reagir a uma postagem pelo ID
app.post(PATH_REAGIR, (req: Request, res: Response) => {
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
    res.json({ message: 'Reação adicionada com sucesso', reacoes: postagemAtualizada?.getReacoes() });
});

// Inicializar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).send('Não encontrado');
});
