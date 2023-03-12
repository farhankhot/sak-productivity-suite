/*global chrome*/
import React, {useState, useEffect} from "react";
import ProfileSearch from "./ProfileSearch.js";

function DisplaySearchResults(props) {
	
	const {resultArray} = props;
	const [fullName, setFullName] = useState("");
	const [latestTitle, setLatestTitle] = useState("");
	const [currentPage, setCurrentPage] = useState(0);
	const pageSize = 1;
	
	// Divide the array into pages
	const pages = [];
	for (let i = 0; i < resultArray.length; i += pageSize) {
		pages.push(resultArray.slice(i, i + pageSize));
	}

	const userProfile = JSON.parse(JSON.stringify(pages[currentPage]));
	// const fullName = userProfile[0]["firstName"] + " " + userProfile[0]["lastName"];
	// const latestTitle = userProfile[0]["headline"];
	// const profileId = userProfile[0]["profile_id"];
	// const summary = userProfile[0]["summary"];
	// const skills = userProfile[0]["skills"];
	// const publicId = userProfile[0]["public_id"];
	// const profileUrn = userProfile[0]["profile_urn"];

	useEffect(() => {
		setFullName( userProfile[0]["firstName"] + " " + userProfile[0]["lastName"] );
		setLatestTitle( userProfile[0]["headline"] );
	}, [fullName, latestTitle]);

	const handleNextPage = () => {
		if (currentPage < pages.length - 1) {
			setCurrentPage(currentPage + 1);
		}
	};

	return (
		<div>
			<div id="name">{fullName}</div>
			<div id="title">{latestTitle}</div>
			<button id="next-button" onClick={handleNextPage}>Next</button>
		</div>
	);
	
	
}
export default DisplaySearchResults

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
