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

	const [isLoadingPeopleInterests, setIsLoadingPeopleInterests] = useState([]);
	const [isLoadingCompanyInterests, setIsLoadingCompanyInterests] = useState([]);
	const [isLoadingMakingNote, setIsLoadingMakingNote] = useState([]);
	const [isLoadingSendingNote, setIsLoadingSendingNote] = useState([]);		
	const [peopleInterestsArray, setPeopleInterestsArray] = useState([]);
	const [companyInterestsArray, setCompanyInterestsArray] = useState([]);
	const [selectedInterests, setSelectedInterests] = useState([]);

	const [showProfileArea, setShowProfileArea] = useState(false);

	const [leadsArray, setLeadsArray] = useState([]);
	const [memberUrnIdArray, setMemberUrnIdArray] = useState([]);

	const [showCreateConnectNoteButton, setShowCreateConnectNoteButton] = useState(false);
	const [connectNoteArray, setConnectNoteArray] = useState([]);

	const [autoCreatingNotesDisabled, setAutoCreatingNotesDisabled] = useState(false);
	const [loadingLeadsButtonDisabled, setLoadingLeadsButtonDisabled] = useState(false);

	const [peopleInterestsButtonDisabled, setPeopleInterestsButtonDisabled] = useState([]);
	const [companyInterestsButtonDisabled, setCompanyInterestsButtonDisabled] = useState([]);
	const [makingConnectNoteButtonDisabled, setMakingConnectNoteButtonDisabled] = useState([]);
	const [sendingConnectNoteButtonDisabled, setSendingConnectNoteButtonDisabled] = useState([]);

	const [jobIdArray, setJobIdArray] = useState([]);

	const stopAutoCreatingNotesRef = useRef(false);

	const [additionalInfoText, setAdditionalInfoText] = useState("");

	const [specificAdditionalInfoText, setSpecificAdditionalInfoText] = useState([]);

	const [error, setError] = useState(null);

	const [numberOfPages, setNumberOfPages] = useState(0);

	const [numberOfLeads, setNumberOfLeads] = useState(0);

	useEffect( () => {
		setIsLoadingPeopleInterests(Array.from({length: numberOfLeads}, () => false));
		setIsLoadingCompanyInterests(Array.from({length: numberOfLeads}, () => false));
		setIsLoadingMakingNote(Array.from({length: numberOfLeads}, () => false));
		setIsLoadingSendingNote(Array.from({length: numberOfLeads}, () => false));		
		setPeopleInterestsArray(Array.from({length: numberOfLeads}, () => []));
		setCompanyInterestsArray(Array.from({length: numberOfLeads}, () => []));
		setSelectedInterests(Array.from({length: numberOfLeads}, () => []));
		setPeopleInterestsButtonDisabled(Array.from({length: numberOfLeads}, () => false));
		setCompanyInterestsButtonDisabled(Array.from({length: numberOfLeads}, () => false));
		setMakingConnectNoteButtonDisabled(Array.from({length: numberOfLeads}, () => false));
		setSendingConnectNoteButtonDisabled(Array.from({length: numberOfLeads}, () => false));
	}, [numberOfLeads]);

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
					try {
						const leadsArray = data.lead_list;
						console.log("Successfully gotten leads: ", leadsArray);
						const memberUrnIdArray = data.member_urn_id_list;
						const numberOfPages = data.number_of_pages;
						setNumberOfPages(numberOfPages);
						const numberOfLeads = leadsArray.length;
						setNumberOfLeads(numberOfLeads);
			
						setLeadsArray(leadsArray);
						setMemberUrnIdArray(memberUrnIdArray);
						setShowCreateConnectNoteButton(true);		
					}catch(error){
						console.log("an error occurred");
						setError("error occurred");
					}
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
			
			setIsLoadingAutoCreatingNotes(true);
			setLoadingLeadsButtonDisabled(true);
			setAutoCreatingNotesDisabled(true);

			for (let i = 0; i < numberOfLeads; i++){
				peopleInterestsButtonDisabled[i] = true;
				companyInterestsButtonDisabled[i] = true;
				makingConnectNoteButtonDisabled[i] = true;
				sendingConnectNoteButtonDisabled[i] = true;
			}
			
			let interests = "";
			let additionalInfo = "";
			if (additionalInfoText !== ""){
				additionalInfo = additionalInfoText;
			}
			// console.log(additionalInfo);
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
					// console.log(jobIdArray);
					setJobIdArray(jobIdArray);

					let currentJobIdArray = [...jobIdArray.message];
					// console.log(currentJobIdArray);

					const jobIdCheck = setInterval( async () => {

						if (stopAutoCreatingNotesRef.current) {
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
								}
								else {
									console.log("error occurred 9");
									setError("error occurred");								
								}
							}catch(error){
								console.log("error occurred 8");
								setError("error occurred");					
							}
													
							clearInterval(jobIdCheck);
							
							setIsLoadingAutoCreatingNotes(false);
							setLoadingLeadsButtonDisabled(false);
							setAutoCreatingNotesDisabled(false);
	
							for (let i = 0; i < numberOfLeads; i++){
								peopleInterestsButtonDisabled[i] = false;
								companyInterestsButtonDisabled[i] = false;
								makingConnectNoteButtonDisabled[i] = false;
								sendingConnectNoteButtonDisabled[i] = false;
							}
							stopAutoCreatingNotesRef.current = false;
						}

						try {
							const response = await fetch("https://sak-productivity-suite.herokuapp.com/send-job-array", {
								method: "POST",
								headers: {
									"Content-Type": "application/json"
								},
								body: JSON.stringify({
									jobIdArray: currentJobIdArray
								})
							});
							if (response.ok){
								const data = await response.json();
								// console.log("Response okay", data);
								const job_list = data.job_list;
								// console.log(job_list);

								let isFinished = true;
								const sortedJobList = Object.values(job_list[0]).sort((a, b) => a.idx - b.idx);

								// console.log(sortedJobList);

								for (let jobId in sortedJobList){
									const job = sortedJobList[jobId];
									if (job.status === "finished"){
										// let idx = job_list[0][jobId]["idx"];
										// console.log(job_list[0][jobId]["idx"], job_list[0][jobId]["result"]);
										const idx = job.idx;

										let newConnectNoteArray = [...connectNoteArray];
										newConnectNoteArray[idx] = job.result;
										// console.log(newConnectNoteArray[idx]);
										setConnectNoteArray(newConnectNoteArray);
										
										peopleInterestsButtonDisabled[idx] = false;
										companyInterestsButtonDisabled[idx] = false;
										makingConnectNoteButtonDisabled[idx] = false;
										sendingConnectNoteButtonDisabled[idx] = false;
									}
									else {
										isFinished = false;
									}
								}
								console.log(isFinished);
								if(isFinished){
									for (let i = 0; i < numberOfLeads; i++){
										peopleInterestsButtonDisabled[i] = false;
										companyInterestsButtonDisabled[i] = false;
										makingConnectNoteButtonDisabled[i] = false;
										sendingConnectNoteButtonDisabled[i] = false;
										setAutoCreatingNotesDisabled(false);
										setIsLoadingAutoCreatingNotes(false);
										setLoadingLeadsButtonDisabled(false);
									}
									clearInterval(jobIdCheck);
								}								
							}
							else {
								console.log("error occurred 9");
								setError("error occurred");								
							}
						}catch(error){
							console.log("error occurred 8", error);
							setError("error occurred");					
						}
					}, 5000);				  
				}
				else{
					console.log("an error occurred");
					setError("error occurred 3");
				}
			}
			else {
				console.log("error occurred");
				setError("error occurred 4");
			}
		}catch(error){
			console.log("error occurred");
			setError("error occurred 5");
		}
	};

	// This button goes through the lead list and creates a Connect note for them
	const handleMakingConnectNote = async(sessionId, index = null) => {
		try {
		
			peopleInterestsButtonDisabled[index] = false;
			companyInterestsButtonDisabled[index] = false;
			makingConnectNoteButtonDisabled[index] = true;
			sendingConnectNoteButtonDisabled[index] = false;
			isLoadingMakingNote[index] = true;

			setAutoCreatingNotesDisabled(true);
			setLoadingLeadsButtonDisabled(true);
			
			let interests = "";
			if (selectedInterests[index].length !== 0){
				interests = selectedInterests[index].toString();
			}
			let additionalInfo = "";
			if(index !== null && specificAdditionalInfoText[index] !== undefined){
				additionalInfo = specificAdditionalInfoText[index];
			}
			// console.log(additionalInfo);
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
				const data = await response.json();
				if (data.success === true){
					console.log(jobId);
					const jobId = data.message;
	
					CheckJobStatus(jobId, (resultArray) => {
						let newConnectNoteArray = [...connectNoteArray];
						newConnectNoteArray[index] = resultArray;
						setConnectNoteArray(newConnectNoteArray);
						
						peopleInterestsButtonDisabled[index] = false;
						companyInterestsButtonDisabled[index] = false;
						makingConnectNoteButtonDisabled[index] = false;
						sendingConnectNoteButtonDisabled[index] = false;
						isLoadingMakingNote[index] = false;
						setAutoCreatingNotesDisabled(false);
						setLoadingLeadsButtonDisabled(false);
					});			  
				}
			}else{
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
			else {
				console.log("error occurred");
				setError("error occurred");
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
			setSendingConnectNoteButtonDisabled[index] = true;
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
							{leadInfo[5] === true ? (
								<Accordion.Body>
									<h2>Connect note already sent</h2>
									<div>
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
										</div>

										{peopleInterestsArray[index] && peopleInterestsArray[index].length > 0 && (
										<ListGroup.Item>
											{peopleInterestsArray[index].map((interest, i) => (
											<Form.Check
												disabled
												key={i}
												type="checkbox"
												value={interest[0]}
												label={interest[0]}
												onChange={handleInterestsSelection(index)}
											/>
											))}
										</ListGroup.Item>
										)}

										{companyInterestsArray[index] && companyInterestsArray[index].length > 0 && (
										<ListGroup.Item>
											{companyInterestsArray[index].map((interest, i) => (
											<Form.Check
												disabled
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

							): 

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

											<Button className="myButton" onClick={ () => {
												handleMakingConnectNote(sessionId, index)
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

									{peopleInterestsArray[index] && peopleInterestsArray[index].length > 0 && (
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

									{companyInterestsArray[index] && companyInterestsArray[index].length > 0 && (
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
							}
						</Accordion.Item>
					))}
				</Accordion>
			</div>
		</>
	)
}
export default Home;