import React, {useState, useEffect} from "react";
import {CheckJobStatus} from "./CheckJobStatus.js";
import {useNavigate} from 'react-router-dom';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

import './ProfileSearch.css';
import ErrorModal from "./ErrorModal.js";

function ProfileSearch(props) {
	
	const {sessionId} = props;
	// console.log("ProfileSearch", sessionId);
	
	const [leadName, setLeadName] = useState("");
	const [title, setTitle] = useState("");
	const [location, setLocation] = useState("");
	const [currentCompany, setCurrentCompany] = useState("");
	
	const [jobFinished, setJobFinished] = useState(false);
	const [resultArray, setResultArray] = useState([]);
		
	const [isLoading, setIsLoading] = useState(false);

	const navigate = useNavigate();
	const [error, setError] = useState(null);
		
	const handleSearchRequest = async () => {
		try {
			const response = await fetch("https://sak-productivity-suite.herokuapp.com/search-leads-in-db", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					sessionId: sessionId,
					leadName: leadName,
					title: title,
					currentCompany: currentCompany,
					location: location
				})
			});
			if (response.ok){
				setIsLoading(true);
				const data = await response.json();
				if (data.success === true) {
					const resultArray = data.message;
					setResultArray(resultArray);	
					setJobFinished(true);
				}else{
					console.log("an error occurred");
					setError("error occurred");
				}
			}else {
				console.log("error occurred");
				setError("error occurred");
			}
		} catch (error) {
			console.log("error occurred");
			setError("error occurred");
		}
	};
	
	return (
		<>
			{error && <ErrorModal errorMessage={error} onClose={() => setError(null)} />}

			{jobFinished === true ? (
				navigate("/display-linkedin-search-results", {state: {sessionId: sessionId, resultArray: resultArray} })
			) : (
				<>
					<div className="search-form-container">
						<Form className="search-form">

							<Form.Group className="mb-3" controlId="formPosition">
								<FloatingLabel 
									controlId="floatingInput" 
									label="Enter name"
									className="mb-3" >
									<Form.Control 
										type="text"
										value={leadName}
										onChange={(e) => setLeadName(e.target.value)} />
									<Form.Text className="text-muted">
										The name you want to search (Optional)
									</Form.Text>
								</FloatingLabel>
							</Form.Group>

							<Form.Group className="mb-3" controlId="formPosition">
								<FloatingLabel 
									controlId="floatingInput" 
									label="Enter position"
									className="mb-3" >
									<Form.Control 
										type="text"
										value={title}
										onChange={(e) => setTitle(e.target.value)} />
									<Form.Text className="text-muted">
										The position you want to search
									</Form.Text>
								</FloatingLabel>
							</Form.Group>

							<Form.Group className="mb-3" controlId="formCurrentCompany">
								<FloatingLabel 
									label="Enter current company"
									className="mb-3" >
									<Form.Control 
										type="text" 
										value={currentCompany}
										onChange={(e) => setCurrentCompany(e.target.value)}
									/>
									<Form.Text className="text-muted">
										Which company's employees do you want to search?
									</Form.Text>
								</FloatingLabel>
							</Form.Group>

							<Form.Group className="mb-3" controlId="formLocation">
								<FloatingLabel 
										controlId="floatingInput" 
										label="Enter location"
										className="mb-3" >
									<Form.Control 
										type="text"
										value={location} 
										onChange={(e) => setLocation(e.target.value)} />
									<Form.Text className="text-muted">
										The location you want to search
									</Form.Text>
								</FloatingLabel>
							</Form.Group>
							
							<Button variant="primary" type="button" onClick={handleSearchRequest}>
								{isLoading ? 'Results Loading...' : 'Search'}
							</Button>

						</Form>
					</div>
				</>
			)}		
		</>
	);
}
export default ProfileSearch;