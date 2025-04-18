import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ElevenLabsApi implements ICredentialType {
	name = 'elevenLabsApi';
	displayName = 'ElevenLabs API';
	documentationUrl = 'https://elevenlabs.io/docs/api-reference/authentication';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'A chave de API da ElevenLabs. Você pode obtê-la em https://elevenlabs.io/account',
		},
	];
} 