export async function CheckJobStatus(jobId, onSuccess) {
	try {
		
		const response = await fetch("https://sak-productivity-suite.herokuapp.com/job-status", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				jobId: jobId
			})
		});
		if (response.ok){
			const data = await response.json();
			const status = data.status;
			
			if (status === "finished") {
				const resultArray = data.result;
				onSuccess(resultArray);
			} else {
				setTimeout(() => CheckJobStatus(jobId, onSuccess), 500);
			}	
		}
		else{
			console.log("Error occurred in CheckJobStatus");
		}

	}catch(error){
		console.log("An error has occured (CheckJobStatus): ", error);
	}
}