import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { createBaseOptions, handleApiError } from '../../utils';

export class ElevenLabsSpeechToSpeech implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ElevenLabs Speech to Speech',
		name: 'elevenLabsSpeechToSpeech',
		icon: 'file:../../elevenlabs.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Converte áudio de uma voz para outra usando a API da ElevenLabs',
		defaults: {
			name: 'ElevenLabs Speech to Speech',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'elevenLabsApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operação',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Converter Voz',
						value: 'convertSpeech',
						description: 'Converter áudio de uma voz para outra',
						action: 'Convert speech from one voice to another',
					},
				],
				default: 'convertSpeech',
			},
			{
				displayName: 'Fonte do Áudio',
				name: 'audioSource',
				type: 'options',
				options: [
					{
						name: 'Arquivo Binário',
						value: 'binaryFile',
					},
					{
						name: 'URL',
						value: 'url',
					},
				],
				default: 'binaryFile',
				description: 'Fonte do arquivo de áudio para processamento',
			},
			{
				displayName: 'Campo Binário',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				displayOptions: {
					show: {
						audioSource: ['binaryFile'],
					},
				},
				description: 'Nome do campo binário que contém o arquivo de áudio',
			},
			{
				displayName: 'URL do Áudio',
				name: 'audioUrl',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						audioSource: ['url'],
					},
				},
				description: 'URL do arquivo de áudio para processamento',
			},
			{
				displayName: 'ID da Voz',
				name: 'voiceId',
				type: 'string',
				default: '',
				required: true,
				description: 'ID da voz para a qual o áudio será convertido',
			},
			{
				displayName: 'Nome do Campo Binário de Saída',
				name: 'outputBinaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				description: 'Nome do campo binário onde o áudio processado será armazenado',
			},
			{
				displayName: 'Opções Avançadas',
				name: 'advancedOptions',
				type: 'collection',
				placeholder: 'Adicionar Opção',
				default: {},
				options: [
					{
						displayName: 'Aumento de Similaridade',
						name: 'similarityBoost',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 1,
							numberPrecision: 2,
						},
						default: 0.75,
						description: 'Quanto maior o valor, mais a voz resultante se parecerá com a voz original (0-1)',
					},
					{
						displayName: 'Estabilidade',
						name: 'stability',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 1,
							numberPrecision: 2,
						},
						default: 0.5,
						description: 'Quanto maior o valor, mais estável e menos variável será a voz (0-1)',
					},
					{
						displayName: 'Formato de Saída',
						name: 'outputFormat',
						type: 'options',
						options: [
							{
								name: 'MP3',
								value: 'mp3_44100_128',
							},
							{
								name: 'FLAC',
								value: 'flac',
							},
							{
								name: 'WAV',
								value: 'pcm_16000',
							},
							{
								name: 'PCM 16-bit 22.05kHz',
								value: 'pcm_22050',
							},
							{
								name: 'PCM 16-bit 24kHz',
								value: 'pcm_24000',
							},
							{
								name: 'PCM 16-bit 44.1kHz',
								value: 'pcm_44100',
							},
						],
						default: 'mp3_44100_128',
						description: 'Formato do arquivo de áudio gerado',
					},
					{
						displayName: 'Idioma de Origem',
						name: 'sourceLanguage',
						type: 'options',
						options: [
							{ name: 'Automático', value: 'auto' },
							{ name: 'Inglês', value: 'en' },
							{ name: 'Espanhol', value: 'es' },
							{ name: 'Português', value: 'pt' },
							{ name: 'Francês', value: 'fr' },
							{ name: 'Alemão', value: 'de' },
							{ name: 'Italiano', value: 'it' },
							{ name: 'Holandês', value: 'nl' },
							{ name: 'Japonês', value: 'ja' },
							{ name: 'Coreano', value: 'ko' },
							{ name: 'Chinês', value: 'zh' },
							{ name: 'Russo', value: 'ru' },
							{ name: 'Turco', value: 'tr' },
							{ name: 'Polonês', value: 'pl' },
							{ name: 'Árabe', value: 'ar' },
						],
						default: 'auto',
						description: 'Idioma do áudio de entrada',
					},
					{
						displayName: 'Idioma de Destino',
						name: 'targetLanguage',
						type: 'options',
						options: [
							{ name: 'Mesmo do Idioma de Origem', value: 'same' },
							{ name: 'Inglês', value: 'en' },
							{ name: 'Espanhol', value: 'es' },
							{ name: 'Português', value: 'pt' },
							{ name: 'Francês', value: 'fr' },
							{ name: 'Alemão', value: 'de' },
							{ name: 'Italiano', value: 'it' },
							{ name: 'Holandês', value: 'nl' },
							{ name: 'Japonês', value: 'ja' },
							{ name: 'Coreano', value: 'ko' },
							{ name: 'Chinês', value: 'zh' },
							{ name: 'Russo', value: 'ru' },
							{ name: 'Turco', value: 'tr' },
							{ name: 'Polonês', value: 'pl' },
							{ name: 'Árabe', value: 'ar' },
						],
						default: 'same',
						description: 'Idioma no qual o áudio será gerado',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				// Obter parâmetros
				const audioSource = this.getNodeParameter('audioSource', i) as string;
				const voiceId = this.getNodeParameter('voiceId', i) as string;
				const outputBinaryPropertyName = this.getNodeParameter('outputBinaryPropertyName', i) as string;
				const advancedOptions = this.getNodeParameter('advancedOptions', i) as {
					similarityBoost?: number;
					stability?: number;
					outputFormat?: string;
					sourceLanguage?: string;
					targetLanguage?: string;
				};

				// Preparar o formData para a requisição
				const formData: Record<string, any> = {
					voice_id: voiceId,
				};

				// Adicionar configurações avançadas
				if (advancedOptions.similarityBoost !== undefined) {
					formData.similarity_boost = advancedOptions.similarityBoost;
				}

				if (advancedOptions.stability !== undefined) {
					formData.stability = advancedOptions.stability;
				}

				if (advancedOptions.outputFormat !== undefined) {
					formData.output_format = advancedOptions.outputFormat;
				}

				if (advancedOptions.sourceLanguage !== undefined && advancedOptions.sourceLanguage !== 'auto') {
					formData.source_language = advancedOptions.sourceLanguage;
				}
				
				if (advancedOptions.targetLanguage !== undefined && advancedOptions.targetLanguage !== 'same') {
					formData.target_language = advancedOptions.targetLanguage;
				}

				// Configurar a requisição
				const options = await createBaseOptions.call(this, 'speech-to-speech', 'POST', undefined, formData);
				
				// Esta API retorna dados binários, não JSON
				options.json = false;
				options.encoding = null; // Para receber dados binários
				options.headers!['Accept'] = '*/*';

				// Adicionar o arquivo de áudio de acordo com a fonte selecionada
				if (audioSource === 'binaryFile') {
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
					const binaryData = items[i].binary?.[binaryPropertyName];
					
					if (!binaryData) {
						throw new NodeOperationError(this.getNode(), 'Nenhum dado binário encontrado');
					}

					const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
					
					options.formData!.audio = {
						value: buffer,
						options: {
							filename: binaryData.fileName || 'audio.mp3',
							contentType: binaryData.mimeType,
						},
					};
				} else {
					const audioUrl = this.getNodeParameter('audioUrl', i) as string;
					options.formData!.audio_url = audioUrl;
				}

				// Fazer a requisição
				const response = await this.helpers.request(options);
				
				// Determinar o tipo MIME e extensão do arquivo
				let mimeType = 'audio/mpeg';
				let fileExtension = 'mp3';
				
				if (advancedOptions.outputFormat) {
					if (advancedOptions.outputFormat === 'flac') {
						mimeType = 'audio/flac';
						fileExtension = 'flac';
					} else if (advancedOptions.outputFormat.startsWith('pcm_')) {
						mimeType = 'audio/wav';
						fileExtension = 'wav';
					}
				}

				// Criar um nome para o arquivo de saída
				const filename = `speech_to_speech_${Date.now()}.${fileExtension}`;
				
				// Criar dados binários
				const newItem: INodeExecutionData = {
					json: {
						success: true,
						voiceId,
						...advancedOptions,
					},
					binary: {},
					pairedItem: { item: i },
				};
				
				newItem.binary![outputBinaryPropertyName] = await this.helpers.prepareBinaryData(response, filename, mimeType);
				
				returnData.push(newItem);
			} catch (error) {
				const errorResult = handleApiError.call(this, error, i);
				if (errorResult) {
					returnData.push(errorResult);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
} 