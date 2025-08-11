/**********************************************
 * 📌 Shared Frontend Script  
 * Used in: index.html, feedback.html, analytics.html  
 * Author: [Your Name]  
 * Purpose: Manage course list, feedback, analytics
 **********************************************/

// === Default demo data (only used when localStorage is empty) ===
let courseList = [
    {
        id: "c1",
        name: "JavaScript Basics",
        ratings: [5, 4, 4, 5, 3, 5],
        comments: [
            { text: "Loved it", at: "2 days ago" },
            { text: "Good pace", at: "1 week ago" }
        ]
    },
    {
        id: "c2",
        name: "Python Programming",
        ratings: [3, 4, 2, 5, 4],
        comments: [{ text: "Too fast", at: "3 days ago" }]
    },
    {
        id: "c3",
        name: "Data Science 101",
        ratings: [5, 5, 4, 4, 5],
        comments: [
            { text: "Excellent content", at: "4 days ago" },
            { text: "Well structured", at: "6 days ago" }
        ]
    }
];


// Try loading data from localStorage (if it exists)
const savedCourses = localStorage.getItem("sf_courses_v1");
if (savedCourses) {
    try {
        courseList = JSON.parse(savedCourses);
    } catch (err) {
        console.warn("⚠ Saved data in localStorage is corrupted.");
    }
}

// Save current courseList to localStorage
function saveCourseData() {
    localStorage.setItem("sf_courses_v1", JSON.stringify(courseList));
}

