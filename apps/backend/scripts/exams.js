document.addEventListener("DOMContentLoaded", () => {
	const examsList = document.getElementById("examsList");
	const examsTemplate = document.getElementById("exams-template").innerHTML;
	fetch("/exams")
		.then((response) => {
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
			response.json();
			return;
		})
		.then((exams) => {
			console.log(exams);
			const compiledTemplate = Handlebars.compile(examsTemplate);
			examsList.innerHTML = compiledTemplate({ exams: exams });
		})
		.catch((error) => {
			console.error("Error fetching exams:", error);
		});
});
