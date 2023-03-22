/*global chrome*/
import React, {useState, useEffect} from "react";

function DisplayThread(props) {
	
	const {cookie, threadName, threadId} = props;	
	const [convoArray, setConvoArray] = useState([]);
	const [replyTextArea, setReplyTextArea] = useState([]);

	useEffect( () => {
		
		const handleGetSingleThread = async () => {
		
			const response = await fetch('http://159.65.117.84:80/get-convo-messages', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					cookie: cookie,
					profileUrn: threadId
				})
			});

			const data = await response.json();
			const thread = data.message;
			setConvoArray(thread);
		};	
		handleGetSingleThread();
	}, []);
	
	const handleMakingReply = async() => {
		const prompt = "Reply to this: " + convoArray;
		
		try {
			const response = await fetch("http://159.65.117.84:80/use-bingai", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					prompt: prompt
				})
			});
			
			const data = await response.json();
			setReplyTextArea(data.message);			

		}catch(error){
			console.log(error);
		}
	};
	
	const handleSendingMessage = async () => {
		
		try {
			const response = await fetch("http://159.65.117.84:80/send-message", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					cookie: cookie,
					profileId: threadId,
					text: replyTextArea
				})
			});

			const data = await response.json();
			console.log("Successfully sent the message to the person", data.message);
			
		}catch(error){
			console.log(error);
		}
	};
	
	const handleReplyTextAreaChange = (event) => {
		setReplyTextArea(event.target.value);
	};
		
	return (
		<div>
            <h1>{threadName}</h1>
			<p>{convoArray}</p>
            <textarea value={replyTextArea} onChange={handleReplyTextAreaChange} placeholder="The generated note will appear here"></textarea>
            <button onClick={handleMakingReply}>Reply</button>
            <button onClick={handleSendingMessage}>Send Message</button>
		</div>
	)

}
export default DisplayThread;