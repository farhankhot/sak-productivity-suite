/*global chrome*/
import React, {useState, useEffect} from "react";

function DisplayThread(props) {
	
	const {cookie, threadName, profileUrn} = props;	
	const [convoArray, setConvoArray] = useState([]);

	useEffect( () => {
		
		const handleGetSingleThread = async () => {
		
			const response = await fetch('https://sak-productivity-suite.herokuapp.com/get-convo-messages', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					cookie: cookie,
					profileUrn: profileUrn
				})
			});

			const data = await response.json();
			const thread = data.message;
			setConvoArray(thread);
		};	
		handleGetSingleThread();
	}, []);
		
	return (
		<div>
            <h1>{threadName}</h1>
            <textarea></textarea>
            <button>Get Interests</button>
            <button>Generate Message</button>
            <button>Send Message</button>
		</div>
	)

}
export default DisplayThread;