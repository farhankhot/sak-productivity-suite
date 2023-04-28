import React, {useState, useEffect, useRef} from "react";
import {CheckJobStatus} from "./CheckJobStatus.js";
import {CheckJobStatusArray} from "./CheckJobStatusArray.js";

import Button from 'react-bootstrap/Button';
import { ButtonGroup, ListGroup } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Accordion from 'react-bootstrap/Accordion';
import Spinner from 'react-bootstrap/Spinner';

import './Home.css';

function Home(props) {
	const {sessionId} = props;
	// console.log("Home sessionId: ", sessionId);

	const [isLoadingLeads, setIsLoadingLeads] = useState(false);
	const [isLoadingAutoCreatingNotes, setIsLoadingAutoCreatingNotes] = useState(false);
	const [isLoadingPeopleInterests, setIsLoadingPeopleInterests] = useState(Array.from({length: 25}, () => false));
	const [isLoadingCompanyInterests, setIsLoadingCompanyInterests] = useState(Array.from({length: 25}, () => false));
	const [isLoadingMakingNote, setIsLoadingMakingNote] = useState(Array.from({length: 25}, () => false));
	const [isLoadingSendingNote, setIsLoadingSendingNote] = useState(Array.from({length: 25}, () => false));
		
	const [peopleInterestsArray, setPeopleInterestsArray] = useState(Array.from({length: 25}, () => []));
	const [companyInterestsArray, setCompanyInterestsArray] = useState(Array.from({length: 25}, () => []));
	const [selectedInterests, setSelectedInterests] = useState(Array.from({length: 25}, () => []));

	const [showProfileArea, setShowProfileArea] = useState(false);

	const [leadsArray, setLeadsArray] = useState([]);
	const [memberUrnIdArray, setMemberUrnIdArray] = useState([]);

	const [showCreateConnectNoteButton, setShowCreateConnectNoteButton] = useState(false);
	const [connectNoteArray, setConnectNoteArray] = useState([]);

	const [autoCreatingNotesDisabled, setAutoCreatingNotesDisabled] = useState(false);
	const [loadingLeadsButtonDisabled, setLoadingLeadsButtonDisabled] = useState(false);
	const [peopleInterestsButtonDisabled, setPeopleInterestsButtonDisabled] = useState(Array.from({length: 25}, () => false));
	const [companyInterestsButtonDisabled, setCompanyInterestsButtonDisabled] = useState(Array.from({length: 25}, () => false));
	const [makingConnectNoteButtonDisabled, setMakingConnectNoteButtonDisabled] = useState(Array.from({length: 25}, () => false));
	const [sendingConnectNoteButtonDisabled, setSendingConnectNoteButtonDisabled] = useState(Array.from({length: 25}, () => false));

	const [stopAutoCreatingNotes, setStopAutoCreatingNotes] = useState(false);

	const [jobIdArray, setJobIdArray] = useState([]);

	const stopAutoCreatingNotesRef = useRef(false);

	// useEffect( async () => {
	// 	if (stopAutoCreatingNotes) {
	// 		stopAutoCreatingNotesRef.current = stopAutoCreatingNotes;
			// try {
			// 	const response = await fetch("https://sak-productivity-suite.herokuapp.com/stop-jobs-in-array", {
			// 		method: "POST",
			// 		headers: {
			// 			"Content-Type": "application/json"
			// 		},
			// 		body: JSON.stringify({
			// 			sessionId: sessionId,
			// 			jobIdArray: jobIdArray
			// 		})
			// 	});
	
			// 	const data = await response.json();
			// 	console.log("data from stopAutoCreatingNotes", data);
			
			// }catch(error){
			// 	console.log(error);
			// }
		  
	// 	}
	//   }, [stopAutoCreatingNotes]);

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
			setLoadingLeadsButtonDisabled(true);
			setAutoCreatingNotesDisabled(true);
			
			// This disables all other buttons when Auto Create notes button is clicked
			// I could create a copy of each array, change element and set it. But for now, this works
			for (let i = 0; i < 25; i++){
				peopleInterestsButtonDisabled[i] = true;
				companyInterestsButtonDisabled[i] = true;
				makingConnectNoteButtonDisabled[i] = true;
				sendingConnectNoteButtonDisabled[i] = true;
			}
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

			// const jobId = await response.json();
			// CheckJobStatus(jobId.message, (resultArray) => {
			// 	setConnectNoteArray(resultArray);
			// 	setShowProfileArea(true);
			// 	console.log("Successfully gotten Connect note array: ", resultArray);
			// 	setIsLoadingAutoCreatingNotes(false);
			// 	setLoadingLeadsButtonDisabled(false);
			// 	setAutoCreatingNotesDisabled(false);
	
			// 	for (let i = 0; i < 25; i++){
			// 		peopleInterestsButtonDisabled[i] = false;
			// 		companyInterestsButtonDisabled[i] = false;
			// 		makingConnectNoteButtonDisabled[i] = false;
			// 		sendingConnectNoteButtonDisabled[i] = false;
			// 	}
			// });

			const jobIdArray = await response.json();
			console.log(jobIdArray);
			setJobIdArray(jobIdArray);

			let currentJobIdArray = [...jobIdArray.message];

			// const promisesArray = [];
			// for(let i = 0; i < jobIdArray.message.length; i++){
			// 	promisesArray.push(new Promise((resolve) => {
			// 		CheckJobStatus(jobIdArray.message[i], (resultArray) => {
			// 			console.log("Successfully gotten Connect note array: ", resultArray);
			// 			resolve({resultArray, index: i});             
			// 		});
			// 	}));
			// }
			// const results = await Promise.all(promisesArray);

			// const sortedResults = results.sort((a, b) => a.index - b.index);
			// const sortedConnectNoteArray = sortedResults.map(result => result.resultArray);

			// setConnectNoteArray(sortedConnectNoteArray);
			// setShowProfileArea(true);

			// for (let i = 0; i < 25; i++){
			// 	peopleInterestsButtonDisabled[i] = false;
			// 	companyInterestsButtonDisabled[i] = false;
			// 	makingConnectNoteButtonDisabled[i] = false;
			// 	sendingConnectNoteButtonDisabled[i] = false;
			// }

			// setIsLoadingAutoCreatingNotes(false);
			// setLoadingLeadsButtonDisabled(false);
			// setAutoCreatingNotesDisabled(false);
			let j = 0;

			const jobIdCheck = setInterval( async () => {

				if (currentJobIdArray.length === 0) {
					clearInterval(jobIdCheck);
						
					setIsLoadingAutoCreatingNotes(false);
					setLoadingLeadsButtonDisabled(false);
					setAutoCreatingNotesDisabled(false);

					for (let i = 0; i < 25; i++){
						peopleInterestsButtonDisabled[i] = false;
						companyInterestsButtonDisabled[i] = false;
						makingConnectNoteButtonDisabled[i] = false;
						sendingConnectNoteButtonDisabled[i] = false;
					}
					
				}
				else {
				
				for(let i = 0; i < currentJobIdArray.length; i++){
				
					console.log(stopAutoCreatingNotesRef.current);
					console.log(currentJobIdArray.length);

					if (stopAutoCreatingNotesRef.current) {
						if (currentJobIdArray.length > 0){
							try {
								const response = await fetch("https://sak-productivity-suite.herokuapp.com/stop-jobs-in-array", {
									method: "POST",
									headers: {
										"Content-Type": "application/json"
									},
									body: JSON.stringify({
										sessionId: sessionId,
										jobIdArray: currentJobIdArray
									})
								});
					
								const data = await response.json();
								console.log("data from stopAutoCreatingNotes", data);
								
							}catch(error){
								console.log(error);
							}
						}
						
						clearInterval(jobIdCheck);
						
						setIsLoadingAutoCreatingNotes(false);
						setLoadingLeadsButtonDisabled(false);
						setAutoCreatingNotesDisabled(false);

						for (let i = 0; i < 25; i++){
							peopleInterestsButtonDisabled[i] = false;
							companyInterestsButtonDisabled[i] = false;
							makingConnectNoteButtonDisabled[i] = false;
							sendingConnectNoteButtonDisabled[i] = false;
						}

						// Set back to false if this button is clicked again
						stopAutoCreatingNotesRef.current = false;

						break;
					}
	
					try {
			
						const response = await fetch("https://sak-productivity-suite.herokuapp.com/job-status", {
							method: "POST",
							headers: {
								"Content-Type": "application/json"
							},
							body: JSON.stringify({
								jobId: currentJobIdArray[i]
							})
						});
						
						const data = await response.json();
						const status = data.status;
						
						if (status === "finished") {
							const resultArray = data.result;
							console.log("Successfully gotten Connect note array: ", resultArray);

							const newConnectNoteArray = [...connectNoteArray];
							newConnectNoteArray[j] = resultArray;
							setConnectNoteArray(newConnectNoteArray);

							setShowProfileArea(true);
	
							peopleInterestsButtonDisabled[j] = false;
							companyInterestsButtonDisabled[j] = false;
							makingConnectNoteButtonDisabled[j] = false;
							sendingConnectNoteButtonDisabled[j] = false;

							// Remove this i from currentJobIdArray
							currentJobIdArray.splice(i, 1);
							console.log("current", currentJobIdArray.length);

							j += 1;
						} 
					}catch(error){
						console.log("An error has occured (CheckJobStatus): ", error);
					}
					// if (i === (jobIdArray.message.length - 1) ){
					// 	setIsLoadingAutoCreatingNotes(false);
					// 	setLoadingLeadsButtonDisabled(false);
					// 	setAutoCreatingNotesDisabled(false);
	
					// 	// TODO: set all the other buttons (people, company, making, sending) to true if they aren't
					// }
	
					// CheckJobStatus(jobIdArray.message[i], (resultArray) => {
	
					// 	console.log("Successfully gotten Connect note array: ", resultArray);
					// 	// connectNoteArray[i] = resultArray;
					// 	const newConnectNoteArray = [...connectNoteArray];
					// 	newConnectNoteArray[i] = resultArray;
					// 	setConnectNoteArray(newConnectNoteArray);
					// 	// setConnectNoteArray(prevArray => [...prevArray.slice(0, i), resultArray, ...prevArray.slice(i+1)]);
					// 	setShowProfileArea(true);
	
					// 	peopleInterestsButtonDisabled[i] = false;
					// 	companyInterestsButtonDisabled[i] = false;
					// 	makingConnectNoteButtonDisabled[i] = false;
					// 	sendingConnectNoteButtonDisabled[i] = false;
						
					// 	if (i === (jobIdArray.message.length - 1) ){
					// 		setIsLoadingAutoCreatingNotes(false);
					// 		setLoadingLeadsButtonDisabled(false);
					// 		setAutoCreatingNotesDisabled(false);
	
					// 		// TODO: set all the other buttons (people, company, making, sending) to true if they aren't
					// 	}
	
					// });
				}
				}
			}, 500);
		}catch(error){
			console.log(error);
		}
	};

	const handleGettingPeopleInterests = async (sessionId, profileUrnStr, index) => {
		const startIndex = profileUrnStr.indexOf("(") + 1;
		const endIndex = profileUrnStr.indexOf(",");
		const profileUrn = profileUrnStr.substring(startIndex, endIndex);
		try {

			// setIsLoadingPeopleInterests(true);
			
			const newIsLoadingPeopleInterests = [...isLoadingPeopleInterests];
			for (let i = 0; i < newIsLoadingPeopleInterests.length; i++){
				newIsLoadingPeopleInterests[index] = true;
			}
			setIsLoadingPeopleInterests(newIsLoadingPeopleInterests);

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

				// setIsLoadingPeopleInterests(false);
				const newIsLoadingPeopleInterests = [...isLoadingPeopleInterests];
				for (let i = 0; i < newIsLoadingPeopleInterests.length; i++){
					newIsLoadingPeopleInterests[index] = false;
				}
				setIsLoadingPeopleInterests(newIsLoadingPeopleInterests);
				
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
			// setIsLoadingCompanyInterests(true);
			
			const newIsLoadingCompanyInterests = [...isLoadingCompanyInterests];
			for (let i = 0; i < newIsLoadingCompanyInterests.length; i++){
				newIsLoadingCompanyInterests[index] = true;
			}
			setIsLoadingCompanyInterests(newIsLoadingCompanyInterests);
			
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

				// setIsLoadingCompanyInterests(false);	
				const newIsLoadingCompanyInterests = [...isLoadingCompanyInterests];
				for (let i = 0; i < newIsLoadingCompanyInterests.length; i++){
					newIsLoadingCompanyInterests[index] = false;
				}
				setIsLoadingCompanyInterests(newIsLoadingCompanyInterests);
				
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
				// setIsLoadingMakingNote(true);
				const newIsLoadingMakingNote = [...isLoadingMakingNote];
				for (let i = 0; i < newIsLoadingMakingNote.length; i++){
					newIsLoadingMakingNote[index] = true;
				}
				setIsLoadingMakingNote(newIsLoadingMakingNote);

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

					// setIsLoadingMakingNote(false);
					const newIsLoadingMakingNote = [...isLoadingMakingNote];
					for (let i = 0; i < newIsLoadingMakingNote.length; i++){
						newIsLoadingMakingNote[index] = false;
					}
					setIsLoadingMakingNote(newIsLoadingMakingNote);
					
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
				// setIsLoadingMakingNote(true);
				const newIsLoadingMakingNote = [...isLoadingMakingNote];
				for (let i = 0; i < newIsLoadingMakingNote.length; i++){
					newIsLoadingMakingNote[index] = true;
				}
				setIsLoadingMakingNote(newIsLoadingMakingNote);

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

					// setIsLoadingMakingNote(false);
					const newIsLoadingMakingNote = [...isLoadingMakingNote];
					for (let i = 0; i < newIsLoadingMakingNote.length; i++){
						newIsLoadingMakingNote[index] = false;
					}
					setIsLoadingMakingNote(newIsLoadingMakingNote);
					
					setAutoCreatingNotesDisabled(false);
				});
	
			}catch(error){
				console.log(error);
			}
	
		}
	};

	const handleSendingConnectNote = async (sessionId, profileId, index) => {
		try {

			// setIsLoadingSendingNote(true);
			const newIsLoadingSendingNote = [...isLoadingSendingNote];
			for (let i = 0; i < newIsLoadingSendingNote.length; i++){
				newIsLoadingSendingNote[index] = true;
			}
			setIsLoadingSendingNote(newIsLoadingSendingNote);
			
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
			// setIsLoadingSendingNote(false);
			const newIsLoadingSendingNote = [...isLoadingSendingNote];
			for (let i = 0; i < newIsLoadingSendingNote.length; i++){
				setIsLoadingSendingNote[index] = false;
			}
			setIsLoadingSendingNote(newIsLoadingSendingNote);

			setAutoCreatingNotesDisabled(false);
		}
	};
	// ================ Create and Send Connect Note(s) ===============================

	const handleNoteTextAreaChange = (event, index) => {
		const updatedConnectNoteArray = [...connectNoteArray];
		updatedConnectNoteArray[index] = event.target.value;
		setConnectNoteArray(updatedConnectNoteArray);
	};	  

	// let stopSignal = new Promise(resolve => {});
	const handleStopAutoCreatingNotes = () => {
		stopAutoCreatingNotesRef.current = true;

		// setStopAutoCreatingNotes(true);
		// stopSignal = new Promise(resolve => resolve("stop"));
	}

	return (
		<>

			<div style={{ display: 'flex', justifyContent: 'center', padding: '20px'}}>
				<Button className="myButton" variant="primary" type="button" onClick={handleGettingLeads} disabled={isLoadingLeads || loadingLeadsButtonDisabled}>
					{isLoadingLeads ? 
						<>
							<Spinner animation="border" size="sm" />
							 Getting Leads...
						</> : 'Get Leads'}
				</Button>

				{showCreateConnectNoteButton && <Button className="myButton" variant="primary" type="button" onClick={() => handleAutoCreatingNotes(sessionId, leadsArray[0][4])} style={{marginLeft: '10px'}} disabled={autoCreatingNotesDisabled}>
					{isLoadingAutoCreatingNotes ? 
					<>
						<Spinner animation="border" size="sm" />
						 Creating Notes...
					</>: 'Auto Create notes for all leads'}
				</Button>}

				{isLoadingAutoCreatingNotes && <Button className="myButton" variant="primary" type="button" onClick={handleStopAutoCreatingNotes} style={{marginLeft: '20px'}}>
					Stop Auto Create notes
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
											
											<Button className="myButton" onClick={ () => {
												handleGettingPeopleInterests(sessionId, leadInfo[4], index)
											}} disabled={isLoadingPeopleInterests[index] || peopleInterestsButtonDisabled[index] } style={{marginLeft: '10px'}}>
												{isLoadingPeopleInterests[index] ? 
												<>
													<Spinner animation="border" size="sm" />
													 Loading...
												</>: 'Get people interests'}
											</Button>{' '}

											<Button className="myButton" onClick={ () => {
												handleGettingCompanyInterests(sessionId, leadInfo[4], index)
											}} disabled={isLoadingCompanyInterests[index] || companyInterestsButtonDisabled[index] } style={{marginLeft: '20px'}}>
												{isLoadingCompanyInterests[index] ? 
												<>
													<Spinner animation="border" size="sm" />
													 Loading...
												</> : 'Get company interests'}
											</Button>{' '}

											<Button className="myButton" onClick={ () => {
												handleMakingConnectNote(leadInfo[0], index)
											}} disabled={isLoadingMakingNote[index] || makingConnectNoteButtonDisabled[index] } style={{marginLeft: '30px'}}>
												{isLoadingMakingNote[index] ? 
												<>
													<Spinner animation="border" size="sm" />
													 Making note...
												</> : 'Make Connect Note'}
											</Button>{' '}

											<Button className="myButton" onClick={ () => {
												handleSendingConnectNote(sessionId, leadInfo[4], index)
											}} disabled={isLoadingSendingNote[index] || sendingConnectNoteButtonDisabled[index] } style={{marginLeft: '40px'}}>
												{isLoadingSendingNote[index] ? 
												<>
													<Spinner animation="border" size="sm" />
													 Sending Connect Note...
												</> : 'Send Connect Note'}
											</Button>
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