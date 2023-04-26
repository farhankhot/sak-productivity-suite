import React, {useState, useEffect} from "react";
import {CheckJobStatus} from "./CheckJobStatus.js";
import Button from 'react-bootstrap/Button';
import { ButtonGroup, ListGroup } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Accordion from 'react-bootstrap/Accordion';


function Home(props) {
	const {sessionId} = props;
	// console.log("Home sessionId: ", sessionId);

	const [isLoadingLeads, setIsLoadingLeads] = useState(false);
	const [isLoadingAutoCreatingNotes, setIsLoadingAutoCreatingNotes] = useState(false);
	const [isLoadingPeopleInterests, setIsLoadingPeopleInterests] = useState(false);
	const [isLoadingCompanyInterests, setIsLoadingCompanyInterests] = useState(false);
	const [isLoadingMakingNote, setIsLoadingMakingNote] = useState(false);
	const [isLoadingSendingNote, setIsLoadingSendingNote] = useState(false);
		
	const [peopleInterestsArray, setPeopleInterestsArray] = useState(Array.from({length: 25}, () => []));
	const [companyInterestsArray, setCompanyInterestsArray] = useState(Array.from({length: 25}, () => []));
	const [selectedInterests, setSelectedInterests] = useState(Array.from({length: 25}, () => []));

	const [showProfileArea, setShowProfileArea] = useState(false);

	const [leadsArray, setLeadsArray] = useState([]);
	const [memberUrnIdArray, setMemberUrnIdArray] = useState([]);

	const [showCreateConnectNoteButton, setShowCreateConnectNoteButton] = useState(false);
	const [connectNoteArray, setConnectNoteArray] = useState([]);

	const [autoCreatingNotesDisabled, setAutoCreatingNotesDisabled] = useState(false);
		
	const handleGettingLeads = async() => {
        try {
			setIsLoadingLeads(true);
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
			setIsLoadingLeads(false);
		}
	};

	// This button goes through the lead list and creates a Connect note for them
	const handleAutoCreatingNotes = async(sessionId, memberUrnId) => {
		try {
			setIsLoadingAutoCreatingNotes(true);
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
				setConnectNoteArray(resultArray);
				setShowProfileArea(true);
				console.log("Successfully gotten Connect note array: ", resultArray);
				setIsLoadingAutoCreatingNotes(false);
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
			setIsLoadingPeopleInterests(true);
			setAutoCreatingNotesDisabled(true);
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
				const newArray = [...peopleInterestsArray];
				for (let i = 0; i < resultArray.length; i++){
					newArray[index].push(resultArray[i]);
				}
				setPeopleInterestsArray(newArray);
				setIsLoadingPeopleInterests(false);
				setAutoCreatingNotesDisabled(false);
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
			setIsLoadingCompanyInterests(true);
			setAutoCreatingNotesDisabled(true);
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
				const newArray = [...companyInterestsArray];
				for (let i = 0; i < resultArray.length; i++){
					newArray[index].push(resultArray[i]);
				}
				setCompanyInterestsArray(newArray);
				setIsLoadingCompanyInterests(false);	
				setAutoCreatingNotesDisabled(false);
			});
		
		} catch (error) {
			console.error(error);
		}
	};
				
	const handleInterestsSelection = (index) => (event) => {
		const newArray = [...selectedInterests];
		const value = event.target.value;
		const isChecked = event.target.checked;
		if (isChecked) {
		  newArray[index].push(value);
		} else {
		  const indexToRemove = newArray[index].indexOf(value);
		  newArray[index].splice(indexToRemove, 1);
		}
		setSelectedInterests(newArray);
	};

	// ================ Create and Send Connect Note(s) ===============================
	const handleMakingConnectNote = async (fullName, index) => {
		console.log(selectedInterests);
		console.log(selectedInterests[index]);

		if (selectedInterests[index].length !== 0){
			const prompt = "You are an Account Executive. This is the profile of a person: " + fullName
			+ " These are their interests: " + selectedInterests[index].toString()
			+ " Write a request to connect with them. Make it casual but eyecatching. Use only 50 words.";
			console.log(prompt);
			try {
				setIsLoadingMakingNote(true);
				setAutoCreatingNotesDisabled(true);
				const response = await fetch("https://sak-productivity-suite.herokuapp.com/use-chatgpt", {
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
					const newArray = [...connectNoteArray];
					newArray[index] = resultArray;
					setConnectNoteArray(newArray);	
					setIsLoadingMakingNote(false);
					setAutoCreatingNotesDisabled(false);
				});
	
			}catch(error){
				console.log(error);
			}
		
		}
		else {
			const prompt = "You are a Account Executive. This is the profile of a person: " + fullName
			+ " Write a request to connect with them. Make it casual but eyecatching. Use only 50 words.";	
			console.log("Not selected", prompt);
			try {
				setIsLoadingMakingNote(true);
				setAutoCreatingNotesDisabled(true);
				const response = await fetch("https://sak-productivity-suite.herokuapp.com/use-chatgpt", {
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
					const newArray = [...connectNoteArray];
					newArray[index] = resultArray;
					setConnectNoteArray(newArray);	
					setIsLoadingMakingNote(false);
					setAutoCreatingNotesDisabled(false);
				});
	
			}catch(error){
				console.log(error);
			}
	
		}
	};

	const handleSendingConnectNote = async (sessionId, profileId, index) => {
		try {
			setIsLoadingSendingNote(true);
			setAutoCreatingNotesDisabled(true);
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
		} finally {
			setIsLoadingSendingNote(false);
			setAutoCreatingNotesDisabled(false);
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

			{/* <div style={{ padding: '20px' }}> */}
			<div style={{ display: 'flex', justifyContent: 'center', padding: '20px'}}>
				<Button variant="primary" type="button" onClick={handleGettingLeads} disabled={isLoadingLeads}>
					{isLoadingLeads ? 'Getting Leads...' : 'Get Leads'}
				</Button>

				{showCreateConnectNoteButton && <Button variant="primary" type="button" onClick={() => handleAutoCreatingNotes(sessionId, leadsArray[0][4])} style={{marginLeft: '10px'}} disabled={autoCreatingNotesDisabled}>
					{isLoadingAutoCreatingNotes ? 'Creating Notes...' : 'Auto Create notes for all leads'}
				</Button>}
			</div>

			<div className="mx-auto" style={{ maxWidth: "800px", paddingBottom: '20px'}}>
				<Accordion alwaysOpen>
					{leadsArray.map((leadInfo, index) => (
						<Accordion.Item eventKey = {index.toString()}
							>
							<Accordion.Header>{leadInfo[0]}, {leadInfo[1]}</Accordion.Header>
							
							<Accordion.Body>
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
									<div style={{ display: 'flex', justifyContent: 'center', padding: '20px'}} >
										{/* <ButtonGroup aria-label="Basic example" className="mb-2" style={{ margin: '0 10px' }}> */}
											<Button onClick={ () => {
												handleGettingPeopleInterests(sessionId, leadInfo[4], index)
											}} disabled={isLoadingPeopleInterests} style={{marginLeft: '10px'}}>
												{isLoadingPeopleInterests ? 'Loading...' : 'Get people interests'}
											</Button>{' '}
											<Button className="mr-2" onClick={ () => {
												handleGettingCompanyInterests(sessionId, leadInfo[4], index)
											}} disabled={isLoadingCompanyInterests} style={{marginLeft: '20px'}}>
												{isLoadingCompanyInterests ? 'Loading...' : 'Get company interests'}
											</Button>{' '}
											<Button className="mr-2" onClick={ () => {
												handleMakingConnectNote(leadInfo[0], index)
											}} disabled={isLoadingMakingNote} style={{marginLeft: '30px'}}>
												{isLoadingMakingNote ? 'Making note...' : 'Make Connect Note'}
											</Button>{' '}									
											<Button onClick={ () => {
												handleSendingConnectNote(sessionId, leadInfo[4], index)
											}} disabled={isLoadingSendingNote} style={{marginLeft: '40px'}}>
												{isLoadingSendingNote ? 'Sending note...' : 'Send Connect Note'}
											</Button>
										{/* </ButtonGroup> */}
									</div>

									{peopleInterestsArray[index].length > 0 && (
									<ListGroup.Item>
										{peopleInterestsArray[index].map((interest, i) => (
										<Form.Check
											key={i}
											type="checkbox"
											value={interest[0]}
											label={interest[0]}
											onChange={handleInterestsSelection(index)}
										/>
										))}
									</ListGroup.Item>
									)}

									{companyInterestsArray[index].length > 0 && (
									<ListGroup.Item>
										{companyInterestsArray[index].map((interest, i) => (
										<Form.Check
											key={i}
											type="checkbox"
											value={interest[0]}
											label={interest[0]}
											onChange={handleInterestsSelection(index)}
										/>
										))}
									</ListGroup.Item>
									)}
								</div>
							</Accordion.Body>
						</Accordion.Item>
					))}
				</Accordion>
			</div>
		</>
	)
}
export default Home;