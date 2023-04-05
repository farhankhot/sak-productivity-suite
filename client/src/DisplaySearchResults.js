import React, {useState, useEffect} from "react";
import {CheckJobStatus} from "./CheckJobStatus.js";
import { useLocation } from 'react-router-dom';
import { ButtonGroup, ListGroup } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';

function DisplaySearchResults() {
	
	const location = useLocation();
	const sessionId = location.state?.sessionId;
	const resultArray = location.state?.resultArray;
	// console.log("DisplaySearchResults sessionId: ", sessionId);
	
	// TODO: get this information, for now backend is not returning it
	// const [summary, setSummary] = useState("");
	// const [skills, setSkills] = useState("");
	
	// TODO: May come a time where results are more than 50, will cause error
	// Solution: have useEffect and check the length of the resultArray before allocating array size
	const [peopleInterestsArray, setPeopleInterestsArray] = useState(Array.from({length: 50}, () => []));
	const [companyInterestsArray, setCompanyInterestsArray] = useState(Array.from({length: 50}, () => []));
	// const [activityInterestsArray, setActivityInterestsArray] = useState([]);
	
	const [isLoading, setIsLoading] = useState(false);

	const [showProfileArea, setShowProfileArea] = useState(false);
	const [profileInfoArray, setProfileInfoArray] = useState([]);
	
	// useEffect(() => {
	// 	const temp = []
	// 	for (let i = 0; i < resultArray.length; i += 1) {
	// 		temp.push([ 
	// 			resultArray[i]["full_name"],
	// 			resultArray[i]["latest_title"],
	// 			resultArray[i]["current_company"],
	// 			resultArray[i]["location"],
	// 			resultArray[i]["profile_urn"]
	// 		])
	// 	}
	// 	setProfileInfoArray(temp);
	// }, [resultArray]);
	
	useEffect(() => {
		setProfileInfoArray(resultArray);
	}, [resultArray]);	
		
	const handleGettingPeopleInterests = async (sessionId, profileUrnStr, index) => {
		
		setIsLoading(true);
		
		const startIndex = profileUrnStr.indexOf("(") + 1;
		const endIndex = profileUrnStr.indexOf(",");
		const profileUrn = profileUrnStr.substring(startIndex, endIndex);
		
		try {
			const response = await fetch("https://sak-productivity-suite.herokuapp.com/get-people-interests", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					sessionId: sessionId,
					profileUrn: profileUrn
				})
			});
			
			const data = await response.json();			
			const jobId = data.message;
			
			CheckJobStatus(jobId, (resultArray) => {
				setIsLoading(false);
				const newArray = [...peopleInterestsArray];
				for (let i = 0; i < resultArray.length; i++){
					newArray[index].push(resultArray[i]);
				}
				setPeopleInterestsArray(newArray);	
			});

		} catch (error) {
			console.error(error);
		}
	};
	
	const handleGettingCompanyInterests = async (sessionId, profileUrnStr, index) => {
		
		setIsLoading(true);

		const startIndex = profileUrnStr.indexOf("(") + 1;
		const endIndex = profileUrnStr.indexOf(",");
		const profileUrn = profileUrnStr.substring(startIndex, endIndex);

		try {
			const response = await fetch("https://sak-productivity-suite.herokuapp.com/get-company-interests", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					sessionId: sessionId,
					profileUrn: profileUrn
				})
			});
			
			const data = await response.json();
			const jobId = data.message;
			
			CheckJobStatus(jobId, (resultArray) => {
				setIsLoading(false);
				const newArray = [...companyInterestsArray];
				for (let i = 0; i < resultArray.length; i++){
					newArray[index].push(resultArray[i]);
				}
				setCompanyInterestsArray(newArray);
			});
		} catch (error) {
			console.error(error);
		}
	};
	
	// const handleGettingActivityInterests = () => {
		// // TODO
	// };
		
	return (
		<Container>
			<h1>Search Results:</h1>
			<ListGroup>
					{profileInfoArray.map((leadInfo, index) => (
						<ListGroup.Item
							onClick={() => {
								setShowProfileArea(true);
							}}>
							{leadInfo[0]}, {leadInfo[1]}
							
							{showProfileArea && (
								<div>
									
									<ButtonGroup aria-label="Basic example" className="mb-2">
										<Button onClick={ () => {
											handleGettingPeopleInterests(sessionId, leadInfo[4], index)
										}}>
											Get people interests
										</Button>
										<Button onClick={ () => {
											handleGettingCompanyInterests(sessionId, leadInfo[4], index)
										}}>
											Get company interests
										</Button>
										
									</ButtonGroup>

									{/* {peopleInterestsArray[index].length > 0 && (
										<ListGroup.Item>
											<Form.Control
											as="select"
											multiple
											onChange={handleInterestsSelection}
											>
											{peopleInterestsArray[index].map((interest) => (
												<option key={interest}>{interest[0]}</option>
											))}
											</Form.Control>
										</ListGroup.Item>
									)}
									
									{companyInterestsArray[index].length > 0 && (
										<ListGroup.Item>
											<Form.Control
											as="select"
											multiple
											onChange={handleInterestsSelection}
											>
											{companyInterestsArray[index].map((interest) => (
												<option key={interest}>{interest[0]}</option>
											))}
											</Form.Control>
										</ListGroup.Item>
									)} */}
									
									{/* {activityInterestsArray.length > 0 && (
										<ListGroup.Item>
											<Form.Control
											as="select"
											multiple
											onChange={handleInterestsSelection}
											>
											{activityInterestsArray.map((interest) => (
												<option key={interest}>{interest[0]}</option>
											))}
											</Form.Control>
										</ListGroup.Item>
									)} */}

								</div>
							)}
						</ListGroup.Item>
					))}
				</ListGroup>
		</Container>
	);
}
export default DisplaySearchResults;
