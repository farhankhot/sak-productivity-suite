import React, {useState, useEffect, useRef} from "react";
import {CheckJobStatus} from "./CheckJobStatus.js";

import Button from 'react-bootstrap/Button';
import { ButtonGroup, ListGroup } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Accordion from 'react-bootstrap/Accordion';
import Spinner from 'react-bootstrap/Spinner';

import './Home.css';

import ErrorModal from "./ErrorModal.js";

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

	const [jobIdArray, setJobIdArray] = useState([]);

	const stopAutoCreatingNotesRef = useRef(false);

	const [additionalInfoText, setAdditionalInfoText] = useState("");

	const [specificAdditionalInfoText, setSpecificAdditionalInfoText] = useState([]);

	const [error, setError] = useState(null);

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
			if (response.ok){
				const data = await response.json();

				if (data.success === true){
					const leadsArray = data.lead_list;
					// console.log("Successfully gotten leads: ", data);
					const memberUrnIdArray = data.member_urn_id_list; 
		
					setLeadsArray(leadsArray);
					setMemberUrnIdArray(memberUrnIdArray);
					setShowCreateConnectNoteButton(true);	
				}
				else{
					console.log("an error occurred");
					setError("error occurred");
				}
			}else {
				console.log("an error occurred");
				setError("error occurred");
			}
		}catch(error){
			console.log("error occurred");
			setError("error occurred");
		}finally {
			setIsLoadingLeads(false);
		}
	};

	// This button goes through the lead list and creates a Connect note for them
	const handleAutoCreatingNotes = async(sessionId, index = null) => {
		try {

			if (index === null){
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
			}
			else {
				peopleInterestsButtonDisabled[index] = false;
				companyInterestsButtonDisabled[index] = false;
				// makingConnectNoteButtonDisabled[index] = false;
				sendingConnectNoteButtonDisabled[index] = false;

				const x = [...makingConnectNoteButtonDisabled];
				x[index] = false;
				setMakingConnectNoteButtonDisabled(x);

				const newIsLoadingMakingNote = [...isLoadingMakingNote];
				newIsLoadingMakingNote[index] = true;
				setIsLoadingMakingNote(newIsLoadingMakingNote);

				setAutoCreatingNotesDisabled(true);
				setLoadingLeadsButtonDisabled(true);
			}
			let interests = "";
			if (index !== null && selectedInterests[index].length !== 0){
				interests = selectedInterests[index].toString();
			}
			let additionalInfo = "";
			if (additionalInfoText !== "" && index === null){
				console.log("me2");
				additionalInfo = additionalInfoText;
			}
			else if(index !== null && specificAdditionalInfoText[index] !== undefined){
				console.log("me");
				additionalInfo = specificAdditionalInfoText[index];
			}
			console.log(additionalInfo);
			// console.log("test", specificAdditionalInfoText[index]);
			const response = await fetch("https://sak-productivity-suite.herokuapp.com/get-lead-info", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					sessionId: sessionId,
					...(index === null ? {leadsArray: leadsArray} : {leadsArray: [leadsArray[index]]}),
					...(index === null ? {memberUrnIdArray: memberUrnIdArray} : {memberUrnIdArray: [memberUrnIdArray[index]]}),
					additionalInfoText: additionalInfo,
					...(interests !== "" ? {interests: interests} : {interests: ""})
				})
			});

			if (response.ok){
				const jobIdArray = await response.json();
				if (jobIdArray.success === true){
					console.log(jobIdArray);
					setJobIdArray(jobIdArray);

					let currentJobIdArray = [...jobIdArray.message];

					const jobIdCheck = setInterval( async () => {

						// Will this ever run?
						if (currentJobIdArray.length === 0) {
							clearInterval(jobIdCheck);
								
							setIsLoadingAutoCreatingNotes(false);
							setLoadingLeadsButtonDisabled(false);
							setAutoCreatingNotesDisabled(false);

							if (index === null){
								for (let i = 0; i < 25; i++){
									peopleInterestsButtonDisabled[i] = false;
									companyInterestsButtonDisabled[i] = false;
									makingConnectNoteButtonDisabled[i] = false;
									sendingConnectNoteButtonDisabled[i] = false;
								}
							}
							else {
								peopleInterestsButtonDisabled[index] = false;
								companyInterestsButtonDisabled[index] = false;
								// makingConnectNoteButtonDisabled[index] = false;
								sendingConnectNoteButtonDisabled[index] = false;

								const newIsLoadingMakingNote = [...isLoadingMakingNote];
								newIsLoadingMakingNote[index] = false;
								setMakingConnectNoteButtonDisabled(newIsLoadingMakingNote);

								const x = [...makingConnectNoteButtonDisabled];
								x[index] = false;
								setMakingConnectNoteButtonDisabled(x);				

								setIsLoadingMakingNote(newIsLoadingMakingNote);
								setAutoCreatingNotesDisabled(false);
								setLoadingLeadsButtonDisabled(false);
							}
						}
						else {
							for(let i = 0; i < currentJobIdArray.length; i++){
								// console.log(stopAutoCreatingNotesRef.current);
								// console.log(currentJobIdArray.length);
								console.log(i, index);

								const allAreNone = currentJobIdArray.every((val) => val === "None");
								// console.log(allAreNone);
								// console.log(currentJobIdArray[i]);

								if (allAreNone && currentJobIdArray.length === 1){
									console.log("i ran", index);
									clearInterval(jobIdCheck);
									setIsLoadingAutoCreatingNotes(false);
									setLoadingLeadsButtonDisabled(false);
									setAutoCreatingNotesDisabled(false);

									peopleInterestsButtonDisabled[index] = false;
									companyInterestsButtonDisabled[index] = false;
									// makingConnectNoteButtonDisabled[index] = false;
									sendingConnectNoteButtonDisabled[index] = false;

									const newIsLoadingMakingNote = [...isLoadingMakingNote];
									newIsLoadingMakingNote[index] = false;
									setIsLoadingMakingNote(newIsLoadingMakingNote);

									const x = [...makingConnectNoteButtonDisabled];
									x[index] = false;
									setMakingConnectNoteButtonDisabled(x);						

									setAutoCreatingNotesDisabled(false);
									setLoadingLeadsButtonDisabled(false);
								}

								else if (allAreNone && currentJobIdArray.length > 1){
									console.log("more than 1");
									clearInterval(jobIdCheck);
									setIsLoadingAutoCreatingNotes(false);
									setLoadingLeadsButtonDisabled(false);
									setAutoCreatingNotesDisabled(false);

									if (index === null){
										for (let i = 0; i < 25; i++){
											peopleInterestsButtonDisabled[i] = false;
											companyInterestsButtonDisabled[i] = false;
											makingConnectNoteButtonDisabled[i] = false;
											sendingConnectNoteButtonDisabled[i] = false;
										}
									}
									else {
										peopleInterestsButtonDisabled[index] = false;
										companyInterestsButtonDisabled[index] = false;
										// makingConnectNoteButtonDisabled[index] = false;
										sendingConnectNoteButtonDisabled[index] = false;

										const newIsLoadingMakingNote = [...isLoadingMakingNote];
										newIsLoadingMakingNote[index] = false;
										setMakingConnectNoteButtonDisabled(newIsLoadingMakingNote);

										const x = [...makingConnectNoteButtonDisabled];
										x[index] = false;
										setMakingConnectNoteButtonDisabled(x);						

										setIsLoadingMakingNote(newIsLoadingMakingNote);
										setAutoCreatingNotesDisabled(false);
										setLoadingLeadsButtonDisabled(false);
									}
								}

								else if (!allAreNone && currentJobIdArray[i] != "None"){
									console.log("me 3");
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
												if (response.ok){
													const data = await response.json();
													console.log("data from stopAutoCreatingNotesRef", data);
												}else {
													console.log("error occurred");
													setError("error occurred");								
												}
											}catch(error){
												console.log("error occurred");
												setError("error occurred");					
											}
										}
										
										clearInterval(jobIdCheck);
										
										setIsLoadingAutoCreatingNotes(false);
										setLoadingLeadsButtonDisabled(false);
										setAutoCreatingNotesDisabled(false);

										if (index === null) {
											for (let i = 0; i < 25; i++){
												peopleInterestsButtonDisabled[i] = false;
												companyInterestsButtonDisabled[i] = false;
												makingConnectNoteButtonDisabled[i] = false;
												sendingConnectNoteButtonDisabled[i] = false;
											}
										}
										else {
											peopleInterestsButtonDisabled[index] = false;
											companyInterestsButtonDisabled[index] = false;
											// makingConnectNoteButtonDisabled[index] = false;
											sendingConnectNoteButtonDisabled[index] = false;

											const newIsLoadingMakingNote = [...isLoadingMakingNote];
											newIsLoadingMakingNote[index] = false;
											setMakingConnectNoteButtonDisabled(newIsLoadingMakingNote);

											const x = [...makingConnectNoteButtonDisabled];
											x[index] = false;
											setMakingConnectNoteButtonDisabled(x);							

											setIsLoadingMakingNote(newIsLoadingMakingNote);
											setAutoCreatingNotesDisabled(false);
											setLoadingLeadsButtonDisabled(false);

											console.log("index", index);
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

										if (response.ok){
											const data = await response.json();
											const status = data.status;
											if (status === "failed"){
												currentJobIdArray[i] = "None";
												console.log("job status is ", status);
												setError("An error has occurred");
											}
											
											else if (status === "finished") {
												console.log("me 4");
	
												const resultArray = data.result;
												console.log("Successfully gotten Connect note array: ", resultArray);
				
												const newConnectNoteArray = [...connectNoteArray];
	
												if (index === null) {
													newConnectNoteArray[i] = resultArray;
													setConnectNoteArray(newConnectNoteArray);
					
													setShowProfileArea(true);
							
													peopleInterestsButtonDisabled[i] = false;
													companyInterestsButtonDisabled[i] = false;
													makingConnectNoteButtonDisabled[i] = false;
													
													const newIsLoadingMakingNote = [...isLoadingMakingNote];
													newIsLoadingMakingNote[i] = false;
													setMakingConnectNoteButtonDisabled(newIsLoadingMakingNote);

													sendingConnectNoteButtonDisabled[i] = false;
					
													currentJobIdArray[i] = "None"
													// console.log("current", currentJobIdArray.length);
												}else {
													newConnectNoteArray[index] = resultArray;
													setConnectNoteArray(newConnectNoteArray);
					
													setShowProfileArea(true);
													console.log("index", index);
							
													peopleInterestsButtonDisabled[index] = false;
													companyInterestsButtonDisabled[index] = false;

													const newIsLoadingMakingNote = [...isLoadingMakingNote];
													newIsLoadingMakingNote[index] = false;
													setMakingConnectNoteButtonDisabled(newIsLoadingMakingNote);

													sendingConnectNoteButtonDisabled[index] = false;
					
													currentJobIdArray[i] = "None"
													console.log("current", currentJobIdArray.length);
												}
											}
										}else{
											console.log("error occurred");
											setError("error occurred");						
										}
									}catch(error){
										console.log("An error has occured (CheckJobStatus): ", error);
										setError("error occurred");			
									}
								}
							}
						}
					}, 500);				  
				}
				else{
					console.log("an error occurred");
					setError("error occurred");
				}
			}
			else {
				console.log("error occurred");
				setError("error occurred");
			}
		}catch(error){
			console.log("error occurred");
			setError("error occurred");
		}
	};

	const handleGettingPeopleInterests = async (sessionId, profileUrnStr, index) => {
		const startIndex = profileUrnStr.indexOf("(") + 1;
		const endIndex = profileUrnStr.indexOf(",");
		const profileUrn = profileUrnStr.substring(startIndex, endIndex);
		try {
			
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
			if (response.ok){
				const data = await response.json();
				if (data.success === true){
					const jobId = data.message;
	
					CheckJobStatus(jobId, (resultArray) => {
						const newArray = [...peopleInterestsArray];
						for (let i = 0; i < resultArray.length; i++){
							newArray[index].push(resultArray[i]);
						}
						setPeopleInterestsArray(newArray);
		
						const newIsLoadingPeopleInterests = [...isLoadingPeopleInterests];
						for (let i = 0; i < newIsLoadingPeopleInterests.length; i++){
							newIsLoadingPeopleInterests[index] = false;
						}
						setIsLoadingPeopleInterests(newIsLoadingPeopleInterests);
						
						setAutoCreatingNotesDisabled(false);
					});
				}
				else{
					console.log("an error occurred");
					setError("error occurred");
				}	
			}else {
				console.log("error occurred");
				setError("error occurred");
			}
		} catch (error) {
			console.log("error occurred");
			setError("error occurred");
		}
	};
	
	const handleGettingCompanyInterests = async (sessionId, profileUrnStr, index) => {
		const startIndex = profileUrnStr.indexOf("(") + 1;
		const endIndex = profileUrnStr.indexOf(",");
		const profileUrn = profileUrnStr.substring(startIndex, endIndex);
		try {			
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
			if (response.ok){
				const data = await response.json();
				if (data.success === true){
					const jobId = data.message;
					
					CheckJobStatus(jobId, (resultArray) => {
						const newArray = [...companyInterestsArray];
						for (let i = 0; i < resultArray.length; i++){
							newArray[index].push(resultArray[i]);
						}
						setCompanyInterestsArray(newArray);
	
						const newIsLoadingCompanyInterests = [...isLoadingCompanyInterests];
						for (let i = 0; i < newIsLoadingCompanyInterests.length; i++){
							newIsLoadingCompanyInterests[index] = false;
						}
						setIsLoadingCompanyInterests(newIsLoadingCompanyInterests);
						
						setAutoCreatingNotesDisabled(false);
					});
				}else{
					console.log("an error occurred");
					setError("error occurred");
				}
			}else {
				console.log("error occurred");
				setError("error occurred");
			}
		} catch (error) {
			console.log("error occurred");
			setError("error occurred");
		}
	};
				
	const handleInterestsSelection = (index) => (event) => {
		try {		
			const newArray = [...selectedInterests];
			const value = event.target.value;
			const isChecked = event.target.checked;
			if (isChecked) {
				newArray[index].push(value);
			}else {
				const indexToRemove = newArray[index].indexOf(value);
				newArray[index].splice(indexToRemove, 1);
			}
			setSelectedInterests(newArray);
		}
		catch (error) {
			console.log("error occurred");
			setError("error occurred");
		}
	};

	// ================ Send Connect Note ===============================
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
			if (response.ok){
				const data = await response.json();
				if (data.success === true){
					console.log("Successfully sent the connect note to the person", data.message);
				}else {
					console.log("error occurred");
					setError("error occurred");
				}	
			}
		}catch(error){
			console.log("error occurred");
			setError("error occurred");
		} finally {

			const newIsLoadingSendingNote = [...isLoadingSendingNote];
			for (let i = 0; i < newIsLoadingSendingNote.length; i++){
				setIsLoadingSendingNote[index] = false;
			}
			setIsLoadingSendingNote(newIsLoadingSendingNote);

			setAutoCreatingNotesDisabled(false);
		}
	};
	// ================ Send Connect Note(s) ===============================

	const handleNoteTextAreaChange = (event, index) => {
		const updatedConnectNoteArray = [...connectNoteArray];
		updatedConnectNoteArray[index] = event.target.value;
		setConnectNoteArray(updatedConnectNoteArray);
	};	  

	const handleSpecificAdditionalInfoTextAreaChange = (event, index) => {
		const updatedSpecificAdditionalInfoArray = [...specificAdditionalInfoText];
		updatedSpecificAdditionalInfoArray[index] = event.target.value;
		setSpecificAdditionalInfoText(updatedSpecificAdditionalInfoArray);
	};	  

	const handleStopAutoCreatingNotes = () => {
		stopAutoCreatingNotesRef.current = true;
	}

	const handleAdditionalInfoTextAreaChange = (event) => {
		const changedInfo = event.target.value;
		setAdditionalInfoText(changedInfo);
	};

	return (
		<>
			{error && <ErrorModal errorMessage={error} onClose={() => setError(null)}/>}

			<div style={{ display: 'flex', justifyContent: 'center', padding: '20px'}}>
				<Button className="myButton" variant="primary" type="button" onClick={handleGettingLeads} disabled={isLoadingLeads || loadingLeadsButtonDisabled}>
					{isLoadingLeads ? 
						<>
							<Spinner animation="border" size="sm" />
							 Getting Leads...
						</> : 'Get Leads'}
				</Button>

				{showCreateConnectNoteButton && <Button className="myButton" variant="primary" type="button" onClick={() => handleAutoCreatingNotes(sessionId)} style={{marginLeft: '10px'}} disabled={autoCreatingNotesDisabled}>
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

			<div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '10px' }}>
				{leadsArray.length > 0 && 
					<Form.Group>
						<Form.Label>Add request</Form.Label>
						<Form.Control
							as="textarea"
							value={additionalInfoText} 
							onChange={ (event) => {
								handleAdditionalInfoTextAreaChange(event)
							}}
						/>
					</Form.Group>
				}
			</div>

			<div className="mx-auto" style={{ maxWidth: '800px', paddingBottom: '20px'}}>
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
									<Form.Group>
										<Form.Control
											placeholder="Enter any additional request"
											as="textarea"
											value={specificAdditionalInfoText[index]} 
											onChange={ (event) => {
												handleSpecificAdditionalInfoTextAreaChange(event, index)
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

											{/* <Button className="myButton" onClick={ () => {
												handleMakingConnectNote(leadInfo[0], index)
											}} disabled={isLoadingMakingNote[index] || makingConnectNoteButtonDisabled[index] } style={{marginLeft: '30px'}}>
												{isLoadingMakingNote[index] ? 
												<>
													<Spinner animation="border" size="sm" />
													 Making note...
												</> : 'Make Connect Note'}
											</Button>{' '} */}

											<Button className="myButton" onClick={ () => {
												handleAutoCreatingNotes(sessionId, index)
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