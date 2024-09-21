const userForm = document.getElementById("user-form");
const quizContainer = document.getElementById("quiz-container");
const questionElement = document.getElementById("question");
const answerButtonsElement = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");
const timerElement = document.getElementById("timer");
const explanationContainer = document.querySelector(".explanation-container");
const resultsElement = document.getElementById("results");
const scoreElement = document.getElementById("score");
const totalTimeElement = document.getElementById("total-time");
const questionTimesElement = document.getElementById("question-times");
const registrationLink = document.getElementById("registration-link");
const failMessage = document.getElementById("fail-message");
const retryButton = document.getElementById("retry-btn");

let currentQuestionIndex = 0;
let score = 0;
let timer;
let questionStartTime;
let totalTime = 0;
let questionTimes = [];
let quizStartTime;

document.getElementById("details-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const rollNumber = document.getElementById("roll-number").value;
    const phone = document.getElementById("phone").value;
    const branch = document.getElementById("branch").value;

    if (name && rollNumber && phone && branch) {
        const userInfo = { name, rollNumber, phone, branch };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        userForm.style.display = "none";
        quizContainer.style.display = "block";
        startQuiz();
    } else {
        alert("Please provide all the required information.");
    }
});
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    totalTime = 0;
    questionTimes = [];
    timerElement.style.display = "block";
    nextButton.innerHTML = "Next";
    resultsElement.style.display = "none";
    quizContainer.style.display = "block";
    quizStartTime = new Date();
    showQuestion();
}

function showQuestion() {
    resetState();
    const currentQuestion = questions[currentQuestionIndex];
    questionElement.innerText = currentQuestion.question;

    currentQuestion.answer.forEach(answer => {
        const button = document.createElement("button");
        button.innerText = answer.text;
        button.classList.add("btn");
        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        button.addEventListener("click", selectAnswer);
        answerButtonsElement.appendChild(button);
    });

    startTimer();
}

function resetState() {
    clearInterval(timer);
    nextButton.style.display = "none";
    explanationContainer.style.display = "none";
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
}

function startTimer() {
    let time = 0;
    questionStartTime = Date.now();
    timer = setInterval(() => {
        time++;
        timerElement.innerText = formatTime(time);
    }, 1000);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function selectAnswer(e) {
    const selectedBtn = e.target;
    const isCorrect = selectedBtn.dataset.correct === "true";
    clearInterval(timer);

    if (isCorrect) {
        selectedBtn.classList.add("correct");
        score++;
    } else {
        selectedBtn.classList.add("incorrect");
    }

    Array.from(answerButtonsElement.children).forEach(button => {
        if (button.dataset.correct === "true") {
            button.classList.add("correct");
        }
        button.disabled = true;
        button.style.cursor = "not-allowed";
    });

    const questionTime = Math.round((Date.now() - questionStartTime) / 1000);
    questionTimes.push(questionTime);
    totalTime += questionTime;

    explanationContainer.style.display = "block";
    explanationContainer.querySelector(".explanation").innerHTML = questions[currentQuestionIndex].explanation;

    nextButton.style.display = "block";
}

function showResults() {
    resetState();
    quizContainer.style.display = "none";
    resultsElement.style.display = "block";
    scoreElement.innerText = `You scored ${score} out of ${questions.length}!`;
    totalTimeElement.innerText = `Total time: ${formatTime(totalTime)}`;

    timerElement.style.display = "none";

    if (score >= 10) {
        registrationLink.style.display = "block";
        failMessage.style.display = "none";
    } else {
        registrationLink.style.display = "none";
        failMessage.style.display = "block";
    }

    retryButton.style.display = "block";
    retryButton.addEventListener("click", () => {
        resultsElement.style.display = "none";
        userForm.style.display = "block";
    });

    sendResultsToSheet();
}

function sendResultsToSheet() {
    const quizEndTime = new Date();
    const formData = new FormData();
    const storedUser = JSON.parse(localStorage.getItem('userInfo'));

    if (storedUser) {
        formData.append('name', storedUser.name);
        formData.append('roll_number', storedUser.rollNumber);
        formData.append('phone', storedUser.phone);
        formData.append('branch', storedUser.branch);
    }

    formData.append('context', document.getElementById("context").textContent);
    formData.append('total_questions', questions.length);
    formData.append('correct_questions', score);

    const sheetID = 'AKfycbzUs1Vv04Gv6HzWhslb9AxB8dNR31Y4UZWJpCPY1qYai8Xus_yGqX2b22niBIIGv-ytlQ';
    const scriptURL = `https://script.google.com/macros/s/AKfycbxusYsl3figkZgvnnRga1bF-Pl8QOtNBP7KRs-jOszfkEbMAhWkSSJfUtt1INmmnznZdg/exec`;

    fetch(scriptURL, { method: 'POST', body: formData })
        .then(response => console.log('Success!'))
        .catch(error => console.error('Error!', error));
}

nextButton.addEventListener("click", () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showResults();
    }
});

// Start the quiz when the page loads
document.addEventListener('DOMContentLoaded', function() {
    const storedUser = JSON.parse(localStorage.getItem('userInfo'));
    if (storedUser && storedUser.name && storedUser.rollNumber && storedUser.branch) {
        userForm.style.display = "none";
        quizContainer.style.display = "block";
        startQuiz();
    } else {
        userForm.style.display = "block";
        quizContainer.style.display = "none";
    }
});