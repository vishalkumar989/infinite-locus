// Dummy course data
let courses = [
    { name: "JavaScript Basics", ratings: [5, 4, 4, 5], comments: [] },
    { name: "Python Programming", ratings: [3, 4, 2, 5], comments: [] },
    { name: "Data Science 101", ratings: [5, 5, 4, 4], comments: [] }
];

// Display course list with average ratings
function displayCourses() {
    let container = document.getElementById("courseList");
    container.innerHTML = "";
    courses.forEach(course => {
        let avg = (course.ratings.reduce((a,b) => a+b, 0) / course.ratings.length).toFixed(1);
        container.innerHTML += `
            <div class="course">
                <h3>${course.name}</h3>
                <p>Average Rating: ${avg} ⭐</p>
            </div>
        `;
    });
}

// Handle feedback form
let form = document.getElementById("feedbackForm");
if (form) {
    form.addEventListener("submit", e => {
        e.preventDefault();
        let courseName = document.getElementById("courseSelect").value;
        let rating = parseInt(document.getElementById("rating").value);
        let comment = document.getElementById("comment").value;

        let course = courses.find(c => c.name === courseName);
        course.ratings.push(rating);
        course.comments.push(comment);

        document.getElementById("msg").innerText = "Feedback submitted!";
        form.reset();
    });
}

// Show charts
function showCharts() {
    let labels = courses.map(c => c.name);
    let avgRatings = courses.map(c => (c.ratings.reduce((a,b) => a+b, 0) / c.ratings.length).toFixed(1));

    let ctxBar = document.getElementById("barChart").getContext("2d");
    new Chart(ctxBar, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Average Rating",
                data: avgRatings,
                backgroundColor: "rgba(75, 192, 192, 0.6)"
            }]
        }
    });

    let ctxPie = document.getElementById("pieChart").getContext("2d");
    new Chart(ctxPie, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                label: "Average Rating",
                data: avgRatings,
                backgroundColor: ["red", "blue", "green"]
            }]
        }
    });
}
