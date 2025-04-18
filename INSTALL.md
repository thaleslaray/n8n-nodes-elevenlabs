# Guia de Instalação e Atualização - n8n-nodes-elevenlabs

Este guia explica como instalar e manter os nós ElevenLabs para n8n, com atenção especial para evitar a perda dos nós durante atualizações.

## Instalação

### Método 1: Instalação via npm (recomendado para ambientes de produção)

```bash
npm install @thaleslaray/n8n-nodes-elevenlabs
```

Este comando instala o pacote no diretório de módulos do n8n.

#### Para n8n instalado globalmente

Se você instalou o n8n globalmente, execute:

```bash
cd /usr/local/lib/node_modules/n8n
npm install @thaleslaray/n8n-nodes-elevenlabs
```

#### Para n8n instalado em pasta específica

```bash
cd /caminho/para/pasta/n8n
npm install @thaleslaray/n8n-nodes-elevenlabs
```

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

Para uso com PM2:

```bash
#!/bin/bash
# update-n8n.sh

# Parar o serviço n8n
pm2 stop n8n

# Atualizar o n8n
npm update -g n8n

# Reinstalar nós personalizados
cd /usr/local/lib/node_modules/n8n
npm install @thaleslaray/n8n-nodes-elevenlabs

# Reiniciar o serviço
pm2 start n8n
```

#### Opção 4: Instalação em ambiente Docker

Se você estiver usando Docker, inclua a instalação do pacote no seu Dockerfile:

```dockerfile
FROM n8nio/n8n:latest

RUN npm install @thaleslaray/n8n-nodes-elevenlabs
```

Para instância Docker já em execução:

```bash
# Acesse o contêiner do n8n
docker exec -it seu-container-n8n /bin/bash

# Dentro do contêiner, instale o pacote
npm install @thaleslaray/n8n-nodes-elevenlabs

# Saia e reinicie o contêiner
exit
docker restart seu-container-n8n
```

#### Opção 5: Uso com Docker Compose

Adicione um volume personalizado no seu arquivo docker-compose.yml e instale pacotes externos nesse volume:

```yaml
version: '3'
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    volumes:
      - ~/.n8n:/home/node/.n8n
      - ./custom-nodes:/custom-nodes
    environment:
      - N8N_CUSTOM_EXTENSIONS=/custom-nodes
    command: >
      sh -c "cd /custom-nodes && npm install @thaleslaray/n8n-nodes-elevenlabs && n8n start"
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

Para resolver problemas mais complexos de permissão:
```bash
# Verifique o proprietário da pasta node_modules
ls -la /caminho/para/n8n/node_modules

# Altere o proprietário se necessário
sudo chown -R seu-usuario:seu-grupo /caminho/para/n8n/node_modules
```

### O n8n não reconhece os nós

Verifique se o caminho de instalação do n8n está correto e se o diretório `node_modules` do n8n contém a pasta `@thaleslaray/n8n-nodes-elevenlabs`.

```bash
# Verifique onde o n8n está instalado
which n8n

# Verifique se o pacote está instalado
ls -la /caminho/para/n8n/node_modules/@thaleslaray
```

### Versões incompatíveis

Verifique a compatibilidade entre a versão do seu n8n e a versão do pacote:

```bash
# Verifique a versão do n8n
n8n --version

# Verifique a versão do pacote
npm list @thaleslaray/n8n-nodes-elevenlabs
```

Você pode precisar atualizar ou fazer downgrade da versão do pacote para garantir a compatibilidade. O pacote é compatível com n8n versão 0.214.0 e superior.

### Logs de erro

Se os nós ainda não aparecerem, verifique os logs de erro:

```bash
# Para n8n executando no modo normal
n8n start

# Para n8n executando como serviço via systemd
sudo journalctl -u n8n

# Para n8n executando com PM2
pm2 logs n8n
```

## Usando os nós ElevenLabs

Após a instalação bem-sucedida, você encontrará os seguintes nós disponíveis no n8n:

1. **ElevenLabs Text-to-Speech** - Converte texto em fala
2. **ElevenLabs Speech-to-Text** - Converte áudio em texto
3. **ElevenLabs Voice Changer** - Modifica vozes
4. **ElevenLabs Sound Effects** - Adiciona efeitos sonoros
5. **ElevenLabs Speech to Speech** - Converte fala de uma voz para outra
6. **ElevenLabs Agents** - Interação com agentes conversacionais da ElevenLabs
7. **ElevenLabs Knowledge Base** - Interação com bases de conhecimento da ElevenLabs

Para configurar qualquer um desses nós, você precisará de uma chave de API da ElevenLabs, que pode ser obtida em [https://elevenlabs.io/](https://elevenlabs.io/) após criar uma conta. 