import React, {useState, useEffect} from "react";
import { useLocation } from 'react-router-dom';
import {CheckJobStatus} from "./CheckJobStatus.js";
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { ButtonGroup, ListGroup } from 'react-bootstrap';

function DisplayThread() {

	const location = useLocation();
	const sessionId = location.state?.sessionId;
	const threadName = location.state?.threadName;
	const threadId = location.state?.threadId;

	const [isLoadingReply, setIsLoadingReply] = useState(null);	
	
	const [convoArray, setConvoArray] = useState([]);
	const [replyTextArea, setReplyTextArea] = useState([]);

	useEffect( () => {
		
		const getSingleThread = async () => {
			// setIsLoadingThread(true);
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
			// setIsLoadingThread(false);
		};	
		getSingleThread();
		// The 2 lines below deal with auto refresh of messages.
		// Run function every 5 seconds and clearInterval removes the timer after every 5 seconds. 
		// This prevents memory leak.
		const intervalId = setInterval(getSingleThread, 5000);
		return () => clearInterval(intervalId);
	}, []);
	
	const handleMakingReply = async() => {
		const prompt = "Reply to this: " + convoArray[convoArray.length-1];
		try {
			isLoadingReply(true);
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
			const jobId = data.message;
			CheckJobStatus(jobId, (resultArray) => {
				setReplyTextArea(resultArray);	
				isLoadingReply(false);
			});

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
		// <div>
		// 	{/* {isLoadingThread ? <p>Refreshing...</p> : <p>Conversation:</p>} */}
        //     <h1>{threadName}</h1>
		// 	{convoArray.map( (message) => (
		// 		<p>{message[1]}: {message[0]}</p>
		// 	))}
        //     {/* <textarea value={replyTextArea} onChange={handleReplyTextAreaChange}></textarea> */}
		// 	<Form.Group>
		// 		<Form.Control
		// 			as="textarea"
		// 			value={replyTextArea} 
		// 			onChange={ (event) => {
		// 				handleReplyTextAreaChange(event)
		// 			}}
		// 		/>
		// 	</Form.Group>
        //     <button onClick={handleMakingReply}>Reply</button>
        //     <button onClick={handleSendingMessage}>Send Message</button>
		// </div>
		<Container style={{ paddingTop: '20px', paddingBottom: '20px'}}>
			<Card>
				<Card.Header>
				<Card.Title>{threadName}</Card.Title>
				</Card.Header>
				<Card.Body>
				{convoArray.map((message) => (
					<Card.Text>
					{message[1]}: {message[0]}
					</Card.Text>
				))}
				<Form.Group>
					<Form.Control
					as="textarea"
					style={{ height: '150px' }}
					placeholder="Type your message here"
					value={replyTextArea}
					onChange={(event) => {
						handleReplyTextAreaChange(event);
					}}
					/>
				</Form.Group>
				<ButtonGroup aria-label="Basic example" className="mb-2">
					<Button onClick={ () => {
						handleMakingReply()
					}}>
						{isLoadingReply ? <p>Generating reply...</p> : <p>Generate Reply</p>}
					</Button>
					<Button onClick={ () => {
						handleSendingMessage()
					}}>
						Send Message
					</Button>
				</ButtonGroup>
				</Card.Body>
			</Card>
		</Container>
	)
}
export default DisplayThread;