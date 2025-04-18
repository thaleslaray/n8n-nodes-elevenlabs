# Guia de Instalação e Atualização - n8n-nodes-elevenlabs

Este guia explica como instalar e manter os nós ElevenLabs para n8n, com atenção especial para evitar a perda dos nós durante atualizações.

## Instalação

### Método 1: Instalação via npm (recomendado para ambientes de produção)

```bash
npm install @thaleslaray/n8n-nodes-elevenlabs
```

Este comando instala o pacote no diretório de módulos do n8n.

### Método 2: Instalação manual (para desenvolvimento)

1. Clone o repositório:
```bash
git clone https://github.com/thaleslaray/n8n-nodes-elevenlabs.git
```

2. Navegue até o diretório:
```bash
cd n8n-nodes-elevenlabs
```

3. Instale as dependências e compile:
```bash
npm install
npm run build
```

4. Crie um link simbólico:
```bash
npm link
```

5. Navegue até o diretório de instalação do n8n e vincule o pacote:
```bash
cd /caminho/para/seu/n8n
npm link @thaleslaray/n8n-nodes-elevenlabs
```

## Evitando a Perda de Nós Durante Atualizações

### Problema Comum

Um problema comum é que os nós personalizados podem desaparecer após atualizações do n8n. Isso geralmente acontece por uma das seguintes razões:

1. O n8n é atualizado e substitui toda a pasta de instalação
2. A pasta `node_modules` é limpa durante o processo de atualização
3. O npm não mantém referências a pacotes personalizados durante atualizações

### Soluções

#### Opção 1: Reinstalação após atualização do n8n

Após cada atualização do n8n, reinstale o pacote:

```bash
npm install @thaleslaray/n8n-nodes-elevenlabs
```

#### Opção 2: Instalação usando package.json (recomendado)

Adicione o pacote como uma dependência no arquivo `package.json` do seu n8n:

1. Localize o arquivo `package.json` no diretório de instalação do n8n
2. Adicione o pacote à seção `dependencies`:

```json
"dependencies": {
  // outras dependências
  "@thaleslaray/n8n-nodes-elevenlabs": "^0.3.1"
}
```

3. Execute `npm install` para atualizar as dependências

Dessa forma, quando você atualizar o n8n usando `npm update` ou similar, o npm automaticamente reinstalará os pacotes listados no package.json.

#### Opção 3: Uso de um script de pós-atualização

Crie um script que reinstale automaticamente o pacote após atualizações do n8n:

```bash
#!/bin/bash
# reinstall-custom-nodes.sh

# Atualizar o n8n
npm update -g n8n

# Reinstalar nós personalizados
npm install @thaleslaray/n8n-nodes-elevenlabs
```

#### Opção 4: Instalação global para contêineres Docker

Se você estiver usando Docker, certifique-se de incluir a instalação do pacote no seu Dockerfile:

```dockerfile
FROM n8nio/n8n:latest

RUN npm install @thaleslaray/n8n-nodes-elevenlabs
```

## Verificando a Instalação

Para verificar se os nós estão instalados corretamente:

1. Inicie o n8n
2. Verifique se os nós ElevenLabs aparecem na barra de pesquisa de nós
3. Se não aparecerem, verifique os logs de inicialização do n8n por erros

## Solução de Problemas

### Os nós desapareceram após a atualização

Execute:
```bash
npm install @thaleslaray/n8n-nodes-elevenlabs
```

### Erros de permissão

Se você encontrar erros de permissão, tente:
```bash
sudo npm install -g @thaleslaray/n8n-nodes-elevenlabs
```

### O n8n não reconhece os nós

Verifique se o caminho de instalação do n8n está correto e se o diretório `node_modules` do n8n contém a pasta `@thaleslaray/n8n-nodes-elevenlabs`.

### Versões incompatíveis

Verifique a compatibilidade entre a versão do seu n8n e a versão do pacote. Você pode precisar atualizar ou fazer downgrade da versão do pacote para garantir a compatibilidade. 