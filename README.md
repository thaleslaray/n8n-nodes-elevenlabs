# n8n-nodes-elevenlabs

Este pacote contém um nó para n8n que permite integrar a API de Speech-to-Text da ElevenLabs em seus workflows.

## Funcionalidades

- Conversão de áudio para texto usando a API da ElevenLabs
- Suporte para entrada de áudio via arquivo binário ou URL
- Suporte para os modelos:
  - Scribe v1
  - Scribe v1 Experimental
- Opções avançadas:
  - Definição de código de idioma
  - Diarização (identificação de diferentes falantes)
  - Timestamps com diferentes granularidades (palavra, caractere)
  - Marcação de eventos de áudio (risos, passos, etc.)
  - Configuração do número máximo de falantes
  - Formato do arquivo de áudio

## Instalação

### No n8n

1. Vá para **Configurações** > **Community Nodes**
2. Selecione **Install**
3. Digite `n8n-nodes-elevenlabs` no campo de pesquisa
4. Clique em instalar

### Manualmente

```bash
npm install @thaleslaray/n8n-nodes-elevenlabs
```

## Configuração

1. Obtenha sua chave de API em https://elevenlabs.io/account
2. No n8n, vá para **Credenciais** e adicione uma nova credencial do tipo **ElevenLabs API**
3. Insira sua chave de API no campo correspondente

## Uso

### Opções básicas

1. Adicione o nó "ElevenLabs Speech-to-Text" ao seu workflow
2. Selecione a fonte do áudio:
   - **Arquivo Binário**: Use um arquivo de áudio de um nó anterior (ex: HTTP Request)
   - **URL**: Use um link direto para um arquivo de áudio ou URL do Cloud Storage
3. Escolha o modelo de transcrição desejado:
   - **Scribe v1**: Modelo padrão para transcrição
   - **Scribe v1 Experimental**: Versão experimental do modelo Scribe

### Opções avançadas

- **Código de Idioma**: Especifique o código ISO-639-1 ou ISO-639-3 do idioma do áudio para melhorar o desempenho da transcrição
- **Diarização**: Ative para identificar diferentes falantes no áudio
- **Timestamps**: Escolha a granularidade dos timestamps:
  - **Nenhum**: Sem timestamps
  - **Palavra**: Timestamps por palavra (padrão)
  - **Caractere**: Timestamps por caractere (mais preciso)
- **Marcar Eventos de Áudio**: Identifica e marca eventos como risos, aplausos, etc.
- **Número Máximo de Falantes**: Defina o número máximo de falantes esperados no áudio (1-32)
- **Formato de Arquivo**: Especifique o formato do arquivo de áudio:
  - **Outro**: Para formatos comuns como MP3, WAV, etc.
  - **PCM 16-bit 16kHz**: Para arquivos de áudio PCM específicos

## Formatos de áudio suportados

A API suporta diversos formatos de áudio, incluindo:
- MP3
- WAV
- FLAC
- AAC
- OGG
- MP4
- AIFF
- WebM

## Formatos de vídeo suportados

Também é possível extrair e transcrever o áudio de arquivos de vídeo nos seguintes formatos:
- MP4
- AVI
- MKV
- MOV
- WMV
- FLV
- WebM
- MPEG
- 3GPP

## Exemplos de uso

### Transcrever um arquivo de áudio em português

1. Use um nó HTTP Request para baixar um arquivo de áudio ou use o nó Read Binary File para ler um arquivo local
2. Conecte esse nó ao nó ElevenLabs Speech-to-Text
3. Configure o nó para usar o modelo "Scribe v1"
4. Nas opções avançadas, defina o código de idioma como "pt" para português
5. Execute o workflow para obter a transcrição

### Transcrever uma conferência com múltiplos participantes

1. Forneça o arquivo de áudio da conferência
2. Selecione o modelo "Scribe v1"
3. Nas opções avançadas:
   - Ative "Diarização"
   - Defina "Número Máximo de Falantes" de acordo com o número de participantes
   - Ative "Timestamps" com granularidade "Palavra"
4. Execute o workflow para obter a transcrição com identificação de falantes

## Desenvolvimento

1. Clone este repositório
2. Instale as dependências: `npm install`
3. Compile o código: `npm run build`
4. Crie um link simbólico: `npm link`
5. No diretório de instalação do n8n: `npm link n8n-nodes-elevenlabs`

## Publicação

1. Atualize a versão no package.json
2. Faça o build: `npm run build`
3. Publique no npm: `npm publish --access public`

## Licença

MIT 