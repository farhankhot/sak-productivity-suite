import React, {useState, useEffect} from "react";
import { useLocation } from 'react-router-dom';

function DisplayThread() {

	const location = useLocation();
	const sessionId = location.state?.sessionId;
	const threadName = location.state?.threadName;
	const threadId = location.state?.threadId;
	
	const [convoArray, setConvoArray] = useState([]);
	const [replyTextArea, setReplyTextArea] = useState([]);

	useEffect( () => {
		
		const getSingleThread = async () => {
		
			const response = await fetch('https://sak-productivity-suite.herokuapp.com/get-convo-messages', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					sessionId: sessionId,
					threadId: threadId
				})
			});

			const data = await response.json();
			const thread = data.message;
			setConvoArray(thread);
		};	
		getSingleThread();
		const intervalId = setInterval(getSingleThread, 5000);
		return () => clearInterval(intervalId);
	}, []);
	
	const handleMakingReply = async() => {
		const prompt = "Reply to this: " + convoArray;
		
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
			setReplyTextArea(data.message);			

		}catch(error){
			console.log(error);
		}
	};
	
	const handleSendingMessage = async () => {
		
		try {
			const response = await fetch("https://sak-productivity-suite.herokuapp.com/send-message", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					sessionId: sessionId,
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
			{convoArray.map( (message) => (
				<p>{message[1]}: {message[0]}</p>
			))}
            <textarea value={replyTextArea} onChange={handleReplyTextAreaChange} placeholder="The generated note will appear here"></textarea>
            <button onClick={handleMakingReply}>Reply</button>
            <button onClick={handleSendingMessage}>Send Message</button>
		</div>
	)

}
export default DisplayThread;