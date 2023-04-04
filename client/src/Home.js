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
	
	const [noteTextArea, setNoteTextArea] = useState(""); 
	
	const [peopleInterestsArray, setPeopleInterestsArray] = useState([]);	
	const [companyInterestsArray, setCompanyInterestsArray] = useState([]);	
	// const [activityInterestsArray, setActivityInterestsArray] = useState([]);
	// const [selectedInterests, setSelectedInterests] = useState("");

	const [showProfileArea, setShowProfileArea] = useState(false);
	const [selectedName, setSelectedName] = useState("");

	const [leadsArray, setLeadsArray] = useState([]);
	const [showCreateConnectNoteButton, setShowCreateConnectNoteButton] = useState(false);

	const [connectNoteArray, setConnectNoteArray] = useState([]);

	const [memberUrnIdArray, setMemberUrnIdArray] = useState([]);
		
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
			const leadsArray = data.lead_list;
			// console.log("Successfully gotten leads: ", data);
			const memberUrnIdArray = data.member_urn_id_list; 
			setLeadsArray(leadsArray);
			setMemberUrnIdArray(memberUrnIdArray);
			setShowCreateConnectNoteButton(true);
		}catch(error){
			console.log(error);
		}	
	};

	// This button goes through the lead list and creates a Connect note for them
	// It chooses max 5 relationships + interests and prompts Bing Chat to output a Connect note 
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
			
			CheckJobStatus(jobId.message, (resultArray) => {
				// This gets an array of Connect Notes for each person in the lead list
				// Save to an array, then display a textbox and the note for each note in list
				setConnectNoteArray(resultArray);
				console.log("Successfully gotten Connect note array: ", resultArray);
			});
			
			
		}catch(error){
			console.log(error);
		}
	};

	const handleGettingPeopleInterests = async (sessionId, profileUrn) => {
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
			
			CheckJobStatus(jobId, (peopleInterestsArray) => {
				
				setPeopleInterestsArray(peopleInterestsArray);	
			});

		} catch (error) {
			console.error(error);
		}
	};
	
	const handleGettingCompanyInterests = async (sessionId, profileUrn) => {
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
			
			CheckJobStatus(jobId, (companyInterestsArray) => {
				
				setCompanyInterestsArray(companyInterestsArray);	
			});
		} catch (error) {
			console.error(error);
		}
	};
	
	// const handleGettingActivityInterests = () => {
		// // TODO
	// };
	
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
	
	// ================ Create and Send Connect Note(s) ===============================
	const handleMakingConnectNote = async (fullName) => {
		
		// TODO: Add summary, interests back
		const prompt = "This is the profile of a person: " + fullName
		+ " This is their summary: " +
		" These are their interests: " + 
		+ " Use the internet to get something useful about the interests and use it in the request. "
		+ " Write a request to connect with them. Make it casual but eyecatching. The goal is to ask about their current Salesforce implementation. The length should be no more than 300 characters.";
		
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
			
			CheckJobStatus(jobId, (resultArray) => {
				
				setNoteTextArea(resultArray);	
			});

		}catch(error){
			console.log(error);
		}
	};

	const handleSendingConnectNote = async (sessionId, profileId) => {
		try {
			const response = await fetch("https://sak-productivity-suite.herokuapp.com/send-connect", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					sessionId: sessionId,
					profileId: profileId,
					text: noteTextArea
				})
			});
			const data = await response.json();
			console.log("Successfully sent the connect note to the person", data.message);
		}catch(error){
			console.log(error);
		}
	};

	// const handleSendingMultipleConnectNote = async (sessionId) => {
	// 	try {
	// 		const response = await fetch("https://sak-productivity-suite.herokuapp.com/send-multiple-connect", {
	// 			method: "POST",
	// 			headers: {
	// 				"Content-Type": "application/json"
	// 			},
	// 			body: JSON.stringify({
	// 				sessionId: sessionId,
	// 				memberUrnIdArray: memberUrnIdArray,
	// 				text: connectNoteArray
	// 			})
	// 		});
	// 		const data = await response.json();
	// 		console.log("Successfully sent the connect note to the person", data.message);
	// 	}catch(error){
	// 		console.log(error);
	// 	}
	// };
	// ================ Create and Send Connect Note(s) ===============================

	const handleNoteTextAreaChange = (event, index) => {
		const updatedConnectNote = [...connectNoteArray];
		updatedConnectNote[index] = event.target.value;
		setConnectNoteArray(updatedConnectNote);
	};

	return (
		<>
            <Button variant="primary" type="button" onClick={handleGettingLeads}>
                Get leads
            </Button>
			{showCreateConnectNoteButton && <Button variant="primary" type="button" onClick={() => handleAutoCreatingNotes(sessionId, leadsArray[0][4])}>
                Auto Create notes for all leads
            </Button>}

			{/* DONE: Add the 4 usual buttons after handleAutoCreatingNotes, Add a send to all button */}
			{/* DONE: Add option to click the lead div and have 4 usual buttons+textarea popup */}
			
			{/* TODO: Check if getting all lead_info works (relationships, interests) */}
			<Container>
				<h1>Search Results:</h1>
				<ListGroup>
					{leadsArray.map((leadInfo, index) => (
						<ListGroup.Item
							onClick={() => {
								setShowProfileArea(true);
								setSelectedName(leadInfo[4]);
							}}
						>
							{leadInfo[0]}, {leadInfo[1]}

							{(connectNoteArray.length > 0) || (showProfileArea && selectedName===leadInfo[4]) && (
								<div>
									<Form.Group>
										<Form.Control
											as="textarea"
											value={connectNoteArray[index]} 
											onChange={handleNoteTextAreaChange(index)}
										/>
									</Form.Group>
									
									<ButtonGroup aria-label="Basic example" className="mb-2">
										<Button onClick={ () => {
											handleGettingPeopleInterests(sessionId, leadInfo[4])
										}}
										>
											Get people interests
										</Button>
										<Button onClick={ () => {
											handleGettingCompanyInterests(sessionId, leadInfo[4])
										}}>
											Get company interests
										</Button>
										<Button onClick={ () => {
											handleMakingConnectNote(leadInfo[0])
										}}>
											Make Connect Note
										</Button>										
										<Button onClick={ () => {
											handleSendingConnectNote(sessionId, leadInfo[4])
										}}>
											Send Connect Note
										</Button>
									</ButtonGroup>
									
								</div>
							)}
						</ListGroup.Item>
					))}
				</ListGroup>
				{/* {connectNoteArray.length > 0 && (<Button onClick={handleSendingMultipleConnectNote(sessionId)}>
					Send Connect Note to all leads
				</Button>)} */}
			</Container>
		</>
	)
}
export default Home;