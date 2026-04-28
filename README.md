# ---

**🚀 Projeto Finanças \- React Native**

Este projeto é um ecossistema de controle financeiro pessoal, desenvolvido com foco em arquitetura modular, alta performance de banco de dados local e sincronização em nuvem.

## **🏗️ Arquitetura do Sistema**

O app foi construído seguindo princípios de separação de responsabilidades (Clean Architecture), garantindo que a lógica de interface não se misture com a lógica de dados.

### **Fluxo de Dados (Engenharia)**

1. **UI (React Native)**: Camada de interface utilizando useAppTheme para consistência visual (IEC Mutua Style).  
2. **Service Layer**:  
   * BibleService.js: Gerenciamento de SQLite local de alta performance.  
   * api.js: Instância Axios com tratamento matemático de erros.  
3. **Persistence Layer**:  
   * AsyncStorage: Armazenamento de estados e preferências de leitura.  
   * op-sqlite: Motor de banco de dados SQL nativo.  
4. **Cloud Layer**:  
   * Firebase Auth: Autenticação e segurança.  
   * Firestore: Sincronização de pedidos e dados de usuários.

## ---

**💾 Recursos e Documentação**

### **📂 Banco de Dados & Assets**

Devido ao tamanho das variações de versões e arquivos .db, o banco de dados completo está hospedado externamente.

🔗 [**BAIXAR BANCO DE DATOS (Google Drive)**](https://www.google.com/search?q=https://drive.google.com/drive/folders/1ZCMlu4jjkgjF5FE2hSosqMPlT_QVA8Jt?usp=sharing)

### **🎥 Demonstração em Vídeo**

Confira o fluxo de funcionamento, performance de transição de capítulos e integração com Firebase.

📺 [**ASSISTIR VÍDEO NO YOUTUBE**](https://www.google.com/search?q=COLOCAR_SEU_LINK_AQUI)

## ---

**🛠️ Esqueleto Técnico (Conexões e Fluxo)**

Abaixo, a representação da arquitetura de dados e dos serviços que sustentam a lógica do App **IEC de Mutuá**:

#### **📖 Motor da Bíblia (Local SQLite)**

Diferente de APIs REST comuns, o acesso às Escrituras é feito via **op-sqlite** para garantir leitura instantânea offline.

![Arquitetura SQLite e Configurações](.\screenshots\Gemini_Generated_Image_wg0k13wg0k13wg0k.png)

5. **openBible(versionFile)**: Gerencia a montagem dinâmica do banco de dados a partir dos assets.  
6. **getVerses(book, chapter)**: Consulta SQL otimizada para recuperação de textos.  
7. **getPrevious/NextChapter**: Lógica matemática para navegação entre livros e testamentos.

#### **☁️ Cloud & Interação (Firebase/Firestore)**

Estrutura NoSQL para gerenciamento de comunidade, agenda e pedidos de oração.

![Estrutura Completa do Firestore](.\screenshots\Gemini_Generated_Image_sjivrnsjivrnsjiv.png)

* **Coleções principais**: `agenda`, `pastores`, `pedidos` e `users`.
* **Segurança**: Regras de acesso baseadas no UID do Firebase Auth.

Endpoints lógicos utilizados para gerenciar a comunidade e persistência de usuário:

2. **Autenticação (auth)**:  
   * signIn/signUp: Gerenciamento de acesso via Firebase Auth.  
   * onAuthStateChanged: Listener para persistência de sessão.  
3. **Pedidos de Oração (/prayers)**:  
   * POST /prayers: Envio de novo pedido com categoria e status pending.  
   * GET /prayers: Recuperação de pedidos vinculados ao UID do usuário.  
   * UPDATE /status: Alteração lógica de pedidos (Lido/Arquivado).

#### **⚙️ Configurações e Preferências (AsyncStorage)**

Persistência de estado local para garantir que o usuário retorne exatamente onde parou:

* **SELECTED\_VERSION**: Armazena o ID da versão ativa (ex: 'NVI', 'ARA').  
* **READING\_POSITION**: Objeto matemático contendo bookId, chapter e verse.  
* **THEME\_MODE**: Persistência da preferência visual (Claro/Escuro).

#### **🔗 Serviços Externos (Axios)**

* **baseURL: https://bible-api.com/**: Fallback para consultas de versículos online e ferramentas de "Versículo do Dia".

### ---

**Por que essa estrutura?**

* **Matemática de Performance**: O banco local elimina o "loading" ao virar as páginas da Bíblia.  
* **Segurança Cloud**: O Firebase isola os dados sensíveis dos fiéis em um ambiente criptografado.  
* **Experiência do Usuário**: O AsyncStorage garante que o app seja "inteligente" e lembre das preferências sem precisar de login constante.

## 

## ---

**🎨 Identidade Visual (Tokens)**

O projeto utiliza uma paleta sóbria baseada na **IEC de Mutua**:

* **Primary**: \#C9A84C (Dourado)  
* **Background**: \#F5F5F5 (Light) / \#121212 (Dark)  
* **Surface**: Design baseado em Cards para fácil leitura de fluxos financeiros.

## ---

**🚀 Como Rodar o Projeto**

1. Clone o repositório.  
2. Instale as dependências: yarn install.  
3. Configure o arquivo de banco de dados na pasta assets/bibles.  
4. Execute o Metro Bundler: npx react-native start.  
5. Inicie no emulador: npx react-native run-android.

---

**Desenvolvido por um Desenvolvedor Junior focado em Mobile e Automação de Dados.**

### ---


