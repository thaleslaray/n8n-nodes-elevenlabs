import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { createBaseOptions, handleApiError, formatReturnData } from '../utils';

export class ElevenLabsTextToSpeech implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ElevenLabs Text-to-Speech',
		name: 'elevenLabsTextToSpeech',
		icon: 'file:../elevenlabs.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Converta texto em fala usando a API da ElevenLabs',
		defaults: {
			name: 'ElevenLabs TTS',
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
				displayName: 'Voz',
				name: 'voiceId',
				type: 'string',
				default: '',
				required: true,
				description: 'ID da voz a ser usada para a síntese de fala',
				placeholder: 'ex: 21m00Tcm4TlvDq8ikWAM',
			},
			{
				displayName: 'Texto',
				name: 'text',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				required: true,
				description: 'Texto a ser convertido em fala',
			},
			{
				displayName: 'Modelo',
				name: 'modelId',
				type: 'options',
				options: [
					{
						name: 'Eleven Multilingual v2',
						value: 'eleven_multilingual_v2',
					},
					{
						name: 'Eleven Turbo v2',
						value: 'eleven_turbo_v2',
					},
					{
						name: 'Eleven English v1',
						value: 'eleven_english_v1',
					},
					{
						name: 'Eleven Multilingual v1',
						value: 'eleven_multilingual_v1',
					},
					{
						name: 'Eleven Monolingual v1',
						value: 'eleven_monolingual_v1',
					},
					{
						name: 'Eleven Flash v2.5',
						value: 'eleven_flash_v2.5',
					},
				],
				default: 'eleven_multilingual_v2',
				description: 'Modelo de síntese de fala a ser usado',
			},
			{
				displayName: 'Nome do Campo Binário',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				description: 'Nome do campo binário onde o áudio gerado será armazenado',
			},
			{
				displayName: 'Opções Avançadas',
				name: 'advancedOptions',
				type: 'collection',
				placeholder: 'Adicionar Opção',
				default: {},
				options: [
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
						description: 'Estabilidade da voz (0-1). Valores mais altos fazem a voz mais consistente entre gerações.',
					},
					{
						displayName: 'Similaridade',
						name: 'similarity_boost',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 1,
							numberPrecision: 2,
						},
						default: 0.75,
						description: 'Similaridade com a voz original (0-1). Valores mais altos fazem a voz mais próxima da voz original.',
					},
					{
						displayName: 'Estilo',
						name: 'style',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 1,
							numberPrecision: 2,
						},
						default: 0,
						description: 'Quantidade de estilo a ser transferido (0-1). Valores mais altos adicionam mais expressividade.',
					},
					{
						displayName: 'Formato de Saída',
						name: 'output_format',
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
							{
								name: 'Opus',
								value: 'opus',
							},
							{
								name: 'Ulaw',
								value: 'ulaw',
							},
							{
								name: 'Mulaw',
								value: 'mulaw',
							},
						],
						default: 'mp3_44100_128',
						description: 'Formato do arquivo de áudio gerado',
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
				const voiceId = this.getNodeParameter('voiceId', i) as string;
				const text = this.getNodeParameter('text', i) as string;
				const modelId = this.getNodeParameter('modelId', i) as string;
				const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
				const advancedOptions = this.getNodeParameter('advancedOptions', i) as {
					stability?: number;
					similarity_boost?: number;
					style?: number;
					output_format?: string;
				};

				// Construir corpo da requisição
				const body: Record<string, any> = {
					text,
					model_id: modelId,
					voice_settings: {},
				};

				// Adicionar configurações avançadas
				if (advancedOptions.stability !== undefined) {
					body.voice_settings.stability = advancedOptions.stability;
				}

				if (advancedOptions.similarity_boost !== undefined) {
					body.voice_settings.similarity_boost = advancedOptions.similarity_boost;
				}

				if (advancedOptions.style !== undefined) {
					body.voice_settings.style = advancedOptions.style;
				}
				
				if (advancedOptions.output_format !== undefined) {
					body.output_format = advancedOptions.output_format;
				}

				// Configurar a requisição
				const endpoint = `text-to-speech/${voiceId}`;
				const options = await createBaseOptions.call(this, endpoint, 'POST', body);
				
				// Esta API retorna dados binários, não JSON
				options.json = false;
				options.encoding = null; // Para receber dados binários
				options.headers!['Accept'] = '*/*';

				// Fazer a requisição
				const response = await this.helpers.request(options);
				
				// Determinar o tipo MIME e extensão do arquivo
				let mimeType = 'audio/mpeg';
				let fileExtension = 'mp3';
				
				if (advancedOptions.output_format) {
					if (advancedOptions.output_format === 'flac') {
						mimeType = 'audio/flac';
						fileExtension = 'flac';
					} else if (advancedOptions.output_format.startsWith('pcm_')) {
						mimeType = 'audio/wav';
						fileExtension = 'wav';
					} else if (advancedOptions.output_format === 'opus') {
						mimeType = 'audio/opus';
						fileExtension = 'opus';
					} else if (advancedOptions.output_format === 'ulaw' || advancedOptions.output_format === 'mulaw') {
						mimeType = 'audio/basic';
						fileExtension = 'au';
					}
				}

				// Criar dados binários
				const newItem: INodeExecutionData = {
					json: {},
					binary: {},
					pairedItem: { item: i },
				};
				
				// Obter um nome de arquivo com base no texto (limitado a 50 caracteres)
				const filename = `${text.substring(0, 50).replace(/[^a-zA-Z0-9]/g, '_')}.${fileExtension}`;
				
				newItem.binary![binaryPropertyName] = await this.helpers.prepareBinaryData(response, filename, mimeType);
				newItem.json = { success: true, voiceId, modelId };
				
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