// ================= INDEX PAGE =================
function renderCourses(searchTerm = "", sortOption = "name") {
    const container = document.getElementById("courseList");
    if (!container) return;

    // Filter by search
    let filteredCourses = courseList.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort based on selected option
    if (sortOption === "avgDesc") {
        filteredCourses.sort((a, b) => averageRating(b) - averageRating(a));
    } else if (sortOption === "countDesc") {
        filteredCourses.sort((a, b) => b.ratings.length - a.ratings.length);
    } else {
        filteredCourses.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Clear existing content
    container.innerHTML = "";

    // Render each course
    filteredCourses.forEach(course => {
        const courseCard = document.createElement("div");
        courseCard.className = "course-card card-tilt";

        const avg = course.ratings.length ? averageRating(course).toFixed(2) : "—";

        courseCard.innerHTML = `
            <div class="course-title">
                <h3>${escapeHTML(course.name)}</h3>
                <div class="rating-badge">${avg} ⭐</div>
            </div>
            <div class="course-meta">
                ${course.ratings.length} feedbacks • Avg: <span class="stars">${avg}</span>
            </div>
            <div class="actions">
                <button class="btn-small" data-action="analytics" data-id="${course.id}">View Analytics</button>
                <button class="btn-small" data-action="feedback" data-id="${course.id}">Give Feedback</button>
                <button class="btn-small btn-danger" data-action="delete" data-id="${course.id}">Delete</button>
            </div>
        `;

        container.appendChild(courseCard);
    });

    // Button actions
    container.querySelectorAll("button[data-action]").forEach(btn => {
        btn.onclick = e => {
            const courseId = e.currentTarget.dataset.id;
            const action = e.currentTarget.dataset.action;
            localStorage.setItem("sf_selected_course", courseId);

            if (action === "feedback") {
                window.location.href = "feedback.html";
            } else if (action === "analytics") {
                window.location.href = "analytics.html";
            } else if (action === "delete") {
                if (confirm("Are you sure you want to delete this course?")) {
                    courseList = courseList.filter(c => c.id !== courseId);
                    saveCourseData();
                    renderCourses(searchTerm, sortOption);
                }
            }
        };
    });
}

// Calculate average rating
function averageRating(courseOrArray) {
    const ratingsArray = Array.isArray(courseOrArray)
        ? courseOrArray
        : courseOrArray.ratings || [];
    if (!ratingsArray.length) return 0;
    return ratingsArray.reduce((sum, r) => sum + r, 0) / ratingsArray.length;
}

// Escape HTML to avoid XSS
function escapeHTML(str) {
    return (str || "").replace(/[&<>"']/g, c =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
}

// Initialize index page controls
function initIndexPage() {
    const searchInput = document.getElementById("searchInput");
    const sortSelect = document.getElementById("sortSelect");
    const addBtn = document.getElementById("addCourseBtn");

    if (searchInput) {
        searchInput.addEventListener("input", () =>
            renderCourses(searchInput.value, sortSelect.value)
        );
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", () =>
            renderCourses(searchInput ? searchInput.value : "", sortSelect.value)
        );
    }

    if (addBtn) {
        addBtn.addEventListener("click", () => {
            const courseName = prompt("Enter new course name:");
            if (courseName && courseName.trim()) {
                const newCourse = {
                    id: "c" + Date.now(),
                    name: courseName.trim(),
                    ratings: [],
                    comments: []
                };
                courseList.push(newCourse);
                saveCourseData();
                renderCourses();
            }
        });
    }
}

// ================= FEEDBACK PAGE =================
function initFeedbackForm() {
    const form = document.getElementById("feedbackForm");
    const courseSelect = document.getElementById("courseSelect");
    if (!form || !courseSelect) return;

    // Populate dropdown
    courseSelect.innerHTML = "";
    courseList.forEach(course => {
        const option = document.createElement("option");
        option.value = course.id;
        option.innerText = course.name;
        courseSelect.appendChild(option);
    });

    // Preselect if coming from index
    const preSelected = localStorage.getItem("sf_selected_course");
    if (preSelected) courseSelect.value = preSelected;

    // Form submit
    form.addEventListener("submit", e => {
        e.preventDefault();

        const selectedId = courseSelect.value;
        const rating = parseInt(document.getElementById("rating").value);
        const comment = document.getElementById("comment").value.trim();

        if (!rating || rating < 1 || rating > 5) {
            alert("Rating must be between 1 and 5");
            return;
        }

        const course = courseList.find(c => c.id === selectedId);
        if (!course) {
            alert("Course not found");
            return;
        }

        course.ratings.push(rating);
        if (comment) {
            course.comments.push({ text: comment, at: "just now" });
        }

        saveCourseData();

        document.getElementById("msg").innerText =
            "✅ Feedback submitted — Thank you!";
        form.reset();
        renderCourses();

        // Redirect to analytics page after short delay
        setTimeout(() => {
            window.location.href = "analytics.html";
        }, 900);
    });
}

// ================= ANALYTICS PAGE =================
function initAnalytics() {
    const barChartEl = document.getElementById("barChart");
    const pieChartEl = document.getElementById("pieChart");
    const courseSelect = document.getElementById("courseSelect");

    if (!barChartEl || !pieChartEl || !courseSelect) return;

    // Fill dropdown
    courseSelect.innerHTML = "";
    courseList.forEach(course => {
        const option = document.createElement("option");
        option.value = course.id;
        option.innerText = course.name;
        courseSelect.appendChild(option);
    });

    const preSelected = localStorage.getItem("sf_selected_course");
    if (preSelected) courseSelect.value = preSelected;

    // Draw charts
    function drawForCourse(id) {
        const course = courseList.find(c => c.id === id);
        if (!course) return;

        const dist = [0, 0, 0, 0, 0];
        course.ratings.forEach(r => {
            if (r >= 1 && r <= 5) dist[r - 1]++;
        });

        const labels = ["1★", "2★", "3★", "4★", "5★"];

        if (window.Chart) {
            if (window._barChart) window._barChart.destroy();
            if (window._pieChart) window._pieChart.destroy();

            window._barChart = new Chart(barChartEl.getContext("2d"), {
                type: "bar",
                data: {
                    labels,
                    datasets: [
                        {
                            label: "Count",
                            data: dist,
                            backgroundColor: [
                                "#ef4444",
                                "#f97316",
                                "#f59e0b",
                                "#60a5fa",
                                "#10b981"
                            ]
                        }
                    ]
                },
                options: { responsive: true, plugins: { legend: { display: false } } }
            });

            window._pieChart = new Chart(pieChartEl.getContext("2d"), {
                type: "pie",
                data: {
                    labels,
                    datasets: [
                        {
                            data: dist,
                            backgroundColor: [
                                "#ef4444",
                                "#f97316",
                                "#f59e0b",
                                "#60a5fa",
                                "#10b981"
                            ]
                        }
                    ]
                },
                options: { responsive: true }
            });
        }

        // Update stats
        document.getElementById("avgVal").innerText = course.ratings.length
            ? averageRating(course).toFixed(2) + " ⭐"
            : "—";
        document.getElementById("totalVal").innerText = course.ratings.length;

        // Show comments
        const commentsBox = document.getElementById("commentsList");
        commentsBox.innerHTML = course.comments.length
            ? course.comments
                  .slice()
                  .reverse()
                  .map(
                      cm =>
                          `<div class="comment"><div class="meta">${escapeHTML(
                              cm.at
                          )}</div><div>${escapeHTML(cm.text)}</div></div>`
                  )
                  .join("")
            : '<div style="color:var(--muted)">No comments yet</div>';
    }

    drawForCourse(courseSelect.value);

    courseSelect.addEventListener("change", () => {
        localStorage.setItem("sf_selected_course", courseSelect.value);
        drawForCourse(courseSelect.value);
    });
}

// ================= INIT =================
window.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("courseList")) {
        initIndexPage();
        renderCourses();
    }
    initFeedbackForm();
    initAnalytics();

    // Small tilt animation for cards
    document.querySelectorAll(".card-tilt").forEach(el => {
        el.addEventListener("mousemove", e => {
            const rect = el.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width;
            const py = (e.clientY - rect.top) / rect.height;
            const rx = (py - 0.5) * 6;
            const ry = (px - 0.5) * -6;
            el.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(4px)`;
        });
        el.addEventListener("mouseleave", () => {
            el.style.transform = "";
        });
    });
});
document.getElementById("exportPNG").addEventListener("click", () => {
    const barCanvas = document.getElementById("barChart");
    const pieCanvas = document.getElementById("pieChart");

    // Bar Chart export
    const barImage = barCanvas.toDataURL("image/png");
    const barLink = document.createElement("a");
    barLink.href = barImage;
    barLink.download = "bar_chart.png";
    barLink.click();

    // Pie Chart export
    const pieImage = pieCanvas.toDataURL("image/png");
    const pieLink = document.createElement("a");
    pieLink.href = pieImage;
    pieLink.download = "pie_chart.png";
    pieLink.click();
});

