import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { OptionsWithUri } from 'request';

export class ElevenLabsSpeechToText implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ElevenLabs Speech-to-Text',
		name: 'elevenLabsSpeechToText',
		icon: 'file:elevenlabs.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Converta áudio em texto usando a API da ElevenLabs',
		defaults: {
			name: 'ElevenLabs STT',
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
				description: 'Fonte do arquivo de áudio para transcrição',
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
				description: 'URL do arquivo de áudio para transcrição',
			},
			{
				displayName: 'Modelo',
				name: 'model',
				type: 'options',
				options: [
					{
						name: 'Scribe v1',
						value: 'scribe_v1',
					},
					{
						name: 'Scribe v1 Experimental',
						value: 'scribe_v1_experimental',
					}
				],
				default: 'scribe_v1',
				description: 'Modelo de transcrição a ser usado',
			},
			{
				displayName: 'Opções Avançadas',
				name: 'advancedOptions',
				type: 'collection',
				placeholder: 'Adicionar Opção',
				default: {},
				options: [
					{
						displayName: 'Código de Idioma',
						name: 'languageCode',
						type: 'string',
						default: '',
						placeholder: 'pt, en, es, fr...',
						description: 'Código ISO-639-1 ou ISO-639-3 do idioma do áudio. Se não especificado, o idioma será detectado automaticamente.',
					},
					{
						displayName: 'Diarização',
						name: 'diarization',
						type: 'boolean',
						default: false,
						description: 'Identificar diferentes falantes no áudio',
					},
					{
						displayName: 'Timestamps',
						name: 'timestampsGranularity',
						type: 'options',
						options: [
							{
								name: 'Nenhum',
								value: 'none',
							},
							{
								name: 'Palavra',
								value: 'word',
							},
							{
								name: 'Caractere',
								value: 'character',
							},
						],
						default: 'word',
						description: 'Granularidade dos timestamps no texto transcrito',
					},
					{
						displayName: 'Marcar Eventos de Áudio',
						name: 'tagAudioEvents',
						type: 'boolean',
						default: true,
						description: 'Marcar eventos de áudio como (risos), (passos), etc.',
					},
					{
						displayName: 'Número Máximo de Falantes',
						name: 'numSpeakers',
						type: 'number',
						typeOptions: {
							minValue: 1,
							maxValue: 32,
						},
						default: 1,
						description: 'Número máximo de falantes no áudio (1-32)',
					},
					{
						displayName: 'Formato de Arquivo',
						name: 'fileFormat',
						type: 'options',
						options: [
							{
								name: 'Outro',
								value: 'other',
							},
							{
								name: 'PCM 16-bit 16kHz',
								value: 'pcm_s16le_16',
							}
						],
						default: 'other',
						description: 'O formato do áudio de entrada',
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
				const audioSource = this.getNodeParameter('audioSource', i) as string;
				const model = this.getNodeParameter('model', i) as string;
				const advancedOptions = this.getNodeParameter('advancedOptions', i) as {
					languageCode?: string;
					diarization?: boolean;
					timestampsGranularity?: string;
					tagAudioEvents?: boolean;
					numSpeakers?: number;
					fileFormat?: string;
				};

				const credentials = await this.getCredentials('elevenLabsApi');

				const formData: Record<string, any> = {
					model_id: model,
				};
				
				// Adicionar configurações avançadas
				if (advancedOptions.languageCode) {
					formData.language_code = advancedOptions.languageCode;
				}
				
				if (advancedOptions.diarization !== undefined) {
					formData.diarize = advancedOptions.diarization;
				}
				
				if (advancedOptions.timestampsGranularity !== undefined) {
					formData.timestamps_granularity = advancedOptions.timestampsGranularity;
				}
				
				if (advancedOptions.tagAudioEvents !== undefined) {
					formData.tag_audio_events = advancedOptions.tagAudioEvents;
				}
				
				if (advancedOptions.numSpeakers !== undefined) {
					formData.num_speakers = advancedOptions.numSpeakers;
				}
				
				if (advancedOptions.fileFormat !== undefined) {
					formData.file_format = advancedOptions.fileFormat;
				}

				const options: OptionsWithUri = {
					headers: {
						'xi-api-key': credentials.apiKey,
						'Accept': 'application/json',
					},
					method: 'POST',
					uri: 'https://api.elevenlabs.io/v1/speech-to-text',
					formData,
					json: true,
				};

				if (audioSource === 'binaryFile') {
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
					const binaryData = items[i].binary?.[binaryPropertyName];
					
					if (!binaryData) {
						throw new NodeOperationError(this.getNode(), 'Nenhum dado binário encontrado');
					}

					const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
					
					options.formData!.file = {
						value: buffer,
						options: {
							filename: binaryData.fileName || 'audio.mp3',
							contentType: binaryData.mimeType,
						},
					};
				} else {
					const audioUrl = this.getNodeParameter('audioUrl', i) as string;
					options.formData!.cloud_storage_url = audioUrl;
				}

				const response = await this.helpers.request(options);

				returnData.push({
					json: response,
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
} 