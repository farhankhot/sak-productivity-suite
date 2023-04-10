import React, {useState, useEffect} from "react";
import { useLocation } from 'react-router-dom';
import { ButtonGroup, ListGroup } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';

function DisplayZoomInfoSearchResults() {
	
	const location = useLocation();
	const resultArray = location.state?.resultArray;
    console.log("DisplayZoomInfoSearchResults resultArray: ", resultArray);
		
	const [showProfileArea, setShowProfileArea] = useState(false);
	const [profileInfoArray, setProfileInfoArray] = useState([]);
		
	useEffect(() => {
		setProfileInfoArray(resultArray);
	}, [resultArray]);	
		
		
	return (
		<Container>
			<h1>Search Results:</h1>
			<ListGroup>
					{profileInfoArray.map((companyInfo, index) => (
						<ListGroup.Item
							onClick={() => {
								setShowProfileArea(true);
							}}>
                            <h1>{companyInfo[index].name}</h1>
                            <p>{companyInfo[index].city}, {companyInfo[index].country}</p>
							
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
