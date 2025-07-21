"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function getById(id) {
    return document.getElementById(id);
}
const apiUrl = process.env.API_URL || 'http://localhost:3000/socialifpi/postagem';

var Reacao;
(function (Reacao) {
    Reacao["risos"] = "Risos";
    Reacao["surpresa"] = "Surpresa";
    Reacao["raiva"] = "Raiva";
    Reacao["choro"] = "Choro";
})(Reacao || (Reacao = {}));
// Função para listar todas as postagens
function listarPostagens() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(apiUrl);
            const postagens = yield response.json();
            const postagensElement = getById('postagens');
            if (postagensElement) {
                postagensElement.innerHTML = '';
                postagens.forEach(postagem => {
                    const article = document.createElement('article');
                    article.style.position = 'relative';
                    // Cria elementos da postagem
                    const titulo = document.createElement('h2');
                    titulo.textContent = postagem.titulo;
                    const conteudo = document.createElement('p');
                    conteudo.textContent = postagem.conteudo;
                    const data = document.createElement('p');
                    data.className = 'data';
                    data.textContent = new Date(postagem.data).toLocaleDateString();
                    // Cria um container horizontal
                    const infoContainer = document.createElement('div');
                    infoContainer.className = 'info-postagem';
                    // CURTIDAS
                    const curtidas = document.createElement('p');
                    curtidas.textContent = `Curtidas: ${postagem.curtidas}`;
                    curtidas.style.fontWeight = 'bold';
                    curtidas.style.margin = '0';
                    // REAÇÕES
                    const reacoes = postagem.reacoes || {};
                    const reacoesP = document.createElement('p');
                    reacoesP.className = 'reacoes';
                    reacoesP.style.fontWeight = 'bold';
                    reacoesP.style.margin = '0';
                    // Emojis mapeados
                    const emojiMap = {
                        [Reacao.risos]: "😄",
                        [Reacao.surpresa]: "😮",
                        [Reacao.raiva]: "😡",
                        [Reacao.choro]: "😢"
                    };
                    Object.keys(Reacao).forEach((key) => {
                        var _a;
                        const tipo = Reacao[key];
                        const emoji = emojiMap[tipo];
                        const span = document.createElement('span');
                        span.style.marginRight = '10px';
                        span.style.cursor = 'pointer';
                        span.textContent = `${emoji} ${(_a = reacoes[tipo]) !== null && _a !== void 0 ? _a : 0}`;
                        span.addEventListener('click', () => {
                            reagirPostagem(postagem.id, tipo, reacoesP);
                        });
                        reacoesP.appendChild(span);
                    });
                    // Adiciona ao container horizontal
                    infoContainer.appendChild(curtidas);
                    infoContainer.appendChild(reacoesP);
                    const botaoCurtir = document.createElement('button');
                    botaoCurtir.textContent = 'Curtir';
                    botaoCurtir.addEventListener('click', () => curtirPostagem(postagem.id, curtidas));
                    // Botão para comentários
                    const botaoComentarios = document.createElement('button');
                    botaoComentarios.textContent = 'Mostrar Comentários';
                    botaoComentarios.style.marginLeft = '10px';
                    let comentariosVisiveis = false;
                    botaoComentarios.addEventListener('click', () => {
                        comentariosVisiveis = !comentariosVisiveis;
                        botaoComentarios.textContent = comentariosVisiveis
                            ? 'Ocultar Comentários'
                            : 'Mostrar Comentários';
                        const comentariosContainer = article.querySelector('.comentarios');
                        if (comentariosVisiveis) {
                            if (!comentariosContainer) {
                                exibirComentarios(postagem.id, article);
                            }
                        }
                        else if (comentariosContainer) {
                            comentariosContainer.remove();
                        }
                    });
                    const botaoMostrarDenuncias = document.createElement('button');
                    botaoMostrarDenuncias.textContent = 'Mostrar Denúncias';
                    botaoMostrarDenuncias.style.marginLeft = '10px';
                    let denunciasVisiveis = false;
                    botaoMostrarDenuncias.addEventListener('click', () => {
                        denunciasVisiveis = !denunciasVisiveis;
                        botaoMostrarDenuncias.textContent = denunciasVisiveis
                            ? 'Ocultar Denúncias'
                            : 'Mostrar Denúncias';
                        const denunciasContainer = article.querySelector('.denuncias');
                        if (denunciasVisiveis) {
                            if (!denunciasContainer) {
                                exibirDenuncias(postagem.id, article);
                            }
                        }
                        else if (denunciasContainer) {
                            denunciasContainer.remove();
                        }
                    });
                    // ========== MENU KEBAB ========== questão 3
                    const menuContainer = document.createElement('div');
                    menuContainer.className = 'kebab-menu-container';
                    const botaoMenu = document.createElement('button');
                    botaoMenu.className = 'kebab-button';
                    botaoMenu.textContent = '⋮';
                    const menuDropdown = document.createElement('ul');
                    menuDropdown.className = 'kebab-dropdown';
                    menuDropdown.style.display = 'none';
                    const itemExcluir = document.createElement('li');
                    itemExcluir.textContent = 'Excluir';
                    itemExcluir.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                        const confirmar = window.confirm('Tem certeza que deseja excluir esta postagem?');
                        if (confirmar) {
                            try {
                                const response = yield fetch(`${apiUrl}/${postagem.id}`, {
                                    method: 'DELETE'
                                });
                                if (response.ok) {
                                    listarPostagens(); // Recarrega a lista
                                }
                                else {
                                    const erro = yield response.json();
                                    alert('Erro ao excluir: ' + erro.message);
                                }
                            }
                            catch (error) {
                                console.error('Erro ao excluir:', error);
                            }
                        }
                    }));
                    const itemDenunciar = document.createElement('li');
                    itemDenunciar.textContent = 'Denunciar';
                    itemDenunciar.addEventListener('click', () => denunciarPostagem(postagem.id, article));
                    const itemCompartilhar = document.createElement('li');
                    itemCompartilhar.innerHTML = 'Enviar <i class="fab fa-whatsapp" style="color: green; margin-left: 4px;"></i>';
                    itemCompartilhar.style.marginTop = '5px';
                    itemCompartilhar.addEventListener('click', () => {
                        const url = `${window.location.origin}/postagem/${postagem.id}`;
                        const mensagem = `Confira essa postagem: ${postagem.titulo}\n${url}`;
                        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
                        window.open(whatsappUrl, '_blank');
                    });
                    menuDropdown.appendChild(itemExcluir);
                    menuDropdown.appendChild(itemDenunciar);
                    menuDropdown.appendChild(itemCompartilhar);
                    botaoMenu.addEventListener('click', () => {
                        menuDropdown.style.display = menuDropdown.style.display === 'none' ? 'block' : 'none';
                    });
                    document.addEventListener('click', (e) => {
                        if (!menuContainer.contains(e.target)) {
                            menuDropdown.style.display = 'none';
                        }
                    });
                    menuContainer.appendChild(botaoMenu);
                    menuContainer.appendChild(menuDropdown);
                    // ========== FIM MENU KEBAB ==========
                    // Adiciona elementos ao artigo
                    article.appendChild(titulo);
                    article.appendChild(conteudo);
                    article.appendChild(data);
                    article.appendChild(infoContainer);
                    article.appendChild(botaoCurtir);
                    article.appendChild(botaoComentarios);
                    article.appendChild(botaoMostrarDenuncias);
                    article.appendChild(menuContainer);
                    postagensElement.appendChild(article);
                });
            }
        }
        catch (error) {
            console.error('Erro ao carregar postagens:', error);
        }
    });
}
// Função para curtir postagem
function curtirPostagem(id, curtidasElement) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${apiUrl}/${id}/curtir`, {
                method: 'POST'
            });
            const result = yield response.json();
            curtidasElement.textContent = `Curtidas: ${result.curtidas}`;
        }
        catch (error) {
            console.error('Erro ao curtir postagem:', error);
        }
    });
}
// Função para reagir
function reagirPostagem(id, tipoReacao, reacoesElement) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${apiUrl}/${id}/reagir`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emoji: tipoReacao })
            });
            if (!response.ok) {
                const textoErro = yield response.text();
                throw new Error(`Falha ao reagir à postagem: ${response.status} - ${textoErro}`);
            }
            const result = yield response.json();
            // Atualiza o elemento das reações no frontend
            const reacoes = result.reacoes;
            // Mapa para emojis — adapte conforme seus emojis visuais
            const emojiMap = {
                Risos: '😄',
                Surpresa: '😮',
                Raiva: '😡',
                Choro: '😢'
            };
            // Monta o texto atualizado para o elemento
            let texto = '';
            for (const [chave, emoji] of Object.entries(emojiMap)) {
                texto += `${emoji} ${reacoes[chave] || 0}  `;
            }
            reacoesElement.textContent = texto.trim();
        }
        catch (error) {
            console.error('Erro ao reagir à postagem:', error);
        }
    });
}
// Função para incluir nova postagem
function incluirPostagem() {
    return __awaiter(this, void 0, void 0, function* () {
        const tituloInput = document.getElementById('titulo');
        const conteudoInput = document.getElementById('conteudo');
        if (tituloInput && conteudoInput && tituloInput.value && conteudoInput.value) {
            try {
                const novaPostagem = {
                    titulo: tituloInput.value,
                    conteudo: conteudoInput.value,
                    data: new Date().toISOString(),
                    curtidas: 0
                };
                const response = yield fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(novaPostagem)
                });
                if (response.ok) {
                    listarPostagens();
                    tituloInput.value = '';
                    conteudoInput.value = '';
                }
            }
            catch (error) {
                console.error('Erro ao adicionar postagem:', error);
            }
        }
    });
}
// Função para exibir comentários
function exibirComentarios(postagemId, articleElement) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${apiUrl}/${postagemId}/comentarios`);
            const comentarios = yield response.json();
            // Ordena por data decrescente (mais recente primeiro) - questao 4
            comentarios.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
            const comentariosContainer = document.createElement('div');
            comentariosContainer.className = 'comentarios';
            const tituloComentarios = document.createElement('h3');
            tituloComentarios.textContent = 'Comentários';
            comentariosContainer.appendChild(tituloComentarios);
            if (comentarios.length === 0) {
                const semComentarios = document.createElement('p');
                semComentarios.textContent = 'Nenhum comentário ainda. Seja o primeiro!';
                comentariosContainer.appendChild(semComentarios);
            }
            else {
                comentarios.forEach(comentario => {
                    const comentarioElement = document.createElement('div');
                    comentarioElement.className = 'comentario';
                    const autor = document.createElement('strong');
                    autor.textContent = comentario.autor;
                    const texto = document.createElement('p');
                    texto.textContent = comentario.texto;
                    const data = document.createElement('small');
                    data.textContent = new Date(comentario.data).toLocaleString();
                    comentarioElement.appendChild(autor);
                    comentarioElement.appendChild(texto);
                    comentarioElement.appendChild(data);
                    comentariosContainer.appendChild(comentarioElement);
                });
            }
            // Formulário para novo comentário
            const formComentario = document.createElement('form');
            formComentario.className = 'form-comentario';
            const inputAutor = document.createElement('input');
            inputAutor.type = 'text';
            inputAutor.placeholder = 'Seu nome';
            inputAutor.required = true;
            const textareaComentario = document.createElement('textarea');
            textareaComentario.placeholder = 'Seu comentário';
            textareaComentario.required = true;
            textareaComentario.rows = 3;
            const botaoComentar = document.createElement('button');
            botaoComentar.type = 'submit';
            botaoComentar.textContent = 'Comentar';
            formComentario.appendChild(inputAutor);
            formComentario.appendChild(textareaComentario);
            formComentario.appendChild(botaoComentar);
            formComentario.addEventListener('submit', (e) => __awaiter(this, void 0, void 0, function* () {
                e.preventDefault();
                if (inputAutor.value && textareaComentario.value) {
                    try {
                        yield adicionarComentario(postagemId, inputAutor.value, textareaComentario.value);
                        // Recarrega os comentários
                        const containerExistente = articleElement.querySelector('.comentarios');
                        if (containerExistente) {
                            containerExistente.remove();
                        }
                        exibirComentarios(postagemId, articleElement);
                        inputAutor.value = '';
                        textareaComentario.value = '';
                    }
                    catch (error) {
                        console.error('Erro ao adicionar comentário:', error);
                    }
                }
            }));
            comentariosContainer.appendChild(formComentario);
            articleElement.appendChild(comentariosContainer);
        }
        catch (error) {
            console.error('Erro ao carregar comentários:', error);
        }
    });
}
function exibirDenuncias(postagemId, articleElement) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${apiUrl}/${postagemId}/denuncias`);
            const denuncias = yield response.json();
            // Ordena por data decrescente
            denuncias.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
            const denunciasContainer = document.createElement('div');
            denunciasContainer.className = 'denuncias';
            const tituloDenuncias = document.createElement('h3');
            tituloDenuncias.textContent = 'Denúncias';
            denunciasContainer.appendChild(tituloDenuncias);
            if (denuncias.length === 0) {
                const semDenuncias = document.createElement('p');
                semDenuncias.textContent = 'Nenhuma denúncia até o momento.';
                denunciasContainer.appendChild(semDenuncias);
            }
            else {
                denuncias.forEach((denuncia) => {
                    const denunciaElement = document.createElement('div');
                    denunciaElement.className = 'comentario denuncia';
                    const autor = document.createElement('strong');
                    autor.textContent = denuncia.autor;
                    const texto = document.createElement('p');
                    texto.textContent = denuncia.texto || '(sem texto)'; // fallback visual
                    const data = document.createElement('small');
                    data.textContent = new Date(denuncia.data).toLocaleString();
                    denunciaElement.appendChild(autor);
                    denunciaElement.appendChild(texto);
                    denunciaElement.appendChild(data);
                    denunciasContainer.appendChild(denunciaElement);
                });
            }
            articleElement.appendChild(denunciasContainer);
        }
        catch (error) {
            console.error('Erro ao carregar denúncias:', error);
        }
    });
}
function denunciarPostagem(postagemId, articleElement) {
    return __awaiter(this, void 0, void 0, function* () {
        // Evita criar múltiplas caixas
        if (articleElement.querySelector('.form-denuncia-container'))
            return;
        // Cria o container com fundo escuro (pode ser usado como modal também)
        const container = document.createElement('div');
        container.className = 'form-denuncia-container';
        const formBox = document.createElement('div');
        formBox.className = 'form-denuncia-box';
        const titulo = document.createElement('h3');
        titulo.textContent = 'Denunciar Postagem';
        titulo.className = 'form-denuncia-titulo';
        const botaoFechar = document.createElement('span');
        botaoFechar.className = 'form-denuncia-fechar';
        botaoFechar.textContent = '✖';
        botaoFechar.title = 'Fechar';
        botaoFechar.addEventListener('click', () => {
            container.remove();
        });
        const form = document.createElement('form');
        form.className = 'form-denuncia';
        const inputAutor = document.createElement('input');
        inputAutor.type = 'text';
        inputAutor.placeholder = 'Seu nome';
        inputAutor.className = 'input-denuncia';
        inputAutor.required = true;
        const textarea = document.createElement('textarea');
        textarea.placeholder = 'Motivo da denúncia';
        textarea.className = 'textarea-denuncia';
        textarea.required = true;
        textarea.rows = 4;
        const botaoEnviar = document.createElement('button');
        botaoEnviar.type = 'submit';
        botaoEnviar.className = 'botao-enviar-denuncia';
        botaoEnviar.textContent = 'Enviar';
        form.appendChild(inputAutor);
        form.appendChild(textarea);
        form.appendChild(botaoEnviar);
        form.addEventListener('submit', (e) => __awaiter(this, void 0, void 0, function* () {
            e.preventDefault();
            try {
                yield enviarDenuncia(postagemId, inputAutor.value, textarea.value);
                alert('Denúncia enviada com sucesso!');
                container.remove();
            }
            catch (error) {
                console.error('Erro ao enviar denúncia:', error);
                alert('Erro ao enviar denúncia.');
            }
        }));
        formBox.appendChild(titulo);
        formBox.appendChild(botaoFechar);
        formBox.appendChild(form);
        container.appendChild(formBox);
        articleElement.appendChild(container);
    });
}
function enviarDenuncia(postagemId, autor, texto) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`${apiUrl}/${postagemId}/denunciar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ autor, texto })
        });
        if (!response.ok) {
            throw new Error('Falha ao enviar denúncia');
        }
    });
}
// Função para adicionar comentário
function adicionarComentario(postagemId, autor, texto) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`${apiUrl}/${postagemId}/comentar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ autor, texto })
        });
        if (!response.ok) {
            throw new Error('Falha ao adicionar comentário');
        }
    });
}
// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    listarPostagens();
    const botaoNovaPostagem = getById('botaoNovaPostagem');
    if (botaoNovaPostagem) {
        botaoNovaPostagem.addEventListener('click', incluirPostagem);
    }
});
