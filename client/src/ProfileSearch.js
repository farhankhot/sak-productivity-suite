import React, {useState, useEffect} from "react";
import {CheckJobStatus} from "./CheckJobStatus.js";
import DisplaySearchResults from "./DisplaySearchResults.js";
import loadingGif from "./loading.gif";
import {useNavigate} from 'react-router-dom';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

import './ProfileSearch.css';

// TODO: Fix relative imports (loadingGif should be in /public/)

function ProfileSearch(props) {
	
	const {sessionId} = props;
	console.log("ProfileSearch", sessionId);
	
	const [title, setTitle] = useState("");
	const [location, setLocation] = useState("");
	const [currentCompany, setCurrentCompany] = useState("");
	const [mutualConnectionsBoolean, setMutualConnectionsBoolean] = useState(false);
	
	const [jobFinished, setJobFinished] = useState(false);
	const [resultArray, setResultArray] = useState([]);
	
	const [navigateToMessages, setNavigateToMessages] = useState(false);
	
	const [isLoading, setIsLoading] = useState(false);

	const navigate = useNavigate();
		
	const handleSearchRequest = async () => {
		
		try {
			const response = await fetch("https://sak-productivity-suite.herokuapp.com/receive-link", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					sessionId: sessionId,
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
		
		navigate('/linkedin-messages', { state: { sessionId: sessionId} });
		setNavigateToMessages(true);
	};
	
	return (
		<>
		{jobFinished === true ? (
			<DisplaySearchResults sessionId={sessionId} resultArray={resultArray} />
		) : (
			<>

			{/* {navigateToMessages && (
				<DisplayConvos cookie={cookie} />
			)} */}

			{!navigateToMessages && !isLoading && (
				<>
					{/* <input type="text" placeholder="Enter a title" value={title} onChange={(e) => setTitle(e.target.value)}  />
					<input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
					<input type="text" placeholder="Current Company" value={currentCompany} onChange={(e) => setCurrentCompany(e.target.value)} />
					
					<input type="checkbox" value={mutualConnectionsBoolean} onChange={(e) => setMutualConnectionsBoolean(e.target.value)} />
					<label htmlFor="mutualConnectionsBoolean">
						Get Mutual Connections?
					</label>
					
					<button onClick={handleSearchRequest}>
						Search
					</button> */}
					<div className="search-form-container">

						<Form className="search-form">
							{/* <Form.Group className="mb-3" controlId="formPosition">
								<Button 
									variant="outline-dark" 
									type="button" 
									onClick={handleMessagesButton}
									id="messages-button"
								>
									Go to Messages
								</Button>
							</Form.Group> */}

							<Form.Group className="mb-3" controlId="formPosition">
								<FloatingLabel 
									controlId="floatingInput" 
									label="Enter a position"
									className="mb-3"
								>
									<Form.Control 
										type="text"
										value={title}
										onChange={(e) => setTitle(e.target.value)} 
									/>
									<Form.Text className="text-muted">
										The position you want to search.
									</Form.Text>
								</FloatingLabel>
							</Form.Group>

							<Form.Group className="mb-3" controlId="formLocation">
								<FloatingLabel 
										controlId="floatingInput" 
										label="Enter a location"
										className="mb-3"
								>
									<Form.Control 
										type="text"
										value={location} 
										onChange={(e) => setLocation(e.target.value)}
									/>
									<Form.Text className="text-muted">
										The location you want to search in
									</Form.Text>
								</FloatingLabel>
							</Form.Group>

							<Form.Group className="mb-3" controlId="formCurrentCompany">
								<FloatingLabel 
											controlId="floatingInput" 
											label="Enter the company"
											className="mb-3"
									>
									<Form.Control 
										type="text" 
										value={currentCompany}
										onChange={(e) => setCurrentCompany(e.target.value)}
									/>
									<Form.Text className="text-muted">
										The company's employees you want to search
									</Form.Text>
								</FloatingLabel>
							</Form.Group>

							<Form.Group className="mb-3" controlId="formMutualConnections">
								<Form.Check 
									type="checkbox"
									label="Search only mutual connections"
									value={mutualConnectionsBoolean} 
									onChange={(e) => setMutualConnectionsBoolean(e.target.value)}
								/>
							</Form.Group>
							
							<Button variant="primary" type="button" onClick={handleSearchRequest}>
								Search
							</Button>

						</Form>
					</div>
				</>
			)}
			{isLoading && <img src={loadingGif} alt="loading" />}
			</>
		)}		
		</>
	);
	
}
export default ProfileSearch;