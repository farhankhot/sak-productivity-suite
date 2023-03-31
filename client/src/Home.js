import React, {useState, useEffect} from "react";
import {useNavigate} from 'react-router-dom';
import {CheckJobStatus} from "./CheckJobStatus.js";
import Button from 'react-bootstrap/Button';
import { ButtonGroup, ListGroup } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';

function Home(props) {
	const {sessionId} = props;
	// console.log("Home sessionId: ", sessionId);

	// ========= Need to get this information, for now backend is not returning it ============
	// const [summary, setSummary] = useState("");
	// const [skills, setSkills] = useState("");
	// ========= Need to get this information, for now backend is not returning it ============
	
	// const [noteTextArea, setNoteTextArea] = useState(""); 
	
	// const [peopleInterestsArray, setPeopleInterestsArray] = useState([]);	
	// const [companyInterestsArray, setCompanyInterestsArray] = useState([]);	
	// const [activityInterestsArray, setActivityInterestsArray] = useState([]);
	// const [selectedInterests, setSelectedInterests] = useState("");
	
	// const [isLoading, setIsLoading] = useState(false);

	// const [showProfileArea, setShowProfileArea] = useState(false);
	// const [leadInfoArray, setleadInfoArray] = useState([]);

	// const [selectedName, setSelectedName] = useState("");

	const [leadsArray, setLeadsArray] = useState([]);

    // TODO: show leads, create List group of leads
    // Have a button that gets all of the interests and creates connect note
    // Save leads to database
		
	const handleGettingLeads = async() => {
        try {
			const response = await fetch("https://sak-productivity-suite.herokuapp.com/get-leads", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					sessionId: sessionId
				})
			});
			const data = await response.json();
			console.log("Successfully gotten leads: ", data.message);
			setLeadsArray(leadsArray);
		}catch(error){
			console.log(error);
		}	
	};
			
	// const handleGettingPeopleInterests = async (sessionId, profileUrn) => {
	// 	setIsLoading(true);
	// 	try {
	// 		const response = await fetch("https://sak-productivity-suite.herokuapp.com/get-people-interests", {
	// 			method: "POST",
	// 			headers: {
	// 				"Content-Type": "application/json"
	// 			},
	// 			body: JSON.stringify({
	// 				sessionId: sessionId,
	// 				profileUrn: profileUrn
	// 			})
	// 		});
			
	// 		const data = await response.json();			
	// 		const jobId = data.message;
			
	// 		CheckJobStatus(jobId, (peopleInterestsArray) => {
	// 			setIsLoading(false);
	// 			setPeopleInterestsArray(peopleInterestsArray);	
	// 		});

	// 	} catch (error) {
	// 		console.error(error);
	// 	}
	// };
	
	// const handleGettingCompanyInterests = async (sessionId, profileUrn, publicId) => {
	// 	setIsLoading(true);
	// 	try {
	// 		const response = await fetch("https://sak-productivity-suite.herokuapp.com/get-company-interests", {
	// 			method: "POST",
	// 			headers: {
	// 				"Content-Type": "application/json"
	// 			},
	// 			body: JSON.stringify({
	// 				sessionId: sessionId,
	// 				profileUrn: profileUrn,
	// 				publicId: publicId
	// 			})
	// 		});
			
	// 		const data = await response.json();
	// 		const jobId = data.message;
			
	// 		CheckJobStatus(jobId, (companyInterestsArray) => {
	// 			setIsLoading(false);
	// 			setCompanyInterestsArray(companyInterestsArray);	
	// 		});
	// 	} catch (error) {
	// 		console.error(error);
	// 	}
	// };
	
	// // const handleGettingActivityInterests = () => {
	// 	// // TODO
	// // };
	
	// const handleInterestsSelection = (event) => {
	// 	var selections = event.target.options;
	// 	const updatedInterestsArray = [];
	// 	for (var i = 0; i < selections.length; i++){
	// 		if(selections[i].selected){
	// 			updatedInterestsArray.push(selections[i].value);
	// 		}
	// 	}
	// 	setSelectedInterests(updatedInterestsArray);
	// }
	
	// const handleMakingConnectNote = async (fullName) => {
	// 	const prompt = "This is the profile of a person: " + "\n" + fullName 
	// 	+ " This is their summary: " +
	// 	" These are their interests: " + selectedInterests 
	// 	+ " Use the internet to get something useful about the interests and use it in the request. "
	// 	+ " Write a request to connect with them. Make it casual but eyecatching. The goal is to ask about their current Salesforce implementation. The length should be no more than 300 characters.";
	// 	setIsLoading(true);
	// 	try {
	// 		const response = await fetch("https://sak-productivity-suite.herokuapp.com/use-bingai", {
	// 			method: "POST",
	// 			headers: {
	// 				"Content-Type": "application/json"
	// 			},
	// 			body: JSON.stringify({
	// 				prompt: prompt
	// 			})
	// 		});
	// 		const data = await response.json();
	// 		const jobId = data.message;
	// 		CheckJobStatus(jobId, (resultArray) => {
	// 			setIsLoading(false);
	// 			setNoteTextArea(resultArray);	
	// 		});
	// 	}catch(error){
	// 		console.log(error);
	// 	}
	// };
	
	// const handleSendingConnectNote = async (sessionId, profileId) => {
	// 	try {
	// 		const response = await fetch("https://sak-productivity-suite.herokuapp.com/send-connect", {
	// 			method: "POST",
	// 			headers: {
	// 				"Content-Type": "application/json"
	// 			},
	// 			body: JSON.stringify({
	// 				sessionId: sessionId,
	// 				profileId: profileId,
	// 				text: noteTextArea
	// 			})
	// 		});
	// 		const data = await response.json();
	// 		console.log("Successfully sent the connect note to the person", data.message);
	// 	}catch(error){
	// 		console.log(error);
	// 	}
	// };
	
	// const handleNoteTextAreaChange = (event) => {
	// 	setNoteTextArea(event.target.value);
	// };

	return (
		<>
            <Button variant="primary" type="button" onClick={handleGettingLeads}>
                Get Leads
            </Button>

			{/* profile_info['full_name'] = person['fullName']
			profile_info['latest_title'] = person['currentPositions'][0]['title']        
			profile_info['latest_title_company'] = person['currentPositions'][0]['companyName']
			profile_info['geo_region'] = person['geoRegion']
			profile_info['member_urn_id'] = person['entityUrn'] */}

			<Container>
				<h1>Search Results:</h1>
				<ListGroup>
					{leadsArray.map((leadInfo) => (
						<ListGroup.Item
							// action
							// onClick={() => {
							// 	setShowProfileArea(true);
							// 	setSelectedName(leadInfo[0]);
							// }}
						>
							{leadInfo[0]}, {leadInfo[1]}
							{/* {showProfileArea && selectedName === leadInfo[0] && (
								<>
									<Form.Group>
									<Form.Control
										as="textarea"
										value={noteTextArea}
										onChange={handleNoteTextAreaChange}
										placeholder="The generated note will appear here"
									/>
									</Form.Group>

									<ButtonGroup aria-label="Basic example" className="mb-2">
										<Button onClick={handleGettingPeopleInterests(sessionId, leadInfo[4])}>
											Get people interests
										</Button>
										<Button onClick={handleGettingCompanyInterests(sessionId, leadInfo[4], leadInfo[3])}>
											Get company interests
										</Button>
										<Button onClick={handleMakingConnectNote(leadInfo[0])}>
											Make Connect Note
										</Button>
										<Button onClick={handleSendingConnectNote(sessionId, leadInfo[2])}>
											Send Connect Note
										</Button>
									</ButtonGroup>

									{peopleInterestsArray.length > 0 && (
										<ListGroup.Item>
											<Form.Control
											as="select"
											multiple
											onChange={handleInterestsSelection}
											>
											{peopleInterestsArray.map((interest) => (
												<option key={interest}>{interest[0]}</option>
											))}
											</Form.Control>
										</ListGroup.Item>
									)}

									{companyInterestsArray.length > 0 && (
										<ListGroup.Item>
											<Form.Control
											as="select"
											multiple
											onChange={handleInterestsSelection}
											>
											{companyInterestsArray.map((interest) => (
												<option key={interest}>{interest[0]}</option>
											))}
											</Form.Control>
										</ListGroup.Item>
									)}

									{activityInterestsArray.length > 0 && (
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
									)}
								</>
							)} */}
						</ListGroup.Item>
					))}
				</ListGroup>
			</Container>
		</>
	)
}
export default Home;