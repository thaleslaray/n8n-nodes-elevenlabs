import { INodeTypeDescription } from 'n8n-workflow';

import { ElevenLabsTextToSpeech } from './Core/ElevenLabsTextToSpeech.node';
import { ElevenLabsSpeechToText } from './Core/ElevenLabsSpeechToText.node';
import { ElevenLabsSpeechToSpeech } from './Core/Audio/ElevenLabsSpeechToSpeech.node';
import { ElevenLabsSoundEffects } from './Core/Audio/ElevenLabsSoundEffects.node';
import { ElevenLabsVoiceChanger } from './Core/Audio/ElevenLabsVoiceChanger.node';
import { ElevenLabsKnowledgeBase } from './ConversationalAI/ElevenLabsKnowledgeBase.node';
import { ElevenLabsAgents } from './ConversationalAI/ElevenLabsAgents.node';

// Define o tipo do objeto de roteamento para suprimir os erros de tipagem
type CustomRouting = {
	request: {
		skipNodeCalling: boolean;
		output: {
			nodeType: string;
		};
	};
};

// @ts-ignore
export const nodeDescription: INodeTypeDescription = {
	displayName: 'ElevenLabs',
	name: 'elevenLabs',
	icon: 'file:elevenlabs.svg',
	group: ['output'],
	version: 1,
	subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
	description: 'Interagir com a API da ElevenLabs',
	defaults: {
		name: 'ElevenLabs',
	},
	inputs: ['main'],
	outputs: ['main'],
	credentials: [
		{
			name: 'elevenLabsApi',
			required: true,
		},
	],
	requestDefaults: {
		baseURL: 'https://api.elevenlabs.io/v1',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
	},
	properties: [
		{
			displayName: 'Recurso',
			name: 'resource',
			type: 'options',
			noDataExpression: true,
			options: [
				{
					name: 'Texto para Voz',
					value: 'textToSpeech',
				},
				{
					name: 'Voz para Texto',
					value: 'speechToText',
				},
				{
					name: 'Voz para Voz',
					value: 'speechToSpeech',
				},
				{
					name: 'Alterador de Voz',
					value: 'voiceChanger',
				},
				{
					name: 'Efeitos Sonoros',
					value: 'soundEffects',
				},
				{
					name: 'Base de Conhecimento',
					value: 'knowledgeBase',
				},
				{
					name: 'Agentes de IA',
					value: 'agents',
				},
			],
			default: 'textToSpeech',
		},
		{
			displayName: 'Operação',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['textToSpeech'],
				},
			},
			options: [
				{
					name: 'Converter Texto em Voz',
					value: 'convertText',
					action: 'Convert text to speech',
					description: 'Converter texto em fala usando a API ElevenLabs',
					// @ts-ignore
					routing: {
						request: {
							skipNodeCalling: true,
							output: {
								nodeType: ElevenLabsTextToSpeech.name,
							},
						},
					} as CustomRouting,
				},
			],
			default: 'convertText',
		},
		{
			displayName: 'Operação',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['speechToText'],
				},
			},
			options: [
				{
					name: 'Transcrever Áudio',
					value: 'transcribeAudio',
					action: 'Transcribe audio to text',
					description: 'Converter áudio em texto usando a API ElevenLabs',
					// @ts-ignore
					routing: {
						request: {
							skipNodeCalling: true,
							output: {
								nodeType: ElevenLabsSpeechToText.name,
							},
						},
					} as CustomRouting,
				},
			],
			default: 'transcribeAudio',
		},
		{
			displayName: 'Operação',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['soundEffects'],
				},
			},
			options: [
				{
					name: 'Adicionar Efeitos Sonoros',
					value: 'addEffects',
					action: 'Add sound effects to audio',
					description: 'Adicionar efeitos sonoros ao áudio usando a API ElevenLabs',
					// @ts-ignore
					routing: {
						request: {
							skipNodeCalling: true,
							output: {
								nodeType: ElevenLabsSoundEffects.name,
							},
						},
					} as CustomRouting,
				},
			],
			default: 'addEffects',
		},
		{
			displayName: 'Operação',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['speechToSpeech'],
				},
			},
			options: [
				{
					name: 'Converter Voz',
					value: 'convertSpeech',
					action: 'Convert speech from one voice to another',
					description: 'Converter áudio de uma voz para outra usando a API ElevenLabs',
					// @ts-ignore
					routing: {
						request: {
							skipNodeCalling: true,
							output: {
								nodeType: ElevenLabsSpeechToSpeech.name,
							},
						},
					} as CustomRouting,
				},
			],
			default: 'convertSpeech',
		},
		{
			displayName: 'Operação',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['voiceChanger'],
				},
			},
			options: [
				{
					name: 'Alterar Voz',
					value: 'changeVoice',
					action: 'Change voice characteristics',
					description: 'Modificar características de uma voz em um áudio usando a API ElevenLabs',
					// @ts-ignore
					routing: {
						request: {
							skipNodeCalling: true,
							output: {
								nodeType: ElevenLabsVoiceChanger.name,
							},
						},
					} as CustomRouting,
				},
			],
			default: 'changeVoice',
		},
		{
			displayName: 'Operação',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['knowledgeBase'],
				},
			},
			options: [
				{
					name: 'Consultar Base de Conhecimento',
					value: 'queryKnowledgeBase',
					action: 'Query knowledge base',
					description: 'Consultar uma base de conhecimento usando a API ElevenLabs',
					// @ts-ignore
					routing: {
						request: {
							skipNodeCalling: true,
							output: {
								nodeType: ElevenLabsKnowledgeBase.name,
							},
						},
					} as CustomRouting,
				},
			],
			default: 'queryKnowledgeBase',
		},
		{
			displayName: 'Operação',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['agents'],
				},
			},
			options: [
				{
					name: 'Interagir com Agente',
					value: 'interactWithAgent',
					action: 'Interact with conversational AI agent',
					description: 'Interagir com um agente de IA conversacional usando a API ElevenLabs',
					// @ts-ignore
					routing: {
						request: {
							skipNodeCalling: true,
							output: {
								nodeType: ElevenLabsAgents.name,
							},
						},
					} as CustomRouting,
				},
			],
			default: 'interactWithAgent',
		},
	],
}; 