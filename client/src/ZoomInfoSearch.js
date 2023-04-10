import React, {useState, useEffect} from "react";
import {CheckJobStatus} from "./CheckJobStatus.js";
import {useNavigate} from 'react-router-dom';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

import './ProfileSearch.css';

function ZoomInfoSearch() {
	
	// const {sessionId} = props;
	// console.log("ProfileSearch", sessionId);
	
	const [companyName, setCompanyName] = useState("");
	const [location, setLocation] = useState("");
	
	const [jobFinished, setJobFinished] = useState(false);
	const [resultArray, setResultArray] = useState([]);
		
	const [isLoading, setIsLoading] = useState(false);

	const navigate = useNavigate();
		
	const handleZoomInfoSearchRequest = async () => {
		try {
			const response = await fetch("https://sak-productivity-suite.herokuapp.com/search-zoominfo", {
				method: "GET",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					companyName: companyName
				})
			});

			setIsLoading(true);
			
			const data = await response.json();
			console.log(data);
			const resultArray = data.message;

			setResultArray(resultArray);	
			setJobFinished(true);

		} catch (error) {
			console.error(error);
		}
	};
	
	return (
		<>
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

							{/* <Form.Group className="mb-3" controlId="formLocation">
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
							</Form.Group> */}
							
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