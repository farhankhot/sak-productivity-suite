/*global chrome*/
import React, {useState, useEffect} from "react";
import {CheckJobStatus} from "./CheckJobStatus.js";
import ProfileSearch from "./ProfileSearch.js";

// TODO: Next button still clickable at the last page
// When to move to full page?

function DisplaySearchResults(props) {
	
	// Have jobFinished for peopleInterestsArray, companyInterestsArray and activityInterestsArray
	
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
	
	const [peopleInterestsArray, setPeopleInterestsArray] = useState([]);
	const [companyInterestsArray, setCompanyInterestsArray] = useState([]);	
	const [activityInterestsArray, setActivityInterestsArray] = useState([]);
	
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

			const data = await response.json();
			console.log(data);
			
			const jobId = data.message;
			
			CheckJobStatus(jobId, (peopleInterestsArray) => {
				setPeopleInterestsArray(peopleInterestsArray);	
			});

		} catch (error) {
			console.error(error);
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

			const data = await response.json();
			console.log(data);
			
			const jobId = data.message;
			
			CheckJobStatus(jobId, (companyInterestsArray) => {
				setCompanyInterestsArray(companyInterestsArray);	
			});

		} catch (error) {
			console.error(error);
		}
	};
	
	const handleGettingActivityInterests = () => {
		// TODO
	};
	
	const handleMakingConnectNote = () => {
		// TODO
	};
	
	const handleSendingConnectNote = () => {
		// TODO
	};
	
	const handleNoteTextAreaChange = (event) => {
		setNoteTextArea(event.target.value);
	};

	return (
		<div>
			<div>{fullName}</div>
			<div>{latestTitle}</div>
			<textarea value={noteTextArea} onChange={handleNoteTextAreaChange} placeholder="The generated note will appear here"></textarea>		
			<button onClick={handleGettingPeopleInterests}>
				Get people interests
			</button>
			<button onClick={handleGettingCompanyInterests}>
				Get company interests
			</button>
			<button onClick={handleGettingActivityInterests}>
				Get interests from Linkedin activity
			</button>
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
				<select multiple>
					{peopleInterestsArray.map( (interest) => (
						<option key={interest}>{interest}</option>
					))}

				</select>
			)}

			{companyInterestsArray.length > 0 && (
				<select multiple>
					{companyInterestsArray.map( (interest) => (
						<option key={interest}>{interest}</option>
					))}

				</select>
			)}
			
		</div>
	);
}

export default DisplaySearchResults;

// const resultArray = data.result;

// // console.log(result);
// // return result;

// document.getElementById("linkedin-search-page").style.display = "none";
// document.getElementById("linkedin-page").style.display = "block";

// var myArray = resultArray;
// // var myArray = data.message;
// var pageSize = 1;
// var currentPage = 0;

// // Divide the array into pages
// var pages = [];
// for (var i = 0; i < myArray.length; i += pageSize) {
	// pages.push(myArray.slice(i, i + pageSize));
// }

// var copyProfile = JSON.parse(JSON.stringify(pages[currentPage]));
// var first_name = copyProfile[0]['firstName'] + " " + copyProfile[0]['lastName'];
// var first_title = copyProfile[0]['headline'];
// var profileId = copyProfile[0]['profile_id'];
// var summary = copyProfile[0]['summary'];
// var skills = copyProfile[0]['skills'];
// var public_id = copyProfile[0]['public_id'];
// var profileUrn = copyProfile[0]['profile_urn'];

// document.getElementById("name").innerHTML = first_name;
// document.getElementById("title").innerHTML = first_title;

// var nextButton = document.getElementById("next-button");

