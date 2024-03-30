document.addEventListener("DOMContentLoaded", () => {
	const examsList = document.getElementById("examsList");

	fetch("/exams")
		.then((response) => response.json())
		.then((exams) => {
			exams.forEach((exam) => {
				const listItem = document.createElement("li");
				listItem.textContent = exam.title;
				examsList.appendChild(listItem);
				console.log(listItem);
			});
		})
		.catch((error) => {
			console.error("Error fetching exams:", error);
		});
});
