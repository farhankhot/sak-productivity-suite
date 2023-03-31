import React, {useState, useEffect} from "react";
import {useNavigate} from 'react-router-dom';
import {CheckJobStatus} from "./CheckJobStatus.js";
import Button from 'react-bootstrap/Button';
import { ButtonGroup, ListGroup } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';

function Home(props) {
	const {sessionId} = props;
	// console.log("Home sessionId: ", sessionId);
	const [isLoading, setIsLoading] = useState(false);
	
	const [noteTextArea, setNoteTextArea] = useState(""); 
	
	// const [peopleInterestsArray, setPeopleInterestsArray] = useState([]);	
	// const [companyInterestsArray, setCompanyInterestsArray] = useState([]);	
	// const [activityInterestsArray, setActivityInterestsArray] = useState([]);
	// const [selectedInterests, setSelectedInterests] = useState("");

	// const [showProfileArea, setShowProfileArea] = useState(false);
	// const [selectedName, setSelectedName] = useState("");

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
			const leadsArray = data.message;
			console.log("Successfully gotten leads: ", data);
			const memberUrnIdArray = data.member_urn_id_list; 
			setLeadsArray(leadsArray);
			setMemberUrnIdArray(memberUrnIdArray);
			showCreateConnectNoteButton(true);
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
			CheckJobStatus(jobId, (resultArray) => {
				// This gets a big list
				// This list contains Connect Notes for each person in the lead list
				// Save to an array, then display a textbox and the note for each note in list
				setConnectNoteArray(resultArray);
			});
			console.log("Successfully gotten Connect note array: ", connectNoteArray);
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
	// ================ Create and Send Connect Note ===============================

	return (
		<>
            <Button variant="primary" type="button" onClick={handleGettingLeads}>
                Get leads
            </Button>
			<Button variant="primary" type="button" onClick={() => handleAutoCreatingNotes(sessionId, leadsArray[0][4])}>
                Auto Create notes for all leads
            </Button>

			<Container>
				<h1>Search Results:</h1>
				<ListGroup>
					{leadsArray.map((leadInfo, index) => (
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
										value={connectNoteArray}
										onChange={handleNoteTextAreaChange}
										placeholder="The generated note will appear here"
									/>
									</Form.Group>

									<Button onClick={handleSendingConnectNote(sessionId, leadInfo[2])}>
										Send Connect Note
									</Button>
								</>
							)}  */}
						</ListGroup.Item>
					))}
					{/* IDK if this works, will test */}
					{connectNoteArray.length > 0 &&
						leadsArray.map((lead, index) => (
							<div key={index}>
								<h5>{lead}</h5>
								<textarea
									value={connectNoteArray[index]}
									onChange={(event) => {
										const updatedConnectNoteArray = [...connectNoteArray];
										updatedConnectNoteArray[index] = event.target.value;
										setConnectNoteArray(updatedConnectNoteArray);
									}}
								/>
							</div>
					))}
				</ListGroup>
			</Container>
		</>
	)
}
export default Home;