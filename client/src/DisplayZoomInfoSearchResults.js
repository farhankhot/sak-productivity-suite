import React, {useState, useEffect} from "react";
import { useLocation } from 'react-router-dom';
import { ButtonGroup, ListGroup } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import { Accordion, Card, Button } from 'react-bootstrap';

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
                            <h1>{companyInfo.name}</h1>
                            <p>{companyInfo.city}, {companyInfo.country}</p>
							<p>Employee Count: {companyInfo.employeeCount}</p>
                            <p>Revenue Range: {companyInfo.revenueRange}</p>
                            <p>Website: <a href={companyInfo.website}>Link</a></p>
                            <Accordion>
                                <Card>
                                    <Card.Header>
                                    <Accordion.Toggle as={Button} variant="link" eventKey="0">
                                        Competitors
                                    </Accordion.Toggle>
                                    </Card.Header>
                                    <Accordion.Collapse eventKey="0">
                                    <Card.Body>
                                        <ul>
                                        {companyInfo.competitors.map((competitor, index) => (
                                            <li key={index}>{competitor.name}</li>
                                        ))}
                                        </ul>
                                    </Card.Body>
                                    </Accordion.Collapse>
                                </Card>
                            </Accordion>
  
							{/* {showProfileArea && (
								<div>
									
								</div>
							)} */}
						</ListGroup.Item>
					))}
				</ListGroup>
		</Container>
	);
}
export default DisplayZoomInfoSearchResults;
