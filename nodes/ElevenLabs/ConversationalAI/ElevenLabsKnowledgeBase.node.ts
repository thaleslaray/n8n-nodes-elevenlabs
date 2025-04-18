import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { createBaseOptions, handleApiError, formatReturnData } from '../utils';

export class ElevenLabsKnowledgeBase implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ElevenLabs Knowledge Base',
		name: 'elevenLabsKnowledgeBase',
		icon: 'file:../elevenlabs.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Gerencie bases de conhecimento para os agentes da ElevenLabs',
		defaults: {
			name: 'ElevenLabs Knowledge Base',
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
						name: 'Criar Base de Conhecimento',
						value: 'createKnowledgeBase',
						description: 'Criar uma nova base de conhecimento',
						action: 'Create a new knowledge base',
					},
					{
						name: 'Obter Base de Conhecimento',
						value: 'getKnowledgeBase',
						description: 'Obter detalhes de uma base de conhecimento existente',
						action: 'Get knowledge base details',
					},
					{
						name: 'Listar Bases de Conhecimento',
						value: 'listKnowledgeBases',
						description: 'Listar todas as bases de conhecimento',
						action: 'List all knowledge bases',
					},
					{
						name: 'Atualizar Base de Conhecimento',
						value: 'updateKnowledgeBase',
						description: 'Atualizar uma base de conhecimento existente',
						action: 'Update an existing knowledge base',
					},
					{
						name: 'Excluir Base de Conhecimento',
						value: 'deleteKnowledgeBase',
						description: 'Excluir uma base de conhecimento existente',
						action: 'Delete an existing knowledge base',
					},
					{
						name: 'Adicionar Documentos',
						value: 'addDocuments',
						description: 'Adicionar documentos a uma base de conhecimento',
						action: 'Add documents to a knowledge base',
					},
					{
						name: 'Listar Documentos',
						value: 'listDocuments',
						description: 'Listar todos os documentos em uma base de conhecimento',
						action: 'List all documents in a knowledge base',
					},
					{
						name: 'Remover Documento',
						value: 'removeDocument',
						description: 'Remover um documento de uma base de conhecimento',
						action: 'Remove a document from a knowledge base',
					},
				],
				default: 'listKnowledgeBases',
			},
			
			// Campos para Criar/Atualizar Base de Conhecimento
			{
				displayName: 'Nome da Base de Conhecimento',
				name: 'knowledgeBaseName',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						operation: ['createKnowledgeBase', 'updateKnowledgeBase'],
					},
				},
				description: 'Nome da base de conhecimento',
			},
			{
				displayName: 'Descrição',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				displayOptions: {
					show: {
						operation: ['createKnowledgeBase', 'updateKnowledgeBase'],
					},
				},
				description: 'Descrição da base de conhecimento',
			},
			
			// Campos para operações específicas por ID
			{
				displayName: 'ID da Base de Conhecimento',
				name: 'knowledgeBaseId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						operation: [
							'getKnowledgeBase', 
							'updateKnowledgeBase', 
							'deleteKnowledgeBase',
							'addDocuments',
							'listDocuments',
							'removeDocument',
						],
					},
				},
				description: 'ID da base de conhecimento',
			},
			
			// Campos para adição de documentos
			{
				displayName: 'URL do Documento',
				name: 'documentUrl',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						operation: ['addDocuments'],
					},
				},
				description: 'URL do documento a ser adicionado à base de conhecimento',
			},
			{
				displayName: 'Tipo do Documento',
				name: 'documentType',
				type: 'options',
				options: [
					{
						name: 'URL da Web',
						value: 'web_url',
					},
					{
						name: 'URL do Arquivo',
						value: 'file_url',
					},
				],
				default: 'web_url',
				required: true,
				displayOptions: {
					show: {
						operation: ['addDocuments'],
					},
				},
				description: 'Tipo de documento a ser adicionado',
			},
			
			// Campos para remoção de documentos
			{
				displayName: 'ID do Documento',
				name: 'documentId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						operation: ['removeDocument'],
					},
				},
				description: 'ID do documento a ser removido da base de conhecimento',
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
						displayName: 'Nome Personalizado do Documento',
						name: 'documentName',
						type: 'string',
						default: '',
						description: 'Nome personalizado para o documento ao adicionar à base de conhecimento',
					},
					{
						displayName: 'Espaço de Nomes',
						name: 'namespace',
						type: 'string',
						default: '',
						description: 'Espaço de nomes para organizar os documentos',
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
				
				// Operações relacionadas a bases de conhecimento
				if (operation === 'listKnowledgeBases') {
					// Listar todas as bases de conhecimento
					const options = await createBaseOptions.call(this, 'conversational/knowledge-bases', 'GET');
					response = await this.helpers.request(options);
				} 
				else if (operation === 'getKnowledgeBase') {
					// Obter detalhes de uma base de conhecimento
					const knowledgeBaseId = this.getNodeParameter('knowledgeBaseId', i) as string;
					const options = await createBaseOptions.call(this, `conversational/knowledge-bases/${knowledgeBaseId}`, 'GET');
					response = await this.helpers.request(options);
				} 
				else if (operation === 'createKnowledgeBase') {
					// Criar uma nova base de conhecimento
					const knowledgeBaseName = this.getNodeParameter('knowledgeBaseName', i) as string;
					const description = this.getNodeParameter('description', i) as string;
					
					const body: Record<string, any> = {
						name: knowledgeBaseName,
					};
					
					if (description) {
						body.description = description;
					}
					
					const options = await createBaseOptions.call(this, 'conversational/knowledge-bases', 'POST', body);
					response = await this.helpers.request(options);
				} 
				else if (operation === 'updateKnowledgeBase') {
					// Atualizar uma base de conhecimento existente
					const knowledgeBaseId = this.getNodeParameter('knowledgeBaseId', i) as string;
					const knowledgeBaseName = this.getNodeParameter('knowledgeBaseName', i) as string;
					const description = this.getNodeParameter('description', i) as string;
					
					const body: Record<string, any> = {
						name: knowledgeBaseName,
					};
					
					if (description) {
						body.description = description;
					}
					
					const options = await createBaseOptions.call(this, `conversational/knowledge-bases/${knowledgeBaseId}`, 'PUT', body);
					response = await this.helpers.request(options);
				} 
				else if (operation === 'deleteKnowledgeBase') {
					// Excluir uma base de conhecimento
					const knowledgeBaseId = this.getNodeParameter('knowledgeBaseId', i) as string;
					const options = await createBaseOptions.call(this, `conversational/knowledge-bases/${knowledgeBaseId}`, 'DELETE');
					response = await this.helpers.request(options);
					// Para exclusões bem-sucedidas, a API pode retornar um corpo vazio
					response = response || { success: true, message: 'Base de conhecimento excluída com sucesso' };
				} 
				else if (operation === 'addDocuments') {
					// Adicionar documentos a uma base de conhecimento
					const knowledgeBaseId = this.getNodeParameter('knowledgeBaseId', i) as string;
					const documentUrl = this.getNodeParameter('documentUrl', i) as string;
					const documentType = this.getNodeParameter('documentType', i) as string;
					const advancedOptions = this.getNodeParameter('advancedOptions', i) as {
						documentName?: string;
						namespace?: string;
					};
					
					const body: Record<string, any> = {
						[documentType]: documentUrl,
					};
					
					if (advancedOptions.documentName) {
						body.name = advancedOptions.documentName;
					}
					
					if (advancedOptions.namespace) {
						body.namespace = advancedOptions.namespace;
					}
					
					const options = await createBaseOptions.call(this, `conversational/knowledge-bases/${knowledgeBaseId}/documents`, 'POST', body);
					response = await this.helpers.request(options);
				} 
				else if (operation === 'listDocuments') {
					// Listar documentos de uma base de conhecimento
					const knowledgeBaseId = this.getNodeParameter('knowledgeBaseId', i) as string;
					const options = await createBaseOptions.call(this, `conversational/knowledge-bases/${knowledgeBaseId}/documents`, 'GET');
					response = await this.helpers.request(options);
				} 
				else if (operation === 'removeDocument') {
					// Remover um documento de uma base de conhecimento
					const knowledgeBaseId = this.getNodeParameter('knowledgeBaseId', i) as string;
					const documentId = this.getNodeParameter('documentId', i) as string;
					const options = await createBaseOptions.call(this, `conversational/knowledge-bases/${knowledgeBaseId}/documents/${documentId}`, 'DELETE');
					response = await this.helpers.request(options);
					// Para exclusões bem-sucedidas, a API pode retornar um corpo vazio
					response = response || { success: true, message: 'Documento removido com sucesso' };
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