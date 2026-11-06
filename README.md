# Consumo e Endividamento: Duas Faces de uma Mesma Moeda?

Pitch acadêmico interativo desenvolvido para a disciplina de **História & Educação Financeira (8º Ano)**.

Uma aplicação web imersiva com navegação em formato 16:9, animações fluidas e elementos visuais vetoriais, otimizada para apresentações em tela cheia e publicação na web.

---

## 🚀 Demonstração & Deploy

O projeto é 100% estático (HTML5, CSS3, JavaScript Vanilla) e pronto para deploy imediato na **Vercel**:

1. Acesse o painel da [Vercel](https://vercel.com).
2. Clique em **Add New...** > **Project**.
3. Importe este repositório (`history`).
4. Mantenha o preset como **Other** (ou Static) com Root Directory como `./`.
5. Clique em **Deploy**.

---

## 📁 Estrutura do Projeto

```text
├── index.html       # Estrutura semântica dos 4 atos da apresentação e SVGs vetoriais
├── styles.css       # Estilização completa, variáveis globais de cor e layout 16:9
├── script.js        # Lógica de controle de slides, teclado, interatividade e animações
├── fonts/           # Tipografia local (EB Garamond & Inter) em formato WOFF2
├── vercel.json      # Configuração de cache e otimizações para a CDN da Vercel
└── .gitignore       # Arquivos ignorados pelo controle de versão
```

---

## 🎨 Tipografia e Recursos Locais

Todas as fontes e ilustrações são mantidas localmente para garantir funcionamento offline, tempos de carregamento instantâneos e independência de CDNs externas:
- **Títulos:** EB Garamond
- **Textos de apoio:** Inter
- **Gráficos e Ícones:** Vetores SVG nativos

---

## 💻 Execução Local

Você pode abrir o arquivo `index.html` diretamente no navegador ou iniciar um servidor local:

```bash
# Com Python 3:
python3 -m http.server 3000

# Ou usando Node / npx:
npx serve .
```

Acesse em `http://localhost:3000`.
