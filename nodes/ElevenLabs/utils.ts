import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';
import { OptionsWithUri } from 'request';

/**
 * Cria as opções padrão para uma requisição à API da ElevenLabs
 */
export async function createBaseOptions(
	this: IExecuteFunctions,
	endpoint: string,
	method = 'GET',
	body?: object,
	formData?: object,
) {
	const credentials = await this.getCredentials('elevenLabsApi');
	
	if (!credentials) {
		throw new NodeOperationError(this.getNode(), 'Credenciais da ElevenLabs não foram fornecidas');
	}

	const options: OptionsWithUri = {
		headers: {
			'xi-api-key': credentials.apiKey as string,
			'Accept': 'application/json',
		},
		method,
		uri: `https://api.elevenlabs.io/v1/${endpoint}`,
		json: true,
	};

	if (body) {
		options.body = body;
	}

	if (formData) {
		options.formData = formData;
	}

	return options;
}

/**
 * Processa erros de API de forma consistente
 */
export function handleApiError(this: IExecuteFunctions, error: any, itemIndex: number) {
	// Se a execução deve continuar em caso de falha
	if (this.continueOnFail()) {
		return {
			json: { error: error.message || 'Erro desconhecido' },
			pairedItem: { item: itemIndex },
		};
	}
	
	// Caso contrário, propaga o erro
	throw error;
}

/**
 * Formata o retorno de dados para todos os nós
 */
export function formatReturnData(response: any, itemIndex: number): INodeExecutionData {
	return {
		json: response,
		pairedItem: { item: itemIndex },
	};
} 