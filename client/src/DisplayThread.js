import React, {useState, useEffect} from "react";
import { useLocation } from 'react-router-dom';
import {CheckJobStatus} from "./CheckJobStatus.js";
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { ButtonGroup, ListGroup } from 'react-bootstrap';
import ErrorModal from "./ErrorModal.js";

function DisplayThread() {

	const location = useLocation();
	const sessionId = location.state?.sessionId;
	const threadName = location.state?.threadName;
	const threadId = location.state?.threadId;

	const [isLoadingReply, setIsLoadingReply] = useState(null);	
	
	const [convoArray, setConvoArray] = useState([]);
	const [replyTextArea, setReplyTextArea] = useState([]);

	const [error, setError] = useState(null);

	useEffect( () => {
		
		const getSingleThread = async () => {
			// setIsLoadingThread(true);
			const response = await fetch('https://sak-productivity-suite.herokuapp.com/get-convo-message', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					sessionId: sessionId,
					threadId: threadId
				})
			});
			if (response.ok){
				const data = await response.json();
				if (data.success === true) {
					const thread = data.message;
					setConvoArray(thread);
				}
			}else {
				console.log("error occurred");
				setError("error occurred");
			}
		};	
		getSingleThread();
		// The 2 lines below deal with auto refresh of messages.
		// Run function every 5 seconds and clearInterval removes the timer after every 5 seconds. 
		// This prevents memory leak.
		const intervalId = setInterval(getSingleThread, 5000);
		return () => clearInterval(intervalId);
	}, []);
	
	const handleMakingReply = async() => {
		const prompt = "Reply to this: " + convoArray;
		try {
			setIsLoadingReply(true);
			const response = await fetch("https://sak-productivity-suite.herokuapp.com/use-chatgpt", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					prompt: prompt
				})
			});
			const data = await response.json();
			if (data.success === true){
				const jobId = data.message;
				CheckJobStatus(jobId, (resultArray) => {
					setReplyTextArea(resultArray);	
					setIsLoadingReply(false);
				});
			}else {
				<ErrorModal errorMessage={data.message}/>
			}
		}catch(error){
			<ErrorModal errorMessage={error}/>
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
			if (data.success === true) {
				console.log("Successfully sent the message to the person", data.message);
			}else {
				<ErrorModal errorMessage={data.message}/>
			}
		}catch(error){
			<ErrorModal errorMessage={error}/>
			console.log(error);
		}
	};
	
	const handleReplyTextAreaChange = (event) => {
		setReplyTextArea(event.target.value);
	};
		
	return (
		<>
		{error && <ErrorModal errorMessage={error}/>}
		
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
		</>
	)
}
export default DisplayThread;