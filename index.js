module.exports = {
	nodes: [
		// Core API nodes
		require('./dist/nodes/ElevenLabs/Core/ElevenLabsSpeechToText.node.js').ElevenLabsSpeechToText,
		require('./dist/nodes/ElevenLabs/Core/ElevenLabsTextToSpeech.node.js').ElevenLabsTextToSpeech,
		
		// Audio Processing nodes
		require('./dist/nodes/ElevenLabs/Core/Audio/ElevenLabsSpeechToSpeech.node.js').ElevenLabsSpeechToSpeech,
		require('./dist/nodes/ElevenLabs/Core/Audio/ElevenLabsSoundEffects.node.js').ElevenLabsSoundEffects,
		require('./dist/nodes/ElevenLabs/Core/Audio/ElevenLabsVoiceChanger.node.js').ElevenLabsVoiceChanger,
		
		// Conversational AI nodes
		require('./dist/nodes/ElevenLabs/ConversationalAI/ElevenLabsAgents.node.js').ElevenLabsAgents,
		require('./dist/nodes/ElevenLabs/ConversationalAI/ElevenLabsKnowledgeBase.node.js').ElevenLabsKnowledgeBase,
		
		// Main node with all features
		require('./dist/nodes/ElevenLabs/ElevenLabs.node.js').ElevenLabs,
	],
	credentials: [
		require('./dist/credentials/ElevenLabsApi.credentials.js').ElevenLabsApi,
	],
}; 