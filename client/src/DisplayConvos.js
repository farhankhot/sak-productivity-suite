import React, {useState, useEffect} from "react";
import DisplayThread from "./DisplayThread.js";
import {useNavigate} from 'react-router-dom';

function DisplayConvos(props) {

	const {sessionId} = props;
	console.log("DisplayConvos sessionId: ", sessionId);

	const [threadArray, setThreadArray] = useState([]);
	const [threadName, setThreadName] = useState(null);
	const [threadId, setThreadId] = useState(null);

	const navigate = useNavigate();

	useEffect( () => {
		const handleGetThreads = async () => {
			const response = await fetch('https://sak-productivity-suite.herokuapp.com/get-convo-threads', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					sessionId: sessionId
				})
			});

			const data = await response.json();
			const thread = data.message;
			setThreadArray(thread);
		};	
		if (sessionId) {
			handleGetThreads();
		}
	}, [sessionId]);
		
	const handleThreadClick = (threadName) => {
		setThreadName(threadName[0]);
		setThreadId(threadName[1]);
	};
	
	return (
		<>
		{ (threadName && threadId) ? (
			// <DisplayThread sessionId={sessionId} threadName={threadName} threadId={threadId} />
			navigate("/display-thread", {state: {
				sessionId: sessionId,
				threadName: threadName,
				threadId: threadId
			}})
		) : (
			<div>
				<h1>Messages</h1>
			
				{threadArray.length > 0 && (
					<>
					{threadArray.map( (threadName) => (
						<button onClick={() => handleThreadClick(threadName)}>{threadName[0]}</button>
					))}
					</>
				)}
			</div>
		)}
		</>
	)

}
export default DisplayConvos;