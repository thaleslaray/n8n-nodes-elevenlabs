import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { createBaseOptions, handleApiError, formatReturnData } from '../utils';

export class ElevenLabsAgents implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ElevenLabs Agents',
		name: 'elevenLabsAgents',
		icon: 'file:../elevenlabs.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Use agentes de conversação da ElevenLabs',
		defaults: {
			name: 'ElevenLabs Agents',
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
						name: 'Criar Agente',
						value: 'createAgent',
						description: 'Criar um novo agente',
						action: 'Create a new agent',
					},
					{
						name: 'Obter Agente',
						value: 'getAgent',
						description: 'Obter detalhes de um agente existente',
						action: 'Get agent details',
					},
					{
						name: 'Listar Agentes',
						value: 'listAgents',
						description: 'Listar todos os agentes',
						action: 'List all agents',
					},
					{
						name: 'Atualizar Agente',
						value: 'updateAgent',
						description: 'Atualizar um agente existente',
						action: 'Update an existing agent',
					},
					{
						name: 'Excluir Agente',
						value: 'deleteAgent',
						description: 'Excluir um agente existente',
						action: 'Delete an existing agent',
					},
					{
						name: 'Iniciar Sessão',
						value: 'startSession',
						description: 'Iniciar uma nova sessão de conversação',
						action: 'Start a new conversation session',
					},
					{
						name: 'Enviar Mensagem',
						value: 'sendMessage',
						description: 'Enviar uma mensagem para um agente',
						action: 'Send a message to an agent',
					},
				],
				default: 'listAgents',
			},
			
			// Campos para Criar/Atualizar Agente
			{
				displayName: 'Nome do Agente',
				name: 'agentName',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						operation: ['createAgent', 'updateAgent'],
					},
				},
				description: 'Nome do agente',
			},
			{
				displayName: 'ID da Voz',
				name: 'voiceId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						operation: ['createAgent', 'updateAgent'],
					},
				},
				description: 'ID da voz que o agente usará',
				placeholder: 'ex: 21m00Tcm4TlvDq8ikWAM',
			},
			{
				displayName: 'Instruções do Sistema',
				name: 'systemInstruction',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				required: true,
				default: '',
				displayOptions: {
					show: {
						operation: ['createAgent', 'updateAgent'],
					},
				},
				description: 'Instruções sobre como o agente deve se comportar',
			},
			
			// Campos para operações específicas por ID
			{
				displayName: 'ID do Agente',
				name: 'agentId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						operation: ['getAgent', 'updateAgent', 'deleteAgent', 'startSession'],
					},
				},
				description: 'ID do agente',
			},
			
			// Campos para enviar mensagem
			{
				displayName: 'ID da Sessão',
				name: 'sessionId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						operation: ['sendMessage'],
					},
				},
				description: 'ID da sessão de conversação',
			},
			{
				displayName: 'Mensagem',
				name: 'message',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				required: true,
				default: '',
				displayOptions: {
					show: {
						operation: ['sendMessage'],
					},
				},
				description: 'Mensagem a ser enviada ao agente',
			},
			
			// Opções avançadas
			{
				displayName: 'Opções Avançadas',
				name: 'advancedOptions',
				type: 'collection',
				placeholder: 'Adicionar Opção',
				default: {},
				options: [
					{
						displayName: 'Conhecimentos',
						name: 'knowledgeBaseIds',
						type: 'string',
						default: '',
						description: 'IDs das bases de conhecimento separados por vírgula',
					},
					{
						displayName: 'Forçar Resposta de Áudio',
						name: 'forceAudioResponse',
						type: 'boolean',
						default: false,
						description: 'Sempre gerar resposta em áudio, mesmo que normalmente não seria gerada',
					},
					{
						displayName: 'Limite de Pesquisa',
						name: 'searchLimit',
						type: 'number',
						default: 10,
						description: 'Número máximo de resultados para pesquisar na base de conhecimento',
					},
					{
						displayName: 'Idioma',
						name: 'language',
						type: 'string',
						default: 'pt-BR',
						description: 'Código de idioma para a sessão (ex: pt-BR, en-US)',
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
				const operation = this.getNodeParameter('operation', i) as string;
				let response;
				
				// Operações relacionadas a agentes
				if (operation === 'listAgents') {
					// Listar todos os agentes
					const options = await createBaseOptions.call(this, 'conversational/agents', 'GET');
					response = await this.helpers.request(options);
				} 
				else if (operation === 'getAgent') {
					// Obter detalhes de um agente
					const agentId = this.getNodeParameter('agentId', i) as string;
					const options = await createBaseOptions.call(this, `conversational/agents/${agentId}`, 'GET');
					response = await this.helpers.request(options);
				} 
				else if (operation === 'createAgent') {
					// Criar um novo agente
					const agentName = this.getNodeParameter('agentName', i) as string;
					const voiceId = this.getNodeParameter('voiceId', i) as string;
					const systemInstruction = this.getNodeParameter('systemInstruction', i) as string;
					const advancedOptions = this.getNodeParameter('advancedOptions', i) as {
						knowledgeBaseIds?: string;
					};
					
					const body: Record<string, any> = {
						name: agentName,
						voice_id: voiceId,
						system_instruction: systemInstruction,
					};
					
					// Adicionar bases de conhecimento, se fornecidas
					if (advancedOptions.knowledgeBaseIds) {
						body.knowledge_base_ids = advancedOptions.knowledgeBaseIds
							.split(',')
							.map(id => id.trim());
					}
					
					const options = await createBaseOptions.call(this, 'conversational/agents', 'POST', body);
					response = await this.helpers.request(options);
				} 
				else if (operation === 'updateAgent') {
					// Atualizar um agente existente
					const agentId = this.getNodeParameter('agentId', i) as string;
					const agentName = this.getNodeParameter('agentName', i) as string;
					const voiceId = this.getNodeParameter('voiceId', i) as string;
					const systemInstruction = this.getNodeParameter('systemInstruction', i) as string;
					const advancedOptions = this.getNodeParameter('advancedOptions', i) as {
						knowledgeBaseIds?: string;
					};
					
					const body: Record<string, any> = {
						name: agentName,
						voice_id: voiceId,
						system_instruction: systemInstruction,
					};
					
					// Adicionar bases de conhecimento, se fornecidas
					if (advancedOptions.knowledgeBaseIds) {
						body.knowledge_base_ids = advancedOptions.knowledgeBaseIds
							.split(',')
							.map(id => id.trim());
					}
					
					const options = await createBaseOptions.call(this, `conversational/agents/${agentId}`, 'PUT', body);
					response = await this.helpers.request(options);
				} 
				else if (operation === 'deleteAgent') {
					// Excluir um agente
					const agentId = this.getNodeParameter('agentId', i) as string;
					const options = await createBaseOptions.call(this, `conversational/agents/${agentId}`, 'DELETE');
					response = await this.helpers.request(options);
					// Para exclusões bem-sucedidas, a API pode retornar um corpo vazio
					response = response || { success: true, message: 'Agente excluído com sucesso' };
				} 
				else if (operation === 'startSession') {
					// Iniciar uma nova sessão
					const agentId = this.getNodeParameter('agentId', i) as string;
					const advancedOptions = this.getNodeParameter('advancedOptions', i) as {
						language?: string;
					};
					
					const body: Record<string, any> = {};
					
					if (advancedOptions.language) {
						body.language = advancedOptions.language;
					}
					
					const options = await createBaseOptions.call(this, `conversational/agents/${agentId}/sessions`, 'POST', body);
					response = await this.helpers.request(options);
				} 
				else if (operation === 'sendMessage') {
					// Enviar mensagem em uma sessão
					const sessionId = this.getNodeParameter('sessionId', i) as string;
					const message = this.getNodeParameter('message', i) as string;
					const advancedOptions = this.getNodeParameter('advancedOptions', i) as {
						forceAudioResponse?: boolean;
						searchLimit?: number;
					};
					
					const body: Record<string, any> = {
						message,
					};
					
					if (advancedOptions.forceAudioResponse !== undefined) {
						body.force_audio_response = advancedOptions.forceAudioResponse;
					}
					
					if (advancedOptions.searchLimit !== undefined) {
						body.search_limit = advancedOptions.searchLimit;
					}
					
					const options = await createBaseOptions.call(this, `conversational/sessions/${sessionId}/interaction`, 'POST', body);
					response = await this.helpers.request(options);
				}
				
				returnData.push(formatReturnData(response, i));
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