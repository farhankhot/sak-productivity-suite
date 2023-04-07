import React, {useState, useEffect} from "react";
import {useNavigate} from 'react-router-dom';
import {CheckJobStatus} from "./CheckJobStatus.js";
import Button from 'react-bootstrap/Button';
import { ButtonGroup, ListGroup } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';

function Home(props) {
	const {sessionId} = props;
	// console.log("Home sessionId: ", sessionId);

	const [isLoading, setIsLoading] = useState(false);
		
	const [peopleInterestsArray, setPeopleInterestsArray] = useState(Array.from({length: 25}, () => []));
	const [companyInterestsArray, setCompanyInterestsArray] = useState(Array.from({length: 25}, () => []));
	// const [activityInterestsArray, setActivityInterestsArray] = useState(Array.from({length: 25}, () => []));
	const [selectedInterests, setSelectedInterests] = useState("");

	const [showProfileArea, setShowProfileArea] = useState(false);

	const [leadsArray, setLeadsArray] = useState([]);
	const [memberUrnIdArray, setMemberUrnIdArray] = useState([]);

	const [showCreateConnectNoteButton, setShowCreateConnectNoteButton] = useState(false);
	const [connectNoteArray, setConnectNoteArray] = useState([]);
		
	const handleGettingLeads = async() => {
        try {
			setIsLoading(true);
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
			const leadsArray = data.lead_list;
			// console.log("Successfully gotten leads: ", data);
			const memberUrnIdArray = data.member_urn_id_list; 
			setLeadsArray(leadsArray);
			setMemberUrnIdArray(memberUrnIdArray);
			setShowCreateConnectNoteButton(true);
		}catch(error){
			console.log(error);
		}finally {
			setIsLoading(false);
		}
	};

	// This button goes through the lead list and creates a Connect note for them
	const handleAutoCreatingNotes = async(sessionId, memberUrnId) => {
		try {
			const response = await fetch("https://sak-productivity-suite.herokuapp.com/get-lead-info", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					sessionId: sessionId,
					leadsArray: leadsArray,
					memberUrnIdArray: memberUrnIdArray
				})
			});
			const jobId = await response.json();
			setIsLoading(true);
			CheckJobStatus(jobId.message, (resultArray) => {
				setConnectNoteArray(resultArray);
				setShowProfileArea(true);
				console.log("Successfully gotten Connect note array: ", resultArray);
				setIsLoading(false);
			});
		}catch(error){
			console.log(error);
		}
	};

	const handleGettingPeopleInterests = async (sessionId, profileUrnStr, index) => {
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
			setIsLoading(true);
			CheckJobStatus(jobId, (resultArray) => {
				const newArray = [...peopleInterestsArray];
				for (let i = 0; i < resultArray.length; i++){
					newArray[index].push(resultArray[i]);
				}
				setPeopleInterestsArray(newArray);
				setIsLoading(false);
			});
		} catch (error) {
			console.error(error);
		}
	};
	
	const handleGettingCompanyInterests = async (sessionId, profileUrnStr, index) => {
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
			setIsLoading(true);
			CheckJobStatus(jobId, (resultArray) => {
				const newArray = [...companyInterestsArray];
				for (let i = 0; i < resultArray.length; i++){
					newArray[index].push(resultArray[i]);
				}
				setCompanyInterestsArray(newArray);	
				setIsLoading(false);
			});
		} catch (error) {
			console.error(error);
		}
	};
	
	// TODO
	// const handleGettingActivityInterests = () => { };
			
	// TODO: Gets all of the selected interests, not just the current lead's
	const handleInterestsSelection = (event) => {
		var selections = event.target.options;
		const updatedInterestsArray = [];
		for (var i = 0; i < selections.length; i++){
			if(selections[i].selected){
				updatedInterestsArray.push(selections[i].value);
			}
		}
		setSelectedInterests(updatedInterestsArray);
	}

	// ================ Create and Send Connect Note(s) ===============================
	const handleMakingConnectNote = async (fullName, index) => {
		const prompt = "This is the profile of a person: " + fullName
		+ " These are their interests: " + selectedInterests
		+ " Use the internet to get something useful about the interests and use it in the request. "
		+ " Write a request to connect with them. Make it casual but eyecatching. The goal is to ask about their current Salesforce implementation. Use only 300 characters.";
		try {
			const response = await fetch("https://sak-productivity-suite.herokuapp.com/use-bingai", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					prompt: prompt
				})
			});
			
			const data = await response.json();
			const jobId = data.message;
			setIsLoading(true);
			CheckJobStatus(jobId, (resultArray) => {
				const newArray = [...connectNoteArray];
				newArray[index] = resultArray;
				setConnectNoteArray(newArray);
				setIsLoading(false);	
			});

		}catch(error){
			console.log(error);
		}
	};

	const handleSendingConnectNote = async (sessionId, profileId, index) => {
		try {
			const response = await fetch("https://sak-productivity-suite.herokuapp.com/send-connect", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					sessionId: sessionId,
					profileId: profileId,
					text: connectNoteArray[index]
				})
			});
			const data = await response.json();
			console.log("Successfully sent the connect note to the person", data.message);
		}catch(error){
			console.log(error);
		}
	};
	// ================ Create and Send Connect Note(s) ===============================

	const handleNoteTextAreaChange = (event, index) => {
		const updatedConnectNoteArray = [...connectNoteArray];
		updatedConnectNoteArray[index] = event.target.value;
		setConnectNoteArray(updatedConnectNoteArray);
	};	  

	return (
		<>
            <Button variant="primary" type="button" onClick={handleGettingLeads}>
				{isLoading ? 'Getting Leads...' : 'Get Leads'}
            </Button>

			{showCreateConnectNoteButton && <Button variant="primary" type="button" onClick={() => handleAutoCreatingNotes(sessionId, leadsArray[0][4])}>
				{isLoading ? 'Creating Notes...' : 'Auto Create notes for all leads'}
            </Button>}

			<Container>
				<h1>Sales Navigator List:</h1>
				<ListGroup>
					{leadsArray.map((leadInfo, index) => (
						<ListGroup.Item
							onClick={() => {
								setShowProfileArea(true);
							}}>
							{leadInfo[0]}, {leadInfo[1]}
							
							{showProfileArea && (
								<div>
									<Form.Group>
										<Form.Control
											as="textarea"
											value={connectNoteArray[index]} 
											onChange={ (event) => {
												handleNoteTextAreaChange(event, index)
											}}
										/>
									</Form.Group>
									<ButtonGroup aria-label="Basic example" className="mb-2">
										<Button onClick={ () => {
											handleGettingPeopleInterests(sessionId, leadInfo[4], index)
										}}>
											{isLoading ? 'Loading...' : 'Get people interests'}
										</Button>
										<Button onClick={ () => {
											handleGettingCompanyInterests(sessionId, leadInfo[4], index)
										}}>
											{isLoading ? 'Loading...' : 'Get company interests'}
										</Button>
										<Button onClick={ () => {
											handleMakingConnectNote(leadInfo[0], index)
										}}>
											Make Connect Note
										</Button>										
										<Button onClick={ () => {
											handleSendingConnectNote(sessionId, leadInfo[4], index)
										}}>
											Send Connect Note
										</Button>
									</ButtonGroup>

									{peopleInterestsArray[index].length > 0 && (
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
									)}
									
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
		</>
	)
}
export default Home;