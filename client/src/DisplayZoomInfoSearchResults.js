import React, {useState, useEffect} from "react";
import { useLocation } from 'react-router-dom';
import { ButtonGroup, ListGroup } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Accordion from 'react-bootstrap/Accordion';

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
                            <p>{companyInfo.descriptionList[0].description}</p>
							<p>Employee Count: {companyInfo.employeeCount}</p>
                            <p>Revenue Range: {companyInfo.revenueRange}</p>
                            <p>Website: <a href={companyInfo.website}>Link</a></p>
                            <Accordion>
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header>Business model</Accordion.Header>
                                    <Accordion.Body>
                                        <ul>
                                            {companyInfo.businessModel.map((model, index) => (
                                                <li key={index}>{model}</li>
                                            ))}
                                        </ul>
                                    </Accordion.Body>
                                </Accordion.Item>
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header>Competitors</Accordion.Header>
                                    <Accordion.Body>
                                        <ul>
                                            {companyInfo.competitors.map((competitor, index) => (
                                                <li key={index}>{competitor.name}</li>
                                            ))}
                                        </ul>
                                    </Accordion.Body>
                                </Accordion.Item>
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header>Primary Industries</Accordion.Header>
                                    <Accordion.Body>
                                        <ul>
                                            {companyInfo.primaryIndustry.map((industry, index) => (
                                                <li key={index}>{industry}</li>
                                            ))}
                                        </ul>
                                    </Accordion.Body>
                                </Accordion.Item>
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header>Sub Unit Industries</Accordion.Header>
                                    <Accordion.Body>
                                        <ul>
                                            {companyInfo.subUnitIndustries.map((industry, index) => (
                                                <li key={index}>{industry}</li>
                                            ))}
                                        </ul>
                                    </Accordion.Body>
                                </Accordion.Item>
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
