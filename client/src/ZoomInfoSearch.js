import React, {useState, useEffect} from "react";
import {CheckJobStatus} from "./CheckJobStatus.js";
import {useNavigate} from 'react-router-dom';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

import './ProfileSearch.css';
import ErrorModal from "./ErrorModal.js";

function ZoomInfoSearch() {
	
	// const {sessionId} = props;
	// console.log("ProfileSearch", sessionId);
	
	const [companyName, setCompanyName] = useState("");
	const [location, setLocation] = useState("");
	
	const [jobFinished, setJobFinished] = useState(false);
	const [resultArray, setResultArray] = useState([]);
		
	const [isLoading, setIsLoading] = useState(false);

	const navigate = useNavigate();
	const [error, setError] = useState(null);
		
	const handleZoomInfoSearchRequest = async () => {
		try {
			const response = await fetch("https://sak-productivity-suite.herokuapp.com/search-zoominfo", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					companyName: companyName
				})
			});
			if (response.ok){
				setIsLoading(true);
			
				const data = await response.json();
				if (data.success === true){
					// console.log(data);
					const resultArray = data['data']['result'][0]['data'];
					// console.log(resultArray);
	
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
				navigate("/display-zoominfo-search-results", {state: {resultArray: resultArray} })
			) : (
				<>
					<div className="search-form-container">
						<Form className="search-form">

							<Form.Group className="mb-3" controlId="formPosition">
								<FloatingLabel 
									controlId="floatingInput" 
									label="Enter Company name"
									className="mb-3" >
									<Form.Control 
										type="text"
										value={companyName}
										onChange={(e) => setCompanyName(e.target.value)} />
									<Form.Text className="text-muted">
										Company name you want to search
									</Form.Text>
								</FloatingLabel>
							</Form.Group>
							
							<Button variant="primary" type="button" onClick={handleZoomInfoSearchRequest}>
								{isLoading ? 'Results Loading...' : 'Search'}
							</Button>

						</Form>
					</div>
				</>
			)}		
		</>
	);
}
export default ZoomInfoSearch;