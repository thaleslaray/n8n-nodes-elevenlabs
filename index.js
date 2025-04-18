module.exports = {
	nodes: [
		require('./dist/nodes/ElevenLabs/ElevenLabsSpeechToText.node.js').ElevenLabsSpeechToText,
	],
	credentials: [
		require('./dist/credentials/ElevenLabsApi.credentials.js').ElevenLabsApi,
	],
}; 