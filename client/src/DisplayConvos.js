/*global chrome*/
import React, {useState, useEffect} from "react";
import DisplayThread from "./DisplayThread.js";

function DisplayConvos(props) {
	
	const {cookie} = props;
	
	const [threadArray, setThreadArray] = useState([]);
	const [threadName, setThreadName] = useState(null);
	const [threadId, setThreadId] = useState(null);

	useEffect( () => {
		const handleGetThreads = async () => {
			const response = await fetch('http://159.65.117.84:80/get-convo-threads', {
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
		handleGetThreads();
	}, []);
		
		
	const handleThreadClick = (threadName) => {
		setThreadName(threadName[0]);
		setThreadId(threadName[1]);
	};
	
	return (
		<>
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