import React, {useState, useEffect} from "react";
import {useNavigate} from 'react-router-dom';
import Button from 'react-bootstrap/Button';

function Home(props) {

	const {sessionId} = props;
    const [leads, setLeads] = useState("");
	console.log("Home sessionId: ", sessionId);
		
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
			console.log("Successfully gotten leads: ", data.message);
            setLeads(data)
			
		}catch(error){
			console.log(error);
		}	
	};
	return (
		<>
            <Button variant="primary" type="button" onClick={handleGettingLeads}>
                Get Leads
            </Button>
            <p>
                {leads}
            </p>
		</>
	)
}
export default Home;