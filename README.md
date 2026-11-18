# ☠️ INSANOS M.C. – Sistema de Presença, Eventos & Galeria (v1.0)

Aplicativo oficial para os irmãos do **INSANOS M.C. – DIVISÃO MOGI GUAÇU** confirmarem presença nos eventos, encontros e responsabilidades postadas pela diretoria, além de gerenciar escalas e álbum de fotos.

> *"SOMOS DE VERDADE"*

---

## 🚀 Versão 1.0 – Recursos Oficiais

### 🔒 1. Portão de Segurança Frontal & Sessão de 7 Dias
- **Bloqueio Obrigatório na Entrada**: O sistema só exibe dados (integrantes, calendário, presenças e fotos) após a validação da senha.
- **Lembrar Aparelho por 7 Dias**: O navegador/celular grava o acesso automaticamente por 7 dias. Após esse período, solicita a senha novamente.
- **Desconexão Rápida**: Botão "Sair" desloga o aparelho instantaneamente.

### 🔑 2. Gestão de Senhas da Divisão
- **Acesso dos Irmãos**: Senha padrão inicial `ISSI` (não diferencia maiúsculas de minúsculas).
- **Acesso da Diretoria**: Senha padrão `diretoriamg`.
- **Alteração pelo Painel**: A Diretoria pode alterar tanto a senha administrativa quanto a **senha geral dos irmãos** diretamente na aba "Configurações".

### 📸 3. Galeria de Fotos dos Eventos
- Upload simultâneo de fotos para cada evento.
- **Compressão Automática no Celular**: Imagens são otimizadas para JPEG (~150KB–250KB) antes do envio, economizando dados e espaço no banco.
- Visualizador com Lightbox em tela cheia e opção de exclusão pela diretoria.
- Capa/Flyer oficial opcional no topo da confirmação do evento.

### 📅 4. Calendário & Confirmação de Presença
- Calendário mensal interativo com destaque de compromissos oficiais.
- Confirmação em 1 toque:
  - ✅ **Eu vou.**
  - ❌ **Não vou.** (com chips rápidos: *"Social + Sede"*, *"Trabalho"*, *"Família"*, etc., e justificativa livre)
  - ⚠️ **Ainda não sei.**
- **Exportação para WhatsApp**: Copia a lista diagramada e formatada no padrão oficial do INSANOS M.C. com um clique.

### 🛡️ 5. Painel de Controle da Diretoria
- Cadastro, edição, inativação e reordenação de integrantes da lista oficial.
- Criação e edição de eventos e compromissos.
- Personalização do nome da divisão e lema do motoclube.
- Monitor de integridade do armazenamento (banco local JSON e suporte a PostgreSQL / MongoDB).

---

## ⚡ Como Rodar o Sistema Localmente

### Opção 1: Atalho Rápido (Windows)
Dois cliques no arquivo **`iniciar.bat`**.

### Opção 2: Pelo Terminal
```bash
npm start
```
Acesse no navegador:
👉 **`http://localhost:3001`**

Para os irmãos acessarem na mesma rede Wi-Fi, digite o IP da sua máquina na porta `3001` (ex: `http://192.168.1.100:3001`).

---

## 🌐 Publicação em Nuvem (Render / Vercel / GitHub)
A pasta pronta para publicação direta no GitHub / Render sem pastas pesadas é:
👉 **`C:\Cois\Issi-Pronto-Para-GitHub`**