// nextButton.addEventListener("click", function() {
	
	// // Clear
	// document.getElementById("my-textarea").value = "";
	// document.getElementById("CheckboxContainer").innerHTML = "";
	// document.getElementById("InterestsContainer").innerHTML = "";
	// document.getElementById("PeopleInterestsContainer").innerHTML = "";
	// document.getElementById("CompanyInterestsContainer").innerHTML = "";					

	// // Increment the current page index
	// currentPage = (currentPage + 1) % pages.length;
	// var copyProfile = JSON.parse(JSON.stringify(pages[currentPage]));
	// var name = copyProfile[0]['firstName'] + " " + copyProfile[0]['lastName'];
	// var title = copyProfile[0]['headline'];
	// var profileId = copyProfile[0]['profile_id'];
	// var summary = copyProfile[0]['summary'];
	// var skills = copyProfile[0]['skills'];
	// var publicId = copyProfile[0]['public_id'];
	// var profileUrn = copyProfile[0]['profile_urn'];

	// document.getElementById("name").innerHTML = name;
	// document.getElementById("title").innerHTML = title;
	
	// document.getElementById("PeopleInterestsButton").onclick = function() {

		// fetch("https://ai-assistant.herokuapp.com/get-people-interests", {
			// method: "POST",
			// headers: {
				// "Content-Type": "application/json"
			// },
			// body: JSON.stringify({
				// email: email,
				// password: password,
				// cookie: cookie,
				// profileUrn: profileUrn
			// })
		// })
		// .then(response => response.json())
		// .then(data => {
			
			// var jobId = data.message;
			
			// console.log("job of people interests", jobId);
			
			// function checkJobStatus(jobId) {
				// fetch("https://ai-assistant.herokuapp.com/job-status", {
					// method: "POST",
					// headers: {
						// "Content-Type": "application/json"
					// },
					// body: JSON.stringify({
						// jobId: jobId
					// })
				// })
				
				// .then(response => response.json())
				// .then(data => {
					
					// const status = data.status;
					// console.log(status);
					
					// if (status === 'finished') {
					
						// console.log("Successfully gotten people interests", data.result);
						
						// const words = data.result;

						// // var words = data.message;
						
						// var container = document.getElementById('PeopleInterestsContainer');

						// for (var i = 0; i < words.length; i++) {

							// var checkbox = document.createElement('input');
							// checkbox.type = 'checkbox';
							// checkbox.value = words[i][0];
							// checkbox.id = words[i][1];
							// var label = document.createElement('label');
							// label.textContent = words[i][0];
							// label.appendChild(checkbox);
							// container.appendChild(label);
						// }
						
						
					// } else {
						// // The job is not finished yet, check again in 1 second
						// setTimeout(() => checkJobStatus(jobId), 1000);
					// }
				// });
					
			// }
			// checkJobStatus(data.message);
				
		// });
	// }
	
	// document.getElementById("CompanyInterestsButton").onclick = function() {

		// fetch("https://ai-assistant.herokuapp.com/get-company-interests", {
			// method: "POST",
			// headers: {
				// "Content-Type": "application/json"
			// },
			// body: JSON.stringify({
				// email: email,
				// password: password,
				// cookie: cookie,
				// profileUrn: profileUrn
			// })
		// })
		// .then(response => response.json())
		// .then(data => {
			
			// var jobId = data.message;
			
			// console.log("job of company interests", jobId);
			
			// function checkJobStatus(jobId) {
				// fetch("https://ai-assistant.herokuapp.com/job-status", {
					// method: "POST",
					// headers: {
						// "Content-Type": "application/json"
					// },
					// body: JSON.stringify({
						// jobId: jobId
					// })
				// })
				
				// .then(response => response.json())
				// .then(data => {
					
					// const status = data.status;
					// console.log(status);
					
					// if (status === 'finished') {
					
						// console.log("Successfully gotten company interests", data.result);
						
						// const words = data.result;
									
						// var container = document.getElementById('CompanyInterestsContainer');

						// for (var i = 0; i < words.length; i++) {

							// var checkbox = document.createElement('input');
							// checkbox.type = 'checkbox';
							// checkbox.value = words[i][0];
							// checkbox.id = words[i][1];
							// var label = document.createElement('label');
							// label.textContent = words[i][0];
							// label.appendChild(checkbox);
							// container.appendChild(label);
						// }
						
						
					// } else {
						// // The job is not finished yet, check again in 1 second
						// setTimeout(() => checkJobStatus(jobId), 1000);
					// }
				// });
					
			// }
			// checkJobStatus(data.message);
				
		// });
	
	// }
	// document.getElementById("GenerateConnectNoteButton").onclick = function() {
		// var checkboxes = document.querySelectorAll('input[type=checkbox]');
		// var topicList = [];
		// for (var i = 0; i < checkboxes.length; i++) {
			// if (checkboxes[i].checked) {
				// var topic = checkboxes[i].value;
				// topicList.push(topic);
			// }
		// }
		// var topicListString = topicList.toString();

		// var prompt_string = "This is the profile of a person: " + "\n" + name 
		// + " This is their summary: " + summary +
		// " These are their interests: " + topicListString 
		// + " Use the internet to get something useful about the interests and use it in the request. "
		// + " Write a request to connect with them. Make it casual but eyecatching. The goal is to ask about their current Salesforce implementation. The length should be no more than 70 words.";
		
		// // console.log(prompt_string);			
						
		// fetch("https://ai-assistant.herokuapp.com/use-bingai", {
			// method: "POST",
			// headers: {
				// "Content-Type": "application/json"
			// },
			// body: JSON.stringify({
				// prompt: prompt_string
			// })
		// })
		// .then(response => response.json())
		// .then(data => {
			
			// console.log(data.message);
			
			// document.getElementById("my-textarea").value = data.message;
			

		// }).catch(error => console.error(error));

	// }

	// document.getElementById("send-button").onclick = function() {

		// // fetch to server.js, with profileId and text
		// fetch("https://ai-assistant.herokuapp.com/send-connect", {
				// method: "POST",
				// headers: {
					// "Content-Type": "application/json"
				// },
				// body: JSON.stringify({
					// email: email,
					// password: password,
					// cookie: cookie,
					// profileId: profileId,
					// text: document.getElementById("my-textarea").value
				// })
			// })
			// .then(response => response.json())
			// .then(data => {
				// console.log("Successfully sent connect to server", data.message);
			// });
	// }
	
	
