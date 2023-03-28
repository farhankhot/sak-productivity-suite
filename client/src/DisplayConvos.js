import React, {useState, useEffect} from "react";
import DisplayThread from "./DisplayThread.js";
import {Link, useLocation} from 'react-router-dom';
import NavbarComponent from "./NavbarComponent.js";

function DisplayConvos(props) {

	// const { state } = useLocation();
	// const { cookie } = state.cookie;
	const {sessionId} = props;
	console.log("DisplayConvos sessionId: ", sessionId);

	const [threadArray, setThreadArray] = useState([]);
	const [threadName, setThreadName] = useState(null);
	const [threadId, setThreadId] = useState(null);

	useEffect( () => {
		const handleGetThreads = async () => {
			const response = await fetch('https://sak-productivity-suite.herokuapp.com/get-convo-threads', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					cookie: cookie
				})
			});

			const data = await response.json();
			const thread = data.message;
			setThreadArray(thread);
		};	
		if (cookie) {
			handleGetThreads();
		}
	}, [cookie]);
		
	const handleThreadClick = (threadName) => {
		setThreadName(threadName[0]);
		setThreadId(threadName[1]);
	};
	
	return (
		<>
		{/* <NavbarComponent /> */}
		{ (threadName && threadId) ? (
			<DisplayThread cookie={cookie} threadName={threadName} threadId={threadId} />
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