import React, {useState, useEffect} from "react";
import {CheckJobStatus} from "./CheckJobStatus.js";
import { useLocation } from 'react-router-dom';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';

// TODO: 
// Move peopleInterests, companyInterests and activityInterests to 3 separate components
// Move making note to a separate component

// Next button still clickable at the last page

function DisplaySearchResults() {
	
	const location = useLocation();
	const sessionId = location.state?.sessionId;
	const resultArray = location.state?.resultArray;
	// console.log("DisplaySearchResults sessionId: ", sessionId);
	
	const [userProfile, setUserProfile] = useState([]);
	const [pageArray, setPageArray] = useState([]);
	const [pageIndex, setPageIndex] = useState(0);
	
	const [fullName, setFullName] = useState("");
	const [latestTitle, setLatestTitle] = useState("");
	const [summary, setSummary] = useState("");
	const [skills, setSkills] = useState("");
	const [publicId, setPublicId] = useState("");
	const [profileUrn, setProfileUrn] = useState("");
	const [profileId, setProfileId] = useState("");
	const [noteTextArea, setNoteTextArea] = useState(""); 
	
	const [interests, setInterests] = useState(""); 
	
	const [peopleInterestsArray, setPeopleInterestsArray] = useState([]);	
	const [companyInterestsArray, setCompanyInterestsArray] = useState([]);	
	const [activityInterestsArray, setActivityInterestsArray] = useState([]);
	
	const [selectedInterests, setSelectedInterests] = useState("");
	
	const [isLoading, setIsLoading] = useState(false);

	const [showProfileArea, setShowProfileArea] = useState(false);
	
	useEffect(() => {
		// Divide the array into pages
		const pageSize = 1;
		const pageArray = [];
		for (let i = 0; i < resultArray.length; i += pageSize) {
			pageArray.push(resultArray.slice(i, i + pageSize));
		}
		setPageArray(pageArray);
	}, [resultArray]);	
	

	useEffect(() => {
		
		if (pageArray[pageIndex]) {
		
			const userProfile = pageArray[pageIndex][0];
			setUserProfile(userProfile);
			
			setFullName(userProfile["full_name"]);
			setLatestTitle(userProfile["latest_title"]);
			setProfileId(userProfile["profile_id"]);
			setPublicId(userProfile["public_id"]);
			setProfileUrn(userProfile["profile_urn"]);
			
			setNoteTextArea("");
			
			setPeopleInterestsArray([]);
			setCompanyInterestsArray([]);
			setActivityInterestsArray([]);
			
			setSelectedInterests("");
		}
		
	}, [pageIndex, pageArray]);

	const handleNextPage = () => {
		if (pageIndex < pageArray.length - 1) {
			setPageIndex(pageIndex + 1);
		}
	};
		
	const handleGettingPeopleInterests = async () => {
		setIsLoading(true);
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
				setIsLoading(false);
				setPeopleInterestsArray(peopleInterestsArray);	
			});

		} catch (error) {
			console.error(error);
		}
	};
	
	const handleGettingCompanyInterests = async () => {
		setIsLoading(true);
		try {
			const response = await fetch("https://sak-productivity-suite.herokuapp.com/get-company-interests", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					sessionId: sessionId,
					profileUrn: profileUrn,
					publicId: publicId
				})
			});
			
			
			const data = await response.json();
			const jobId = data.message;
			
			CheckJobStatus(jobId, (companyInterestsArray) => {
				setIsLoading(false);
				setCompanyInterestsArray(companyInterestsArray);	
			});

		} catch (error) {
			console.error(error);
		}
	};
	
	// const handleGettingActivityInterests = () => {
		// // TODO
	// };
	
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
	
	const handleMakingConnectNote = async () => {
		
		const prompt = "This is the profile of a person: " + "\n" + fullName 
		+ " This is their summary: " + summary +
		" These are their interests: " + selectedInterests 
		+ " Use the internet to get something useful about the interests and use it in the request. "
		+ " Write a request to connect with them. Make it casual but eyecatching. The goal is to ask about their current Salesforce implementation. The length should be no more than 300 characters.";
		setIsLoading(true);
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
				setIsLoading(false);	
				setNoteTextArea(resultArray);	
			});

		}catch(error){
			console.log(error);
		}
	};
	
	const handleSendingConnectNote = async () => {
		
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
	
	const handleNoteTextAreaChange = (event) => {
		setNoteTextArea(event.target.value);
	};

	return (

		
			<Container>
			  <ListGroup>
				<ListGroup.Item action onClick={() => setShowProfileArea(true)}>
				  <div>{fullName}</div>
				</ListGroup.Item>
			  </ListGroup>
		  
			  {setShowProfileArea && (
				<div>
				  <Form.Group>
					<Form.Control
					  as="textarea"
					  value={noteTextArea}
					  onChange={handleNoteTextAreaChange}
					  placeholder="The generated note will appear here"
					/>
				  </Form.Group>
		  
				  <ListGroup>
					<ListGroup.Item>
					  <div>{latestTitle}</div>
					</ListGroup.Item>
		  		  
					<ListGroup.Item>
					  <Button onClick={handleGettingPeopleInterests}>
						Get people interests
					  </Button>
					</ListGroup.Item>
		  
					<ListGroup.Item>
					  <Button onClick={handleGettingCompanyInterests}>
						Get company interests
					  </Button>
					</ListGroup.Item>
		  
					<ListGroup.Item>
					  <Button onClick={handleNextPage}>Next</Button>
					</ListGroup.Item>
		  
					<ListGroup.Item>
					  <Button onClick={handleMakingConnectNote}>
						Make Connect Note
					  </Button>
					</ListGroup.Item>
		  
					<ListGroup.Item>
					  <Button onClick={handleSendingConnectNote}>
						Send Connect Note
					  </Button>
					</ListGroup.Item>
		  
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
				  </ListGroup>
				</div>
			  )}
			</Container>
	);
}
export default DisplaySearchResults;