// });

// // document.getElementById("InterestsButton").onclick = function() {

		// // fetch("https://ai-assistant.herokuapp.com/get-interests", {
				// // method: "POST",
				// // headers: {
					// // "Content-Type": "application/json"
				// // },
				// // body: JSON.stringify({
					// // email: email,
					// // password: password,
					// // publicId: publicId
				// // })
			// // })
			// // .then(response => response.json())
			// // .then(data => {
				// // console.log("Successfully gotten interests", data.message);

				// // var words = data.message;
				// // var container = document.getElementById('CheckboxContainer');

				// // for (var i = 0; i < words.length; i++) {

					// // var checkbox = document.createElement('input');
					// // checkbox.type = 'checkbox';
					// // checkbox.value = words[i];
					// // var label = document.createElement('label');
					// // label.textContent = words[i];
					// // label.appendChild(checkbox);
					// // container.appendChild(label);
				// // }
			// // });
	// // }
	
	// document.getElementById("PeopleInterestsButton").onclick = function() {

		// fetch("https://ai-assistant.herokuapp.com/get-people-interests", {
			// method: "POST",
			// headers: {
				// "Content-Type": "application/json"
			// },
			// body: JSON.stringify({
				// email: email,
				// password: password,
				// cookie: cookie,
				// profileUrn: profileUrn
			// })
		// })
		// .then(response => response.json())
		// .then(data => {
			
			// var jobId = data.message;
			
			// console.log("job of people interests", jobId);
			
			// function checkJobStatus(jobId) {
				// fetch("https://ai-assistant.herokuapp.com/job-status", {
					// method: "POST",
					// headers: {
						// "Content-Type": "application/json"
					// },
					// body: JSON.stringify({
						// jobId: jobId
					// })
				// })
				
				// .then(response => response.json())
				// .then(data => {
					
					// const status = data.status;
					// console.log(status);
					
					// if (status === 'finished') {
					
						// console.log("Successfully gotten people interests", data.result);
						
						// const words = data.result;

						// // var words = data.message;
						
						// var container = document.getElementById('PeopleInterestsContainer');

						// for (var i = 0; i < words.length; i++) {

							// var checkbox = document.createElement('input');
							// checkbox.type = 'checkbox';
							// checkbox.value = words[i][0];
							// checkbox.id = words[i][1];
							// var label = document.createElement('label');
							// label.textContent = words[i][0];
							// label.appendChild(checkbox);
							// container.appendChild(label);
						// }
						
						
					// } else {
						// // The job is not finished yet, check again in 1 second
						// setTimeout(() => checkJobStatus(jobId), 1000);
					// }
				// });
					
			// }
			// checkJobStatus(data.message);
				
		// });
	// }
	
	// document.getElementById("CompanyInterestsButton").onclick = function() {

		// fetch("https://ai-assistant.herokuapp.com/get-company-interests", {
			// method: "POST",
			// headers: {
				// "Content-Type": "application/json"
			// },
			// body: JSON.stringify({
				// email: email,
				// password: password,
				// cookie: cookie,
				// profileUrn: profileUrn
			// })
		// })
		// .then(response => response.json())
		// .then(data => {
			
			// var jobId = data.message;
			
			// console.log("job of company interests", jobId);
			
			// function checkJobStatus(jobId) {
				// fetch("https://ai-assistant.herokuapp.com/job-status", {
					// method: "POST",
					// headers: {
						// "Content-Type": "application/json"
					// },
					// body: JSON.stringify({
						// jobId: jobId
					// })
				// })
				
				// .then(response => response.json())
				// .then(data => {
					
					// const status = data.status;
					// console.log(status);
					
					// if (status === 'finished') {
					
						// console.log("Successfully gotten company interests", data.result);
						
						// const words = data.result;
									
						// var container = document.getElementById('CompanyInterestsContainer');

						// for (var i = 0; i < words.length; i++) {

							// var checkbox = document.createElement('input');
							// checkbox.type = 'checkbox';
							// checkbox.value = words[i][0];
							// checkbox.id = words[i][1];
							// var label = document.createElement('label');
							// label.textContent = words[i][0];
							// label.appendChild(checkbox);
							// container.appendChild(label);
						// }
						
						
					// } else {
						// // The job is not finished yet, check again in 1 second
						// setTimeout(() => checkJobStatus(jobId), 1000);
					// }
				// });
					
			// }
			// checkJobStatus(data.message);
				
		// });
	
	// }

	// document.getElementById("GenerateConnectNoteButton").onclick = function() {
		// var checkboxes = document.querySelectorAll('input[type=checkbox]');
		// var topicList = [];
		// for (var i = 0; i < checkboxes.length; i++) {
			// if (checkboxes[i].checked) {
				// var topic = checkboxes[i].value;
				// topicList.push(topic);
			// }
		// }
		// var topicListString = topicList.toString();

		// var prompt_string = "This is the profile of a person: " + "\n" + first_name 
		// + " This is their summary: " + summary +
		// " These are their interests: " + topicListString 
		// + " Use the internet to get something useful about the interests and use it in the request. "
		// + " Write a request to connect with them. Make it casual but eyecatching. The goal is to ask about their current Salesforce implementation. The length should be no more than 70 words.";
		
		// // console.log(prompt_string);			
						
		// fetch("https://ai-assistant.herokuapp.com/use-bingai", {
			// method: "POST",
			// headers: {
				// "Content-Type": "application/json"
			// },
			// body: JSON.stringify({
				// prompt: prompt_string
			// })
		// })
		// .then(response => response.json())
		// .then(data => {
			
			// console.log(data.message);
			
			// document.getElementById("my-textarea").value = data.message;
			

		// }).catch(error => console.error(error));

	// }

	// document.getElementById("send-button").onclick = function() {

		// // fetch to server.js, with profileId and text
		// fetch("https://ai-assistant.herokuapp.com/send-connect", {
				// method: "POST",
				// headers: {
					// "Content-Type": "application/json"
				// },
				// body: JSON.stringify({
					// email: email,
					// password: password,
					// cookie: cookie,
					// profileId: profileId,
					// text: document.getElementById("my-textarea").value
				// })
			// })
			// .then(response => response.json())
			// .then(data => {
				// console.log("Successfully sent connect to server", data.message);
			// });
	// }
