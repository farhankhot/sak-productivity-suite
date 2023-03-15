/*global chrome*/
import React, {useState, useEffect} from "react";

function DisplayConvos(props) {
	
	const {cookie} = props;
		
	const handleConvoClick = async () => {
		// TODO
	};
	
	return (
		<>
		<div>
			
		</div>	
		</>
	);
	
}
export default DisplayConvos;

// document.getElementById("MessagesButton").onclick = function() {

// fetch("https://ai-assistant.herokuapp.com/get-convo-threads", {
	// method: "POST",
	// headers: {
		// "Content-Type": "application/json"
	// },
	// body: JSON.stringify({
		// email: email,
		// password: password,
		// cookie: cookie
	// })
// })
// .then(response => response.json())
// .then(data => {

	// console.log("Successfully gotten conversation threads", data.message);
	// var words = data.message;
	// var container = document.getElementById('ThreadsContainer');

	// for (var i = 0; i < words.length; i++) {

		// var button = document.createElement('input');
		// button.type = 'button';
		// button.value = words[i][0];
		// button.id = words[i][1];
		// button.className = "OpenConvoButton";
		// var label = document.createElement('label');
		// label.textContent = words[i][0];
		// label.appendChild(button);
		// container.appendChild(label);
	// }
	// const convoButtons = document.querySelectorAll('.OpenConvoButton');
	// convoButtons.forEach(function(button) {
		// button.addEventListener('click', function() {

			// // Clear the buttons, create a header of button.value
			// container.style.display = "none";
			// var msg_container = document.getElementById("MessagesContainer");
			// var new_h1 = document.createElement("h1")
			// new_h1.innerHTML = button.value;

			// msg_container.appendChild(new_h1);

			// // Display the messages, create a textarea with "Get Interests" and "Generate Message" button
			// fetch("https://ai-assistant.herokuapp.com/get-convo-messages", {

					// method: "POST",
					// headers: {
						// "Content-Type": "application/json"
					// },
					// body: JSON.stringify({
						// email: email,
						// password: password,
						// cookie: cookie,
						// profileUrn: button.id
					// })
				// })
				// .then(response => response.json())
				// .then(data => {
					
					// console.log("Successfully gotten messages", data.message);

					// var new_p = document.createElement("p");
					// new_p.textContent = data.message;
					// new_p.style.color = "white";

					// var new_textarea = document.createElement("textarea");
					// new_textarea.id = "messageTextbox";
					// var generate_interests_button = document.createElement("button");
					// generate_interests_button.textContent = "Get Interests";
					// var generate_message_button = document.createElement("button");
					// generate_message_button.textContent = "Generate Message";

					// var send_message_button = document.createElement("button");
					// send_message_button.textContent = "Send Message";

					// msg_container.appendChild(new_p);
					// msg_container.appendChild(new_textarea);
					// msg_container.appendChild(generate_interests_button);
					// msg_container.appendChild(generate_message_button);
					// msg_container.appendChild(send_message_button);	

					// generate_interests_button.onclick = function() {

						// fetch("https://ai-assistant.herokuapp.com/get-interests-from-thread", {
								// method: "POST",
								// headers: {
									// "Content-Type": "application/json"
								// },
								// body: JSON.stringify({
									// email: email,
									// password: password,
									// cookie: cookie,
									// publicId: button.id
								// })
							// })
							// .then(response => response.json())
							// .then(data => {
								// console.log("Successfully gotten interests", data.message);

								// var words = data.message;
								// var container = document.getElementById('InterestsContainer');

								// for (var i = 0; i < words.length; i++) {

									// var checkbox = document.createElement('input');
									// checkbox.type = 'checkbox';
									// checkbox.value = words[i];
									// var label = document.createElement('label');
									// label.textContent = words[i];
									// label.appendChild(checkbox);
									// container.appendChild(label);
								// }
							// });
					// }

					// // If generate_message_button is clicked
					// generate_message_button.onclick = function() {

						// var checkboxes = document.querySelectorAll('input[type=checkbox]');
						// var topicList = [];
						// for (var i = 0; i < checkboxes.length; i++) {
							// if (checkboxes[i].checked) {
								// var topic = checkboxes[i].value;
								// topicList.push(topic);
							// }
						// }
						// var topicListString = topicList.toString();
						
						// var prompt_string = "Reply to this: " + data.message;
							
						// fetch('https://api.openai.com/v1/completions', {
								// method: 'POST',
								// headers: {
									// 'Content-Type': 'application/json',
									// 'Authorization': 'Bearer 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'
								// },

								// body: JSON.stringify({
									// model: 'text-davinci-003',
									// prompt: prompt_string,
									// max_tokens: 55,
									// temperature: 0.7
								// })
						// })
						// .then(response => response.json())
						// .then(data => {
							// //console.log(JSON.stringify(data));
							// console.log(data.choices[0].text);
							// new_textarea.value = data.choices[0].text;

						// }).catch(error => console.error(error));

						// // document.getElementById("my-textarea").value = prompt_string;
					// }

					// send_message_button.onclick = function() {

						// fetch("https://ai-assistant.herokuapp.com/send-message", {
								// method: "POST",
								// headers: {
									// "Content-Type": "application/json"
								// },
								// body: JSON.stringify({
									// email: email,
									// password: password,
									// cookie: cookie,
									// profileId: button.id,
									// text: new_textarea.value
								// })
							// })
							// .then(response => response.json())
							// .then(data => {
								// console.log("Successfully sent connect to server", data.message);
							// });
					// }
				// }