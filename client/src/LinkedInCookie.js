/*global chrome*/
import React, {useState, useEffect} from "react";
import ProfileSearch from "./ProfileSearch.js";
import AudioRetrieval from "./AudioRetrieval.js";

function LinkedinCookie() {
	
	const [cookie, setCookie] = useState("");
	
	useEffect( () => {
		chrome.storage.local.set({
			'LinkedinCookie': cookie
		});
	
	}, [cookie]);	
		
	const handleLinkedinCookie = () => {
		
		chrome.cookies.getAll({ url: "https://www.linkedin.com/feed/" }, (cookie) => {
					
			fetch("https://sak-productivity-suite.herokuapp.com/save-cookie", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					cookie: cookie
				})
			})
			.then((response) => response.json())
			.then((data) => {
				
				setCookie(cookie);
				
			});

		});
	
	};
	
	return (
		<>
		{cookie === "" ? (
			<div>
				
				<h1>MAKE SURE YOU ARE LOGGED IN TO LINKEDIN BEFORE CLICKING BELOW</h1> 

				<button onClick={handleLinkedinCookie}>
					Get Linkedin Cookies
				</button>
				
				<AudioRetrieval />
			</div>
			
		) : (
			<button onClick={() => chrome.runtime.sendMessage({ type: 'render' })}>Render New Component</button>
			// <ProfileSearch cookie={cookie} />
			
		)}
		</>
		
	);

}
export default LinkedinCookie;