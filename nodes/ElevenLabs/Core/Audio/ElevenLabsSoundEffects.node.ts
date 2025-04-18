import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { createBaseOptions, handleApiError } from '../../utils';

export class ElevenLabsSoundEffects implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ElevenLabs Sound Effects',
		name: 'elevenLabsSoundEffects',
		icon: 'file:../../elevenlabs.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Adicione efeitos sonoros a arquivos de áudio usando a API da ElevenLabs',
		defaults: {
			name: 'ElevenLabs Sound Effects',
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
						name: 'Adicionar Efeitos Sonoros',
						value: 'addSoundEffects',
						description: 'Adicionar efeitos sonoros a um áudio',
						action: 'Add sound effects to audio',
					},
				],
				default: 'addSoundEffects',
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
				displayName: 'Efeitos',
				name: 'effects',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				placeholder: 'Adicionar Efeito',
				default: {},
				options: [
					{
						name: 'effectsValues',
						displayName: 'Efeitos',
						values: [
							{
								displayName: 'Tipo de Efeito',
								name: 'effectType',
								type: 'options',
								options: [
									{
										name: 'Ambiente',
										value: 'ambience',
									},
									{
										name: 'Eco',
										value: 'echo',
									},
									{
										name: 'Reverberação',
										value: 'reverb',
									},
									{
										name: 'Ruído de Fundo',
										value: 'background',
									},
									{
										name: 'Filtro de Passa-Alta',
										value: 'highpass',
									},
									{
										name: 'Filtro de Passa-Baixa',
										value: 'lowpass',
									},
									{
										name: 'Personalizado',
										value: 'custom',
									},
								],
								default: 'ambience',
								description: 'Tipo de efeito a ser aplicado',
							},
							{
								displayName: 'Nome do Efeito Personalizado',
								name: 'customEffectName',
								type: 'string',
								displayOptions: {
									show: {
										effectType: ['custom'],
									},
								},
								default: '',
								description: 'Nome do efeito personalizado',
								placeholder: 'ex: airport, concert_hall, etc.',
							},
							{
								displayName: 'Intensidade',
								name: 'intensity',
								type: 'number',
								typeOptions: {
									minValue: 0,
									maxValue: 1,
									numberPrecision: 2,
								},
								default: 0.5,
								description: 'Intensidade do efeito (0-1)',
							},
							{
								displayName: 'Tempo de Início (segundos)',
								name: 'startTime',
								type: 'number',
								typeOptions: {
									numberPrecision: 2,
								},
								default: 0,
								description: 'Tempo em segundos quando o efeito começa a ser aplicado',
							},
							{
								displayName: 'Tempo de Finalização (segundos)',
								name: 'endTime',
								type: 'number',
								typeOptions: {
									numberPrecision: 2,
								},
								default: 0,
								description: 'Tempo em segundos quando o efeito para de ser aplicado (0 = até o final)',
							},
						],
					},
				],
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
				const outputBinaryPropertyName = this.getNodeParameter('outputBinaryPropertyName', i) as string;
				const effectsCollection = this.getNodeParameter('effects.effectsValues', i, []) as Array<{
					effectType: string;
					customEffectName?: string;
					intensity: number;
					startTime: number;
					endTime: number;
				}>;
				const advancedOptions = this.getNodeParameter('advancedOptions', i) as {
					outputFormat?: string;
				};

				// Verificar se pelo menos um efeito foi adicionado
				if (effectsCollection.length === 0) {
					throw new NodeOperationError(
						this.getNode(),
						'Você precisa adicionar pelo menos um efeito',
					);
				}

				// Preparar os efeitos para a requisição
				const effects = effectsCollection.map((effect) => {
					const effectConfig: Record<string, any> = {
						effect: effect.effectType === 'custom' ? effect.customEffectName : effect.effectType,
						intensity: effect.intensity,
					};

					// Adicionar tempos de início e fim apenas se não forem zero
					if (effect.startTime > 0) {
						effectConfig.start_time = effect.startTime;
					}

					if (effect.endTime > 0) {
						effectConfig.end_time = effect.endTime;
					}

					return effectConfig;
				});

				// Preparar o formData para a requisição
				const formData: Record<string, any> = {
					effects,
				};

				// Adicionar configurações avançadas
				if (advancedOptions.outputFormat !== undefined) {
					formData.output_format = advancedOptions.outputFormat;
				}

				// Configurar a requisição
				const options = await createBaseOptions.call(this, 'sound-effects', 'POST', undefined, formData);
				
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
				const filename = `audio_effects_${Date.now()}.${fileExtension}`;
				
				// Criar dados binários
				const newItem: INodeExecutionData = {
					json: {
						success: true,
						effects: effectsCollection,
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