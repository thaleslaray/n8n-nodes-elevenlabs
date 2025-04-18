module.exports = {
	nodes: [
		// Core API nodes
		require('./dist/nodes/ElevenLabs/Core/ElevenLabsSpeechToText.node.js').ElevenLabsSpeechToText,
		require('./dist/nodes/ElevenLabs/Core/ElevenLabsTextToSpeech.node.js').ElevenLabsTextToSpeech,
		
		// Conversational AI nodes
		require('./dist/nodes/ElevenLabs/ConversationalAI/ElevenLabsAgents.node.js').ElevenLabsAgents,
		require('./dist/nodes/ElevenLabs/ConversationalAI/ElevenLabsKnowledgeBase.node.js').ElevenLabsKnowledgeBase,
	],
	credentials: [
		require('./dist/credentials/ElevenLabsApi.credentials.js').ElevenLabsApi,
	],
}; 