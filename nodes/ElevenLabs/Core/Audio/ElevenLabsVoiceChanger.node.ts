import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { createBaseOptions, handleApiError } from '../../utils';

export class ElevenLabsVoiceChanger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ElevenLabs Voice Changer',
		name: 'elevenLabsVoiceChanger',
		icon: 'file:../../elevenlabs.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Modifique vozes de arquivos de áudio usando a API da ElevenLabs',
		defaults: {
			name: 'ElevenLabs Voice Changer',
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
						name: 'Transformar Voz',
						value: 'changeVoice',
						description: 'Converter áudio de uma voz para outra',
						action: 'Convert audio from one voice to another',
					},
				],
				default: 'changeVoice',
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
				displayName: 'ID da Voz de Destino',
				name: 'voiceId',
				type: 'string',
				required: true,
				default: '',
				description: 'ID da voz para a qual o áudio será convertido',
				placeholder: 'ex: 21m00Tcm4TlvDq8ikWAM',
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
						displayName: 'Similaridade com Voz Original',
						name: 'similarityBoost',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 1,
							numberPrecision: 2,
						},
						default: 0.75,
						description: 'Quão semelhante à voz original o resultado deve ser (0-1)',
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
						description: 'Estabilidade da voz (0-1). Valores mais altos fazem a voz mais consistente',
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
						displayName: 'Tipo de Áudio de Entrada',
						name: 'audioType',
						type: 'options',
						options: [
							{
								name: 'Fala',
								value: 'speech',
							},
							{
								name: 'Canto',
								value: 'singing',
							},
						],
						default: 'speech',
						description: 'Tipo de áudio na entrada',
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
					audioType?: string;
				};

				// Preparar o formData para a requisição
				const formData: Record<string, any> = {
					voice_id: voiceId,
					voice_settings: {},
				};

				// Adicionar configurações avançadas
				if (advancedOptions.similarityBoost !== undefined) {
					formData.voice_settings.similarity_boost = advancedOptions.similarityBoost;
				}

				if (advancedOptions.stability !== undefined) {
					formData.voice_settings.stability = advancedOptions.stability;
				}
				
				if (advancedOptions.outputFormat !== undefined) {
					formData.output_format = advancedOptions.outputFormat;
				}
				
				if (advancedOptions.audioType !== undefined) {
					formData.audio_type = advancedOptions.audioType;
				}

				// Configurar a requisição
				const options = await createBaseOptions.call(this, 'voice-changer', 'POST', undefined, formData);
				
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
				const filename = `voice_changed_${Date.now()}.${fileExtension}`;
				
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