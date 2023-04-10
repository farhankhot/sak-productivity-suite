import React, {useState, useEffect} from "react";
import {CheckJobStatus} from "./CheckJobStatus.js";
import { useLocation } from 'react-router-dom';
import { ButtonGroup, ListGroup } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';

function DisplayZoomInfoSearchResults() {
	
	const location = useLocation();
	const resultArray = location.state?.resultArray;
		
	const [isLoading, setIsLoading] = useState(false);

	const [showProfileArea, setShowProfileArea] = useState(false);
	const [profileInfoArray, setProfileInfoArray] = useState([]);
		
	useEffect(() => {
		setProfileInfoArray(resultArray);
	}, [resultArray]);	
		
		
	return (
		<Container>
			<h1>Search Results:</h1>
			<ListGroup>
					{profileInfoArray.map((leadInfo, index) => (
						<ListGroup.Item
							onClick={() => {
								setShowProfileArea(true);
							}}>
							{leadInfo[0]}, {leadInfo[1]} at {leadInfo[2]}
							
							{showProfileArea && (
								<div>
									
								

								</div>
							)}
						</ListGroup.Item>
					))}
				</ListGroup>
		</Container>
	);
}
export default DisplayZoomInfoSearchResults;
