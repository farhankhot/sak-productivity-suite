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

			fetch("http://159.65.117.84:80/save-cookie", {
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
		
			<ProfileSearch cookie={cookie} />
		
		)}
		</>
		
	);

}
export default LinkedinCookie;