/*global chrome*/
import React, {useState, useEffect} from "react";
import {CheckJobStatus} from "./CheckJobStatus.js";
import ProfileSearch from "./ProfileSearch.js";
import loadingGif from "./loading.gif";

// TODO: 
// Move peopleInterests, companyInterests and activityInterests to 3 separate components
// Move making note to a separate component

// Next button still clickable at the last page

function DisplaySearchResults(props) {
	
	const {cookie, resultArray} = props;
	
	const [userProfile, setUserProfile] = useState([]);
	const [pageArray, setPageArray] = useState([]);
	const [pageIndex, setPageIndex] = useState(0);
	
	const [fullName, setFullName] = useState("");
	const [latestTitle, setLatestTitle] = useState("");
	const [profileId, setProfileId] = useState("");
	const [summary, setSummary] = useState("");
	const [skills, setSkills] = useState("");
	const [publicId, setPublicId] = useState("");
	const [profileUrn, setProfileUrn] = useState("");
	
	const [noteTextArea, setNoteTextArea] = useState(""); 
	
	const [interests, setInterests] = useState(""); 
	
	const [peopleInterestsArray, setPeopleInterestsArray] = useState([]);	
	const [companyInterestsArray, setCompanyInterestsArray] = useState([]);	
	const [activityInterestsArray, setActivityInterestsArray] = useState([]);
	
	const [selectedInterests, setSelectedInterests] = useState("");
	
	const [isLoading, setIsLoading] = useState(false);
	
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
			
			setFullName(userProfile["firstName"] + " " + userProfile["lastName"]);
			setLatestTitle(userProfile["headline"]);
			setProfileId(userProfile["profile_id"]);
			setSummary(userProfile["summary"]);
			setSkills(userProfile["skills"]);
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
		try {
			const response = await fetch("https://sak-productivity-suite.herokuapp.com/get-people-interests", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					cookie: cookie,
					profileUrn: profileUrn
				})
			});
			
			setIsLoading(true);
			const data = await response.json();			
			const jobId = data.message;
			
			CheckJobStatus(jobId, (peopleInterestsArray) => {
				setPeopleInterestsArray(peopleInterestsArray);	
			});

		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};
	
	const handleGettingCompanyInterests = async () => {
		try {
			const response = await fetch("https://sak-productivity-suite.herokuapp.com/get-company-interests", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					cookie: cookie,
					profileUrn: profileUrn,
					publicId: publicId
				})
			});
			
			setIsLoading(true);
			const data = await response.json();
			const jobId = data.message;
			
			CheckJobStatus(jobId, (companyInterestsArray) => {
				setCompanyInterestsArray(companyInterestsArray);	
			});

		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
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
		+ " Write a request to connect with them. Make it casual but eyecatching. The goal is to ask about their current Salesforce implementation. The length should be no more than 70 words.";
		
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
			setNoteTextArea(data.message);			

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
					cookie: cookie,
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
		<div>
			<div>{fullName}</div>
			<div>{latestTitle}</div>
			<textarea value={noteTextArea} onChange={handleNoteTextAreaChange} placeholder="The generated note will appear here"></textarea>	

			<div>{interests}</div>

			{isLoading && <img src={loadingGif} alt="loading" />}

			<button onClick={handleGettingPeopleInterests}>
				Get people interests
			</button>
			<button onClick={handleGettingCompanyInterests}>
				Get company interests
			</button>
			{/*<button onClick={handleGettingActivityInterests}>
				Get interests from Linkedin activity
			</button>*/}
			<button onClick={handleNextPage}>
				Next
			</button>
			<button onClick={handleMakingConnectNote}>
				Make Connect Note
			</button>
			<button onClick={handleSendingConnectNote}>
				Send Connect Note
			</button>
		
			{peopleInterestsArray.length > 0 && (

				<select multiple onChange={handleInterestsSelection} >
				
					{peopleInterestsArray.map( (interest) => (
						<option key={interest}>{interest[0]}</option>
					))}
				</select>
			)}

			{companyInterestsArray.length > 0 && (
				
				<select multiple onChange={handleInterestsSelection} >
				
					{companyInterestsArray.map( (interest) => (
						<option key={interest}>{ interest[0] }</option>
					))}
				</select>
			)}
			
			{activityInterestsArray.length > 0 && (
			
				<select multiple onChange={handleInterestsSelection} >
				
					{activityInterestsArray.map( (interest) => (
						<option key={interest}>{ interest[0] }</option>
					))}
				</select>
			)}
			
		</div>
	);
}
export default DisplaySearchResults;
