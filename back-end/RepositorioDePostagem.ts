import { Postagem } from './Postagem';
import fs from 'fs';
import path from 'path';

export class RepositorioDePostagens {
    private postagens: Postagem[] = [];
    private nextId: number = 1;
    private arquivoDados: string = path.join(__dirname, 'dados.json');

    constructor() {
        this.carregarDados();
    }

    private carregarDados(): void {
        try {
            if (fs.existsSync(this.arquivoDados)) {
                const dados = fs.readFileSync(this.arquivoDados, 'utf-8');
                const dadosParseados = JSON.parse(dados);
                
                this.postagens = dadosParseados.postagens.map((p: any) => {
                    const postagem = new Postagem(
                        p.id,
                        p.titulo,
                        p.conteudo,
                        new Date(p.data),
                        p.curtidas,
                        p.reacoes || {}
                    );
                    
                    p.comentarios.forEach((c: any) => {
                        postagem.adicionarComentario(c.autor, c.texto, new Date(c.data));
                    });

                    p.denuncias.forEach((c: any) => {
                        postagem.adicionarDenuncia(c.autor, c.texto, new Date(c.data));
                    });
                    
                    return postagem;
                });
                
                this.nextId = dadosParseados.nextId || this.postagens.length + 1;
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }

    private salvarDados(): void {
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
            
            fs.writeFileSync(this.arquivoDados, JSON.stringify(dadosParaSalvar, null, 2));
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
        }
    }

    public incluir(postagem: Postagem): Postagem {
        postagem['id'] = this.nextId++;
        this.postagens.push(postagem);
        this.salvarDados();
        return postagem;
    }

    public alterar(id: number, titulo: string, conteudo: string, data: Date, curtidas: number): boolean {
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

    public adicionarComentario(idPostagem: number, autor: string, texto: string): boolean {
        const postagem = this.consultar(idPostagem);
        if (postagem) {
            postagem.adicionarComentario(autor, texto);
            this.salvarDados();
            return true;
        }
        return false;
    }

    public adicionarDenuncia(id: number, autor: string, texto: string): boolean {
        const postagem = this.consultar(id);
        if (!postagem) return false;
        postagem.adicionarDenuncia(autor, texto);
        this.salvarDados();
        return true;
    }

    public adicionarReacao(id: number, emoji: string): boolean {
        const postagem = this.consultar(id);
        if (!postagem) return false;

        postagem.reagir(emoji);
        this.salvarDados();
        return true;
    }

    public consultar(id: number): Postagem | undefined {
        return this.postagens.find(postagem => postagem.getId() === id);
    }

    public excluir(id: number): boolean {
        const index = this.postagens.findIndex(postagem => postagem.getId() === id);
        if (index !== -1) {
            this.postagens.splice(index, 1);
            this.salvarDados();
            return true;
        }
        return false;
    }

    public curtir(id: number): number | null {
        const postagem = this.consultar(id);
        if (postagem) {
            postagem['curtidas'] = postagem.getCurtidas() + 1;
            this.salvarDados();
            return postagem.getCurtidas();
        }
        return null;
    }

    private gerarDataAleatoria(anosPassados: number = 5): Date {
        const hoje = new Date();
        const anoInicial = hoje.getFullYear() - anosPassados;
        const anoAleatorio = Math.floor(Math.random() * (hoje.getFullYear() - anoInicial)) + anoInicial;
        const mesAleatorio = Math.floor(Math.random() * 12);
        const diaAleatorio = Math.floor(Math.random() * 28) + 1;
        return new Date(anoAleatorio, mesAleatorio, diaAleatorio);
    }

    public povoar(): void {
        this.incluir(new Postagem(
            1,
            'A Importância da Educação',
            'A educação é a base para uma sociedade mais justa e equitativa. ' +
            'Ela promove o desenvolvimento individual e coletivo, ' +
            'permitindo que pessoas realizem seu potencial. ' +
            'Investir em educação é investir no futuro de todos nós.',
            this.gerarDataAleatoria(),
            10
        ));
        // ... (outras postagens de exemplo)
    }

    public listar(): Postagem[] {
        return [...this.postagens].sort((a, b) => 
            new Date(b.getData()).getTime() - new Date(a.getData()).getTime()
        );
    }
}
