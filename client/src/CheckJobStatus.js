export async function CheckJobStatus(jobId, onSuccess) {
	try {
		
		const response = await fetch("http://159.65.117.84:80/job-status", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				jobId: jobId
			})
		});
		
		const data = await response.json();
		const status = data.status;
		
		if (status === "finished") {
			const resultArray = data.result;
			onSuccess(resultArray);
		} else {
			setTimeout(() => CheckJobStatus(jobId, onSuccess), 1000);
		}
		

	}catch(error){
		console.log("An error has occured (CheckJobStatus): ", error);
	}
}