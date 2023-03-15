/*global chrome*/
import React, {useState, useEffect, useRef} from "react";

function AudioRetrieval() {
	
	const [transcriptTextArea, setTranscriptTextArea] = useState("");
	const transcriptTextAreaRef = useRef(null);
	
	const handleStartCapture = () => {
		
		chrome.tabCapture.capture({audio: true}, function(stream) {
			
			const audioContext = new AudioContext();

			const mediaStreamSource = audioContext.createMediaStreamSource(stream);
			mediaStreamSource.connect(audioContext.destination);

			// Set up the speech recognition object
			const SpeechRecognition = window.speechRecognition || window.webkitSpeechRecognition;
			const recognition = new SpeechRecognition();
			
			recognition.continuous = true;
			recognition.interimResults = true;
			recognition.lang = 'en-US';
			recognition.listening = true;
			
			recognition.start();

			// Process the speech recognition results
			recognition.onresult = function(event) {
				let eventText = "";
				for (let i = 0; i < event.results.length; i++) {
					eventText += event.results[i][0].transcript;
				}
				// console.log(eventText);
				transcriptTextAreaRef.current.value = eventText;
			}
								
		});
		
	};
	
	const handleSendingToAI = async() => {
		const prompt = "This is a question asked by a person: " + "\n"  
		+ " Give an answer in bullet points. Try not to be verbose: " + transcriptTextAreaRef.current.value;
		
		try {
			const response = await fetch("https://sak-productivity-suite.herokuapp.com/use-bingai", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					prompt: prompt
				})
			});
			
			const data = await response.json();	
			setTranscriptTextArea(data.message);			

		}catch(error){
			console.log(error);
		}

	};
	
		
	const handleTranscriptTextAreaChange = (event) => {
		setTranscriptTextArea(event.target.value);
	};
	
	return (
		<>
		<button onClick={handleStartCapture}>
			Start audio capture
		</button>
		<button onClick={handleSendingToAI}>
			Send to AI
		</button>
		<textarea ref={transcriptTextAreaRef} value={transcriptTextArea} onChange={handleTranscriptTextAreaChange} placeholder="The transcript will appear here"></textarea>
		</>
	);

}
export default AudioRetrieval;