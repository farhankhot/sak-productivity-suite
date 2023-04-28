/*global chrome*/
import React, {useState, useEffect} from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProfileSearch from "./ProfileSearch.js";

function LinkedInCookie() {
	
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
		<Router>
			<Route path="/dashboard" element={<ProfileSearch />} />			
		</Router>
		</>
	);
}
export default LinkedInCookie;