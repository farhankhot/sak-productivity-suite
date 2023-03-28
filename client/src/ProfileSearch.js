import React, {useState, useEffect} from "react";
import {CheckJobStatus} from "./CheckJobStatus.js";
import DisplaySearchResults from "./DisplaySearchResults.js";
import DisplayConvos from "./DisplayConvos.js";
import loadingGif from "./loading.gif";

// TODO: Fix relative imports (loadingGif should be in /public/)

function ProfileSearch(props) {
	
	const {cookie} = props;
	
	const [title, setTitle] = useState("");
	const [location, setLocation] = useState("");
	const [currentCompany, setCurrentCompany] = useState("");
	const [mutualConnectionsBoolean, setMutualConnectionsBoolean] = useState(false);
	
	const [jobFinished, setJobFinished] = useState(false);
	const [resultArray, setResultArray] = useState([]);
	
	const [navigateToMessages, setNavigateToMessages] = useState(false);
	
	const [isLoading, setIsLoading] = useState(false);
		
	const handleSearchRequest = async () => {
		console.log("ProfileSearch cookie: ", cookie);
		try {
			const response = await fetch("https://sak-productivity-suite.herokuapp.com/receive-link", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					cookie: cookie,
					title: title,
					location: location,
					currentCompany: currentCompany,
					mutualConnections: mutualConnectionsBoolean
				})
			});
			setIsLoading(true);
			const data = await response.json();
			const jobId = data.message;
			
			CheckJobStatus(jobId, (resultArray) => {
				setResultArray(resultArray);	
				setJobFinished(true);
			});

		} catch (error) {
			console.error(error);
		}
	};
	
	const handleMessagesButton = () => {
		setNavigateToMessages(true);
	};
	
	return (
		<>
		{jobFinished === true ? (
			<DisplaySearchResults cookie={cookie} resultArray={resultArray} />
		) : (
			<>
			{!isLoading && (
				<div>
					<button onClick={handleMessagesButton}>
						Messages
					</button>
					{navigateToMessages && <DisplayConvos cookie={cookie} />}
				</div>
			)}
			{!navigateToMessages && !isLoading && (
				<>
					<input type="text" placeholder="Enter a title" value={title} onChange={(e) => setTitle(e.target.value)}  />
					<input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
					<input type="text" placeholder="Current Company" value={currentCompany} onChange={(e) => setCurrentCompany(e.target.value)} />
					
					<input type="checkbox" value={mutualConnectionsBoolean} onChange={(e) => setMutualConnectionsBoolean(e.target.value)} />
					<label htmlFor="mutualConnectionsBoolean">
						Get Mutual Connections?
					</label>
					
					<button onClick={handleSearchRequest}>
						Search
					</button>
				</>
			)}
			{isLoading && <img src={loadingGif} alt="loading" />}
			</>
		)}		
		</>
	);
	
}
export default ProfileSearch;